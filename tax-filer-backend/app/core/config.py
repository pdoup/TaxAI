import os.path

from dotenv import load_dotenv
from pydantic import ConfigDict, field_validator
from pydantic_settings import BaseSettings

from app.core.logging_config import app_logger

dotenv_main_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"
)
if os.path.exists(dotenv_main_path):
    load_dotenv(dotenv_path=dotenv_main_path, override=True)
else:  # Fallback if script is run from a different context or for Pydantic to find it
    app_logger.info(".env file not present, reading secrets from environment")
    load_dotenv(override=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Intelligent Tax Filing API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "API for the Intelligent Tax Filing Web Application, providing AI-driven tax advice."
    )
    API_V1_STR: str = "/api/v1"
    OPENAI_API_KEY: str
    LOG_LEVEL: str = "INFO"
    DEFAULT_OPENAI_MODEL: str = "gpt-4-turbo"
    OPENAI_MODEL_NAME: str = os.getenv("OPENAI_MODEL_NAME", DEFAULT_OPENAI_MODEL)
    model_config = ConfigDict(
        extra="allow", env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )

    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_openai_api_key(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError(
                "OPENAI_API_KEY must be a non-empty string and present in your .env file."
            )
        return v


settings = Settings()
print(
    f"Loaded settings: OpenAI Key Present: {'Yes' if settings.OPENAI_API_KEY else 'No'} (Model: {settings.OPENAI_MODEL_NAME})"
)  # For debugging
