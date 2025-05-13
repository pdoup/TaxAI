from contextvars import ContextVar

# tax-filer-backend/app/middleware/request_id_middleware.py
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# ContextVar to hold the request ID
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Get X-Request-ID from header, or generate a new one
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())

        # Set the request_id in the ContextVar
        token = request_id_var.set(request_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        # Reset the ContextVar after the request is done
        request_id_var.reset(token)
        return response


def get_request_id() -> str | None:
    return request_id_var.get()
