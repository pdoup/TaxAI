from datetime import timedelta

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.core.logging_config import app_logger
from app.models import TokenResponse
from app.utils.auth_utils import create_access_token

router = APIRouter()


@router.get(
    "/request-token",
    response_model=TokenResponse,
    summary="Request a new JWT Access Token",
    tags=["Auth"],
)
async def request_new_jwt_token():
    """
    Generates and returns a new JWT access token.
    Clients should request this token once (e.g., on application load) and use it
    in the Authorization header for subsequent protected API calls.
    """
    try:
        token_payload_data = {"type": "anonymous_session"}

        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_jwt = create_access_token(
            data=token_payload_data, expires_delta=expires_delta
        )

        app_logger.info(
            f"Issuing new JWT access token. Expires in {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes."
        )
        return TokenResponse(access_token=access_token_jwt)
    except Exception as e:
        app_logger.error(f"Error generating JWT token: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate access token due to an internal error.",
        )
