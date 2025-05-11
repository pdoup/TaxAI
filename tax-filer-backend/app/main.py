from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.routers import tax_info
from app.core.config import settings
from app.core.logging_config import app_logger
from contextlib import asynccontextmanager

if settings.LOG_LEVEL:
    app_logger.setLevel(settings.LOG_LEVEL.upper())


@asynccontextmanager
async def lifespan(app: FastAPI):
    app_logger.info("Application startup: FastAPI server is starting.")
    app_logger.info(f"Project Name: {settings.PROJECT_NAME}")
    yield
    app_logger.info("Application shutdown: FastAPI server is stopping.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="0.2.0",
    description="API for the Intelligent Tax Filing Web Application, providing AI-driven tax advice.",
    lifespan=lifespan,
)


@app.exception_handler(Exception)  # Generic exception handler
async def generic_exception_handler(request: Request, exc: Exception):
    app_logger.error(
        f"Unhandled exception during request to {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An internal server error occurred."},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log the detailed validation errors
    app_logger.warning(
        f"Request validation error for {request.url.path}: {exc.errors()}"
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost",  # For local development
    "http://localhost:3000",  # Default Create React App port
    # "https://some-frontend-domain.com", # For production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["content-type", "authorization"],
)

# Include routers
app.include_router(
    tax_info.router, prefix=f"{settings.API_V1_STR}/tax", tags=["Tax AI Services"]
)


# Basic root endpoint
@app.get("/", summary="Root Endpoint")
async def root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}! Docs at /docs"}


class UnicornException(Exception):
    def __init__(self, name: str, detail: str):
        self.name = name
        self.detail = detail


@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something. Details: {exc.detail}"},
    )


# To run locally (for development without Docker):
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
