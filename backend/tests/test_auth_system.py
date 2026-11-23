import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from main import app
from database.db import get_connection, init_db
from auth.security import hash_password, verify_password, decode_token

client = TestClient(app)

def test_auth_full_lifecycle():
    init_db()

    # 1. Register a new user
    reg_payload = {
        "email": "auditor.test@nexusdoc.ai",
        "password": "SecurePassword#2026",
        "name": "Audit Officer Vega",
        "organization": "Astraea Federal AI"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
    reg_data = reg_resp.json()
    assert reg_data["success"] is True
    assert reg_data["user"]["email"] == "auditor.test@nexusdoc.ai"
    assert "session" in reg_data
    token = reg_data["session"]["token"]
    assert token, "Token must be returned on register"

    # 2. Duplicate registration should be rejected with 409
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 409

    # 3. Weak password should be rejected with 422
    weak_resp = client.post("/api/auth/register", json={
        "email": "weak@nexusdoc.ai",
        "password": "123",
        "name": "Weak User"
    })
    assert weak_resp.status_code == 422

    # 4. Login with correct credentials
    login_resp = client.post("/api/auth/login", json={
        "email": "auditor.test@nexusdoc.ai",
        "password": "SecurePassword#2026",
        "remember_me": True
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["success"] is True
    assert login_data["user"]["name"] == "Audit Officer Vega"
    login_token = login_data["session"]["token"]

    # 5. Login with invalid password rejected with 401
    bad_login = client.post("/api/auth/login", json={
        "email": "auditor.test@nexusdoc.ai",
        "password": "WrongPassword!999"
    })
    assert bad_login.status_code == 401

    # 6. Access protected profile /api/auth/me with Bearer token
    headers = {"Authorization": f"Bearer {login_token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["user"]["email"] == "auditor.test@nexusdoc.ai"

    # 7. Access /api/auth/me without token -> 401 Unauthorized
    unauth_resp = client.get("/api/auth/me")
    assert unauth_resp.status_code == 401

    # 8. Forgot password flow
    forgot_resp = client.post("/api/auth/forgot-password", json={"email": "auditor.test@nexusdoc.ai"})
    assert forgot_resp.status_code == 200
    reset_token = forgot_resp.json().get("token_preview")
    assert reset_token is not None

    # 9. Reset password with recovery token
    reset_resp = client.post("/api/auth/reset-password", json={
        "email": "auditor.test@nexusdoc.ai",
        "token": reset_token,
        "new_password": "NewUpdatedPassword#2026"
    })
    assert reset_resp.status_code == 200

    # 10. Login with new password
    new_login = client.post("/api/auth/login", json={
        "email": "auditor.test@nexusdoc.ai",
        "password": "NewUpdatedPassword#2026"
    })
    assert new_login.status_code == 200

    # 11. Old password should fail
    old_login = client.post("/api/auth/login", json={
        "email": "auditor.test@nexusdoc.ai",
        "password": "SecurePassword#2026"
    })
    assert old_login.status_code == 401

    # 12. Logout
    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    print("[PASS] Full Authentication Lifecycle verified successfully.")
