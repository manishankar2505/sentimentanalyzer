import sqlite3
import os
import tempfile
import bcrypt
import requests
import json
from datetime import datetime

CLOUD_STORE_URL = "https://api.restful-api.dev/objects/ff8081819ff5b11001a023dd65a56b64"

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

def sync_from_cloud():
    """Sync registered evaluators from the central cloud registry into local SQLite."""
    try:
        res = requests.get(CLOUD_STORE_URL, timeout=4)
        if res.status_code == 200:
            data = res.json().get("data", {}).get("users", [])
            if data:
                conn = get_db()
                cursor = conn.cursor()
                for u in data:
                    pwd = u.get("password_hash") or hash_password("evaluator123")
                    cursor.execute(
                        "INSERT OR IGNORE INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                        (u.get("name"), u.get("email").lower().strip(), pwd, u.get("created_at", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
                    )
                conn.commit()
                conn.close()
    except Exception as e:
        print(f"Cloud sync notice: {e}")

def sync_to_cloud(user_obj):
    """Save newly registered evaluator to the global cloud database."""
    try:
        current_users = []
        try:
            res = requests.get(CLOUD_STORE_URL, timeout=4)
            if res.status_code == 200:
                current_users = res.json().get("data", {}).get("users", [])
        except Exception:
            current_users = []

        exists = any(u.get("email", "").lower() == user_obj["email"].lower() for u in current_users)
        if not exists:
            current_users.insert(0, user_obj)
            requests.put(
                CLOUD_STORE_URL,
                json={
                    "name": "sentiment_analyzer_user_registry",
                    "data": {"users": current_users}
                },
                timeout=4
            )
    except Exception as e:
        print(f"Cloud push notice: {e}")

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
    conn.commit()
    conn.close()
    print(f"SQLite database initialized at {DB_PATH}")
    sync_from_cloud()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

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

    user_record = {
        "id": user_id,
        "name": clean_name,
        "email": clean_email,
        "password_hash": hashed,
        "created_at": now_str
    }
    
    sync_to_cloud(user_record)

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

    try:
        res = requests.get(CLOUD_STORE_URL, timeout=3)
        if res.status_code == 200:
            cloud_users = res.json().get("data", {}).get("users", [])
            for cu in cloud_users:
                if cu.get("email", "").lower().strip() == clean_email:
                    conn = get_db()
                    cursor = conn.cursor()
                    cursor.execute(
                        "INSERT OR IGNORE INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                        (cu.get("name"), clean_email, cu.get("password_hash"), cu.get("created_at"))
                    )
                    conn.commit()
                    conn.close()
                    return cu
    except Exception:
        pass

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
    2-Way Global Synchronization:
    Merges all users from the cloud store AND local SQLite so zero accounts are missed.
    """
    merged_map = {}

    # 1. Fetch Cloud Store Users (Global)
    try:
        res = requests.get(CLOUD_STORE_URL, timeout=4)
        if res.status_code == 200:
            cloud_users = res.json().get("data", {}).get("users", [])
            for idx, u in enumerate(cloud_users):
                email_key = u.get("email", "").lower().strip()
                if email_key:
                    merged_map[email_key] = {
                        "id": u.get("id", idx + 1),
                        "name": u.get("name", "User"),
                        "email": email_key,
                        "created_at": u.get("created_at", "")
                    }
    except Exception:
        pass

    # 2. Fetch Local SQLite Users
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY id DESC")
        local_users = [dict(r) for r in cursor.fetchall()]
        conn.close()
        for u in local_users:
            email_key = u.get("email", "").lower().strip()
            if email_key and email_key not in merged_map:
                merged_map[email_key] = {
                    "id": u.get("id"),
                    "name": u.get("name", "User"),
                    "email": email_key,
                    "created_at": u.get("created_at", "")
                }
    except Exception:
        pass

    # Convert to list ordered by ID
    user_list = list(merged_map.values())
    return user_list
