from fastapi import APIRouter, Body, HTTPException

from app.core.config import Settings
from app.core.config import settings as app_settings
from app.core.logging_config import app_logger
from app.models import AppInfo, TaxAdviceResponse, TaxInfoInput
from app.services.ai_service import get_tax_advice_from_ai

router = APIRouter()


def get_settings() -> Settings:
    return app_settings


@router.post(
    "/submit-advice",
    response_model=TaxAdviceResponse,
    summary="Submit Tax Info for AI Advice",
)
async def submit_tax_info_and_get_advice(
    tax_input: TaxInfoInput = Body(...),
):
    """
    Receives user's tax information, processes it (e.g., validation),
    sends it to an AI model via `ai_service`, and returns the generated tax advice.

    - **income**: User's annual income (must be > 0).
    - **expenses**: User's total deductible expenses (must be >= 0).
    - **deductions**: User's other claimed deductions (optional, >= 0).
    - **country**: User's country of residence for tax purposes.
    """
    # Pydantic performs initial validation based on model definitions.
    app_logger.info(
        f"Received tax info submission for country: {tax_input.country}, income: {tax_input.income}"
    )
    try:
        ai_advice = await get_tax_advice_from_ai(tax_input)

        if (
            "Could not retrieve AI-powered advice" in ai_advice
            or "An unexpected error occurred" in ai_advice
        ):
            # This indicates an error from the AI service itself.
            # We might want to return a different HTTP status code or a more structured error.
            # For now, we pass the error message through the 'advice' field.
            app_logger.warning(
                f"AI service returned an error for input: {tax_input.model_dump()}. Advice: {ai_advice}"
            )
            return TaxAdviceResponse(
                message="Processed tax information, but encountered an issue getting AI advice.",
                advice=ai_advice,
                raw_input=tax_input,
            )
        app_logger.info(
            f"Successfully generated AI advice for country: {tax_input.country}"
        )
        return TaxAdviceResponse(
            message="Tax information processed and AI advice retrieved successfully.",
            advice=ai_advice,
            raw_input=tax_input,
        )
    except HTTPException:  # Re-raise HTTPExceptions
        raise
    except Exception as e:
        app_logger.error(
            f"Error processing tax advice for input {tax_input.dict()}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500, detail=f"An internal server error occurred: {str(e)}"
        )


@router.get(
    "/info", response_model=AppInfo, summary="Get Instance Info", tags=["System"]
)
async def get_app_info():
    app_logger.info("Fetching application info.")
    return AppInfo(
        project_name=app_settings.PROJECT_NAME,
        version=app_settings.VERSION,
        description=app_settings.DESCRIPTION,
        default_openai_model=app_settings.DEFAULT_OPENAI_MODEL,
        configured_openai_model=app_settings.OPENAI_MODEL_NAME,
        api=app_settings.API_V1_STR,
    )


@router.get("/health", summary="Health Check")
async def health_check():
    """
    Simple health check endpoint.
    """
    return {"status": "healthy", "message": "Backend is running!"}
