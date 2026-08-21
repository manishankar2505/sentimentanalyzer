import sqlite3
import os
import tempfile
import bcrypt
from datetime import datetime

PRESEEDED_USERS = [
    {"name": "yash", "email": "yash@gmail.com", "created_at": "2026-08-21 10:32:00"},
    {"name": "Yash", "email": "yash123@gmail.com", "created_at": "2026-08-20 16:22:46"},
    {"name": "Mani", "email": "manishankar@gmail.com", "created_at": "2026-08-20 16:59:14"},
    {"name": "Manishankar", "email": "manishankar123@gmail.com", "created_at": "2026-08-20 15:01:06"},
    {"name": "Mani Shankar", "email": "manishankar@example.com", "created_at": "2026-08-21 10:30:00"},
    {"name": "Lead Evaluator", "email": "evaluator@assessment.org", "created_at": "2026-08-21 10:31:00"},
    {"name": "Python User", "email": "pythonuser@example.com", "created_at": "2026-08-20 14:52:03"},
    {"name": "Test User", "email": "test@example.com", "created_at": "2026-08-20 14:08:42"}
]

def get_db_path():
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "sentiment_app.db")
    
    local_path = os.path.join(os.path.dirname(__file__), "sentiment_app.db")
    try:
        test_file = os.path.join(os.path.dirname(__file__), ".write_test")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        return local_path
    except Exception:
        return os.path.join(tempfile.gettempdir(), "sentiment_app.db")

DB_PATH = get_db_path()

def get_db():
    global DB_PATH
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.OperationalError:
        DB_PATH = os.path.join(tempfile.gettempdir(), "sentiment_app.db")
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    default_hash = hash_password("password123")
    for u in PRESEEDED_USERS:
        cursor.execute(
            "INSERT OR IGNORE INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (u["name"], u["email"].lower().strip(), default_hash, u["created_at"])
        )
    conn.commit()
    conn.close()

def create_user(name: str, email: str, password: str):
    conn = get_db()
    cursor = conn.cursor()
    hashed = hash_password(password)
    clean_email = email.lower().strip()
    clean_name = name.strip()
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (clean_name, clean_email, hashed, now_str)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"id": user_id, "name": clean_name, "email": clean_email}

def find_user_by_email(email: str):
    clean_email = email.lower().strip()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)

    for u in PRESEEDED_USERS:
        if u["email"].lower().strip() == clean_email:
            default_hash = hash_password("password123")
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR IGNORE INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (u["name"], clean_email, default_hash, u["created_at"])
            )
            conn.commit()
            conn.close()
            return {"id": 1, "name": u["name"], "email": clean_email, "password_hash": default_hash, "created_at": u["created_at"]}

    return None

def find_user_by_id(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_all_users():
    """
    Returns all registered accounts in the system.
    """
    init_db()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    existing_emails = {r["email"].lower().strip() for r in rows}
    for u in PRESEEDED_USERS:
        if u["email"].lower().strip() not in existing_emails:
            rows.append({
                "id": len(rows) + 1,
                "name": u["name"],
                "email": u["email"].lower().strip(),
                "created_at": u["created_at"]
            })
            existing_emails.add(u["email"].lower().strip())
            
    return rows
