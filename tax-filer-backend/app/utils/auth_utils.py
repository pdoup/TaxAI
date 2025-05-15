# tax-filer-backend/app/utils/auth_utils.py
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.core.logging_config import app_logger

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="api/v1/token/request-token"
)  # tokenUrl is nominal here


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a new JWT access token.
    The 'data' dictionary will be encoded into the token's payload.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.now(timezone.utc),  # Issued at
            "jti": str(uuid.uuid4()),  # JWT ID, unique for each token
        }
    )

    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    app_logger.debug(
        f"Created JWT with jti: {to_encode['jti']}, expires: {expire.isoformat()}"
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT.
    Returns the token payload if valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        app_logger.debug(f"Successfully decoded JWT with jti: {payload.get('jti')}")
        return payload
    except JWTError as e:
        app_logger.warning(
            f"JWT decoding/validation error: {e} for token: {token[:20]}..."
        )  # Log only part of token
        return None


# --- FastAPI Dependency for JWT Validation ---
async def get_current_session_payload(
    request: Request,  # To potentially log client IP if needed, or for future use
    token: str = Depends(
        oauth2_scheme
    ),  # Extracts token from "Authorization: Bearer <token>"
) -> Dict[str, Any]:
    """
    FastAPI dependency to validate the JWT from the Authorization header.
    Returns the token payload if valid, otherwise raises HTTPException.
    This represents an "active session" even if anonymous.
    """
    payload = decode_access_token(token)
    if payload is None:
        app_logger.warning(
            f"Invalid JWT token received from IP: {request.client.host if request.client else 'unknown'}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    app_logger.info(
        f"JWT validated for session (jti: {payload.get('jti')}) from IP: {request.client.host if request.client else 'unknown'}"
    )
    return payload
