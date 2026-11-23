import os
import secrets
import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError, InvalidHashError
    _ph = PasswordHasher(
        time_cost=2,
        memory_cost=65536,
        parallelism=2,
        hash_len=32,
        salt_len=16
    )
    _USE_ARGON2 = True
except ImportError:
    _USE_ARGON2 = False
    import bcrypt

# Secure Server Secret Key
JWT_SECRET_KEY = os.getenv("NEXUS_JWT_SECRET", "nexus_doc_ai_enterprise_super_secure_vault_token_key_2026")
JWT_ALGORITHM = "HS256"
DEFAULT_EXPIRATION_MINUTES = 60 * 24  # 24 hours
REMEMBER_ME_EXPIRATION_DAYS = 7       # 7 days

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Securely hash password using Argon2id (or bcrypt as fallback)."""
    if not password or len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")
    if _USE_ARGON2:
        return _ph.hash(password)
    else:
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored Argon2id or bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith("$argon2"):
            if _USE_ARGON2:
                try:
                    return _ph.verify(hashed_password, plain_password)
                except (VerifyMismatchError, InvalidHashError):
                    return False
            return False
        elif hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            import bcrypt
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        else:
            return False
    except Exception:
        return False

def validate_password_strength(password: str) -> Dict[str, Any]:
    """
    Validates password strength criteria:
    - Minimum length: 8 characters
    - Contains at least 1 digit or special character
    - Contains uppercase and lowercase
    """
    score = 0
    feedback = []

    if len(password) >= 8:
        score += 1
    else:
        feedback.append("At least 8 characters required")

    if re.search(r"[A-Z]", password) and re.search(r"[a-z]", password):
        score += 1
    else:
        feedback.append("Uppercase and lowercase letters required")

    if re.search(r"\d", password):
        score += 1
    else:
        feedback.append("At least one number required")

    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        score += 1
    else:
        feedback.append("Special character recommended")

    level = "weak"
    if score >= 4:
        level = "very_strong"
    elif score == 3:
        level = "strong"
    elif score == 2:
        level = "medium"

    return {
        "score": score,
        "level": level,
        "is_valid": len(password) >= 8,
        "feedback": feedback
    }

def create_access_token(user_id: str, email: str, name: str, role: str = "analyst", remember_me: bool = False) -> Dict[str, Any]:
    """Generates a cryptographic JWT token with subject and expiration."""
    now = datetime.now(timezone.utc)
    if remember_me:
        expires_delta = timedelta(days=REMEMBER_ME_EXPIRATION_DAYS)
    else:
        expires_delta = timedelta(minutes=DEFAULT_EXPIRATION_MINUTES)

    expires_at = now + expires_delta

    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
        "remember_me": remember_me
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return {
        "token": token,
        "token_type": "Bearer",
        "expires_at": expires_at.isoformat(),
        "expires_in_seconds": int(expires_delta.total_seconds())
    }

def decode_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token signature and expiration."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid cryptographic authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Optional[Dict[str, Any]]:
    """Retrieves current user if token present, or None if omitted."""
    if not credentials or not credentials.credentials:
        return None
    token = credentials.credentials
    try:
        return decode_token(token)
    except HTTPException:
        return None

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    """Strictly requires a valid authenticated user Bearer token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(credentials.credentials)
