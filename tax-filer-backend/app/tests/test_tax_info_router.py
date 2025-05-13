from fastapi import status
from httpx import ASGITransport, AsyncClient
import pytest
import pytest_asyncio

from app.core.config import settings
from app.main import app  # Main FastAPI application instance


@pytest_asyncio.fixture(scope="module")
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testclient") as client:
        yield client


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/api/v1/tax/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "healthy", "message": "Backend is running!"}


@pytest.mark.asyncio
async def test_get_application_info(async_client: AsyncClient):
    """
    Test the /api/v1/tax/info endpoint to ensure it returns correct
    application configuration details.
    """
    response = await async_client.get("/api/v1/tax/info")

    assert response.status_code == status.HTTP_200_OK

    response_data = response.json()

    # Assert against the values imported your app.config.settings
    assert response_data["project_name"] == settings.PROJECT_NAME
    assert response_data["version"] == settings.VERSION
    assert response_data["description"] == settings.DESCRIPTION
    assert response_data["default_openai_model"] == settings.DEFAULT_OPENAI_MODEL
    assert response_data["configured_openai_model"] == settings.OPENAI_MODEL_NAME
    assert response_data["api"] == settings.API_V1_STR

    # Ensure no sensitive data is exposed (e.g., API keys)
    assert "OPENAI_API_KEY" not in response_data


@pytest.mark.asyncio
async def test_submit_tax_info_valid(async_client: AsyncClient, mocker):
    # Mock the AI service to avoid actual OpenAI calls and costs during unit/integration tests
    mocker.patch(
        "app.routers.tax_info.get_tax_advice_from_ai",
        return_value="Mocked AI advice: Based on your input...",
        new_callable=mocker.AsyncMock,
    )

    test_payload = {
        "income": 50000.0,
        "expenses": 10000.0,
        "deductions": 2000.0,
        "country": "Testland",
    }
    response = await async_client.post("/api/v1/tax/submit-advice", json=test_payload)
    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert (
        response_data["message"]
        == "Tax information processed and AI advice retrieved successfully."
    )
    assert response_data["advice"] == "Mocked AI advice: Based on your input..."
    assert response_data["raw_input"]["income"] == test_payload["income"]


@pytest.mark.asyncio
async def test_submit_tax_info_invalid_input_negative_income(async_client: AsyncClient):
    test_payload = {
        "income": -100.0,  # Invalid
        "expenses": 10000.0,
        "deductions": 2000.0,
        "country": "Testland",
    }
    response = await async_client.post("/api/v1/tax/submit-advice", json=test_payload)
    assert (
        response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    )  # Pydantic validation error


@pytest.mark.asyncio
async def test_submit_tax_info_ai_service_failure(async_client: AsyncClient, mocker):
    mocker.patch(
        "app.routers.tax_info.get_tax_advice_from_ai",
        return_value="Could not retrieve AI-powered advice at this moment due to an API error: Mocked Error.",
        new_callable=mocker.AsyncMock,
    )
    test_payload = {
        "income": 60000.0,
        "expenses": 5000.0,
        "deductions": 1000.0,
        "country": "Testlandia",
    }
    response = await async_client.post("/api/v1/tax/submit-advice", json=test_payload)
    assert response.status_code == status.HTTP_200_OK
    response_data = response.json()
    assert (
        "Processed tax information, but encountered an issue getting AI advice."
        in response_data["message"]
    )
    assert "Could not retrieve AI-powered advice" in response_data["advice"]
