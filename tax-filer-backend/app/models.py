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
