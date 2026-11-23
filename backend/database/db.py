import sqlite3
import json
import os
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "nexus_docs.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        filepath TEXT,
        uploaded_at TEXT NOT NULL,
        status TEXT NOT NULL,
        vendor_name TEXT,
        invoice_number TEXT,
        invoice_date TEXT,
        due_date TEXT,
        subtotal REAL,
        tax_amount REAL,
        total_amount REAL,
        currency TEXT DEFAULT 'USD',
        confidence_overall REAL,
        risk_level TEXT,
        perception_data TEXT,
        layout_data TEXT,
        validation_data TEXT,
        items_data TEXT,
        human_verified INTEGER DEFAULT 0,
        human_notes TEXT DEFAULT '',
        corrected_fields TEXT DEFAULT '{}'
    )
    """)

    # Gracefully add new columns if they do not exist
    cursor.execute("PRAGMA table_info(documents)")
    existing_cols = {row["name"] for row in cursor.fetchall()}

    new_cols = [
        ("gstin", "TEXT DEFAULT ''"),
        ("preview_url", "TEXT DEFAULT ''"),
        ("duplicate_data", "TEXT DEFAULT '{}'"),
        ("cross_model_status", "TEXT DEFAULT 'PENDING_SECONDARY_EXTRACTOR'"),
        ("cross_model_agreement", "REAL DEFAULT NULL"),
        ("cross_model_data", "TEXT DEFAULT '{}'")
    ]
    for col_name, col_def in new_cols:
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE documents ADD COLUMN {col_name} {col_def}")
            except sqlite3.OperationalError:
                pass

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT,
        FOREIGN KEY(doc_id) REFERENCES documents(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'lead_analyst',
        organization TEXT DEFAULT 'Nexus AI Enterprise',
        created_at TEXT NOT NULL,
        last_login TEXT,
        reset_token TEXT,
        reset_token_expires TEXT
    )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")

    # Seed default enterprise demonstration account if none exists
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    if user_count == 0:
        import uuid
        from datetime import datetime
        try:
            from auth.security import hash_password
            default_pw_hash = hash_password("NexusDocAI#2026!")
            cursor.execute("""
                INSERT INTO users (id, email, name, password_hash, role, organization, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f"usr_{uuid.uuid4().hex[:10]}",
                "analyst@nexusdoc.ai",
                "Senior Document Auditor",
                default_pw_hash,
                "lead_analyst",
                "Astraea Financial Operations",
                datetime.now().isoformat()
            ))
        except Exception as e:
            print(f"Warning: Could not seed default user: {e}")

    conn.commit()
    conn.close()
