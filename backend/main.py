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

from fastapi.responses import HTMLResponse
import sqlite3
from database import get_db, DB_PATH

@app.get("/api/admin/db-inspect")
def inspect_db_json():
    """
    Returns full database schema and all table contents in JSON.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall() if t[0] != "sqlite_sequence"]
        
        result = {"db_path": DB_PATH, "tables": {}}
        for t in tables:
            cursor.execute(f"SELECT * FROM {t}")
            rows = cursor.fetchall()
            result["tables"][t] = [dict(r) for r in rows]
        conn.close()
        return result
    except Exception as e:
        return {"error": str(e), "db_path": DB_PATH}

@app.get("/api/admin/db-viewer", response_class=HTMLResponse)
def database_viewer_html():
    """
    Visual web UI to navigate and inspect database contents live in the browser.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY id DESC;")
        users = cursor.fetchall()
        
        db_size = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
        conn.close()

        user_rows = ""
        for u in users:
            user_rows += f"""
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 font-mono font-bold text-slate-700">#{u['id']}</td>
                <td class="py-3 px-4 font-medium text-slate-900">{u['name']}</td>
                <td class="py-3 px-4 text-sky-600 font-mono">{u['email']}</td>
                <td class="py-3 px-4 text-slate-500 text-sm">{u['created_at']}</td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Account
                    </span>
                </td>
            </tr>
            """

        if not user_rows:
            user_rows = '<tr><td colspan="5" class="py-8 text-center text-slate-400">No users registered yet in this instance.</td></tr>'

        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>SQLite Database Viewer — Sentiment Analyzer</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>body {{ font-family: 'Inter', sans-serif; }}</style>
        </head>
        <body class="bg-slate-100 min-h-screen py-10 px-4">
            <div class="max-w-5xl mx-auto space-y-6">
                <!-- Header -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="p-2 bg-sky-50 text-sky-600 rounded-xl font-bold">🗄️</span>
                            <h1 class="text-xl font-bold text-slate-900">SQLite Cloud Database Inspector</h1>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">Live database browser running on Vercel Serverless</p>
                    </div>
                    <a href="/api/admin/db-viewer" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition-all">
                        🔄 Refresh Live DB
                    </a>
                </div>

                <!-- Database Metadata Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span class="text-xs text-slate-500 font-medium">Database File Path</span>
                        <div class="text-sm font-mono font-bold text-slate-800 mt-1 truncate" title="{DB_PATH}">{DB_PATH}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span class="text-xs text-slate-500 font-medium">Database Size</span>
                        <div class="text-sm font-mono font-bold text-slate-800 mt-1">{db_size:,} bytes (16 KB)</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span class="text-xs text-slate-500 font-medium">Registered User Count</span>
                        <div class="text-sm font-bold text-emerald-600 mt-1">{len(users)} User Accounts</div>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-sky-500"></span>
                            <h2 class="text-sm font-bold text-slate-800">Table: <code class="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">users</code></h2>
                        </div>
                        <a href="/api/admin/db-inspect" target="_blank" class="text-xs text-sky-600 hover:text-sky-700 font-medium">View Raw JSON ↗</a>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th class="py-3 px-4">ID</th>
                                    <th class="py-3 px-4">Full Name</th>
                                    <th class="py-3 px-4">Email Address</th>
                                    <th class="py-3 px-4">Registration Date</th>
                                    <th class="py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                {user_rows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Quick Navigation Links -->
                <div class="flex items-center justify-between text-xs text-slate-500 px-2">
                    <a href="https://sentimentanalyzer-xi.vercel.app" class="hover:text-slate-900">← Back to Sentiment Analyzer App</a>
                    <a href="/api/admin/debug-tmp" class="hover:text-slate-900">View /tmp Directory Files →</a>
                </div>
            </div>
        </body>
        </html>
        """
        return html_content
    except Exception as e:
        return f"<h1>Error loading database:</h1><p>{str(e)}</p>"

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
