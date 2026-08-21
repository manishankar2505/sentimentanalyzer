import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

from database import init_db, create_user, find_user_by_email, find_user_by_id, verify_password, get_all_users
from cerebras_client import analyze_with_cerebras

load_dotenv()

app = FastAPI(title="Sentiment Analysis API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "sentiment_analyzer_jwt_secret_key_default")
JWT_ALGORITHM = "HS256"

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AnalyzeTextRequest(BaseModel):
    text: str
    apiKey: Optional[str] = None
    model: Optional[str] = None

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token required")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        user = find_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

# --- AUTH ROUTES ---

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    existing = find_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    new_user = create_user(req.name, req.email, req.password)
    token = create_access_token({"id": new_user["id"], "email": new_user["email"], "name": new_user["name"]})

    return {
        "message": "Registration successful",
        "user": new_user,
        "token": token
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = find_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"id": user["id"], "email": user["email"], "name": user["name"]})

    return {
        "message": "Login successful",
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
        "token": token
    }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@app.get("/api/admin/users")
def get_registered_users():
    """
    View all registered accounts (id, name, email, created_at).
    """
    users = get_all_users()
    return {
        "total_users": len(users),
        "users": users
    }

@app.get("/api/admin/debug-tmp")
def inspect_tmp_directory():
    """
    Inspect files inside the serverless /tmp directory.
    """
    import tempfile
    tmp_dir = tempfile.gettempdir()
    files_list = []
    
    try:
        for f in os.listdir(tmp_dir):
            file_path = os.path.join(tmp_dir, f)
            stat = os.stat(file_path)
            files_list.append({
                "filename": f,
                "size_bytes": stat.st_size,
                "path": file_path,
                "is_file": os.path.isfile(file_path)
            })
    except Exception as e:
        files_list = [{"error": str(e)}]
        
    return {
        "temp_directory_path": tmp_dir,
        "total_files": len(files_list),
        "files": files_list
    }

from fastapi import Request

# --- ANALYSIS ROUTE ---

@app.post("/api/analyze")
async def analyze(request: Request):
    content_type = request.headers.get("content-type", "")
    transcript_text = ""
    target_api_key = None
    target_model = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        target_api_key = form.get("apiKey")
        target_model = form.get("model")
        
        if uploaded_file and hasattr(uploaded_file, "read"):
            file_bytes = await uploaded_file.read()
            transcript_text = file_bytes.decode("utf-8", errors="ignore")
        elif "text" in form:
            transcript_text = str(form.get("text"))
    else:
        try:
            body = await request.json()
            transcript_text = body.get("text", "")
            target_api_key = body.get("apiKey")
            target_model = body.get("model")
        except Exception:
            transcript_text = ""

    if not transcript_text or not transcript_text.strip():
        raise HTTPException(status_code=400, detail="Please provide conversation text or upload a valid .txt file")

    result = analyze_with_cerebras(transcript_text, target_api_key, target_model)
    
    if result.get("success") is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "The provided text does not appear to be a readable conversation transcript. Please provide clear dialogue (e.g. Agent: ... Customer: ...).")
        )

    return result

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "runtime": "python-fastapi",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "configuredModel": os.getenv("CEREBRAS_MODEL", "gpt-oss-120b")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
