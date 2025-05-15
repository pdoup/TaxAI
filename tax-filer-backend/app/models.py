from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TaxInfoInput(BaseModel):
    income: float = Field(..., gt=0, description="Annual income, must be positive")
    expenses: float = Field(..., ge=0, description="Total deductible expenses")
    deductions: Optional[float] = Field(0, ge=0, description="Other claimed deductions")
    country: str = Field(
        ..., min_length=2, description="Country of residence for tax purposes"
    )
    # More fields in the future...


class TaxAdviceResponse(BaseModel):
    message: str
    advice: Optional[str] = None
    raw_input: Optional[TaxInfoInput] = None  # For debugging


class AppInfo(BaseModel):
    project_name: str
    version: str
    description: str
    default_openai_model: str
    configured_openai_model: str
    api: str


class AIServiceError(str, Enum):
    CONFIG_ERROR = "CONFIG_ERROR"
    API_CONN_ERROR = "API_CONN_ERROR"
    API_LIMIT_EXCEEDED = "API_LIMIT_EXCEEDED"
    INVALID_MODEL = "INVALID_MODEL"
    API_ERROR = "API_ERROR"
    OAI_ERROR = "OAI_ERROR"
    INTERNAL_ERR = "INTERNAL_ERR"

    def __str__(self) -> str:
        return self.value

    @classmethod
    def list(cls):
        return list(map(str, cls))


class AIServiceResponse(BaseModel):
    success: bool
    content: str
    error_type: Optional[AIServiceError] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
