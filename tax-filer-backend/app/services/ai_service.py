from openai import (
    APIConnectionError,
    APIStatusError,
    AsyncOpenAI,
    NotFoundError,
    OpenAIError,
    RateLimitError,
)

from app.core.config import settings
from app.core.logging_config import app_logger
from app.models import TaxInfoInput

# Ensure OpenAI client is initialized safely
try:
    if not settings.OPENAI_API_KEY:
        app_logger.critical(
            "OPENAI_API_KEY not found in settings. AI service will not function."
        )
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
except Exception as e:
    app_logger.critical(f"Failed to initialize OpenAI client: {e}", exc_info=True)
    client = None  # Ensure client is None if initialization fails


async def get_tax_advice_from_ai(tax_data: TaxInfoInput) -> str:
    """
    Sends user tax input to OpenAI (GPT model) and retrieves tax advice.
    """
    prompt = f"""
    You are a helpful AI Tax Assistant providing general tax information.
    This advice is for informational and educational purposes only and NOT a substitute for professional tax advice.
    Do not ask follow-up questions, provide a concise summary based on the input.

    User's Tax Information:
    - Country for Tax Purposes: {tax_data.country}
    - Annual Income: {tax_data.income:,.2f}
    - Work-Related/Business Expenses: {tax_data.expenses:,.2f}
    - Other Claimed Deductions: {tax_data.deductions:,.2f}

    Based on this information for {tax_data.country}, provide some general tax considerations, potential deductions they might explore further,
    or common tax obligations they should be aware of. Keep the advice general and high-level.
    Mention that tax laws vary greatly and change, so consulting a local tax professional is crucial.
    """
    if not client:
        app_logger.error("OpenAI client not initialized. Cannot fetch AI advice.")
        return "AI service is currently unavailable due to a configuration error."
    try:
        app_logger.info(
            f"Sending request to OpenAI for tax advice. Country: {tax_data.country}, Income: {tax_data.income}"
        )
        completion = await client.chat.completions.create(
            model=settings.OPENAI_MODEL_NAME,
            messages=[
                {
                    "role": "developer",
                    "content": "You are an AI assistant providing general tax information.",
                },
                {"role": "user", "content": prompt, "name": "customer"},
            ],
            max_completion_tokens=350,
            temperature=0.6,
            n=1,
            stop=None,
        )
        advice = completion.choices[0].message.content.strip()
        app_logger.info(
            f"Successfully received advice from OpenAI with id={completion.id} ({completion.usage.completion_tokens} tokens)"
        )
        return advice
    except APIConnectionError as e:
        app_logger.error(f"OpenAI API Connection Error: {e}", exc_info=True)
        return "Could not retrieve AI-powered advice at this moment due to a network issue reaching OpenAI."
    except RateLimitError as e:
        app_logger.error(f"OpenAI API Rate Limit Exceeded: {e}", exc_info=True)
        return "AI service is temporarily unavailable due to high demand (rate limit). Please try again later."
    except NotFoundError as e:
        app_logger.error(
            f"OpenAI API error while getting tax advice '{e.code}'. Message: {e.body['message']} (RequestID: {e.request_id})"
        )
        return (
            "Could not retrieve AI-powered advice at this moment due to internal issue"
        )
    except APIStatusError as e:  # Catch other API errors
        app_logger.error(
            f"OpenAI API Status Error (status {e.status_code}): {e.response}",
            exc_info=True,
        )
        return f"Could not retrieve AI-powered advice at this moment due to an API error: {e.status_code}."
    except OpenAIError as e:
        app_logger.error(
            f"OpenAI API Error (status {e.status_code}): {e.response}", exc_info=True
        )
        return f"Could not retrieve AI-powered advice at this moment due to an OpenAI error: {e.status_code}."
    except Exception as e:
        app_logger.error(
            f"Unexpected error when calling OpenAI API: {e}", exc_info=True
        )
        return "An unexpected error occurred while trying to get AI-powered tax advice."
