# Tax Filer Backend (FastAPI)

This is the backend application for the Intelligent Tax Filing Assistant, built with FastAPI.

## Features

- RESTful API endpoints for handling tax form submissions.
- Integration with OpenAI's API to generate tax advice based on user input.
- Pydantic models for data validation and serialization.
- CORS configuration for frontend integration.

## API Endpoints

The base URL for the API is `/api/v1`.

### Main Endpoints (under `/tax` prefix)

-   **`POST /tax/submit-advice`**:
    -   **Description**: Submits user's tax information (income, expenses, deductions, country) and returns AI-generated tax advice.
    -   **Request Body**: `TaxInfoInput` model (JSON)
        ```json
        {
          "income": 75000.50,
          "expenses": 12000.00,
          "deductions": 5000.75,
          "country": "USA"
        }
        ```
    -   **Response Body**: `TaxAdviceResponse` model (JSON)
        ```json
        {
          "message": "Tax information processed and AI advice retrieved successfully.",
          "advice": "Based on your income of $75,000.50 and expenses of $12,000.00 in USA...",
          "raw_input": { /* ... echoed input ... */ }
        }
        ```
-   **`GET /tax/health`**:
    -   **Description**: A simple health check endpoint.
    -   **Response Body**:
        ```json
        {
          "status": "healthy",
          "message": "Backend is running!"
        }
        ```
-   **`GET /tax/info`**
    -   **Description**: Expose non-sensitive configuration details, potentially useful for debugging or for a frontend admin panel.
    -   **Response Body**:
        ```json
        {
            "project_name": "Intelligent Tax Filing API",
            "version": "0.1.0",
            "description": "API for the Intelligent Tax Filing Web Application, providing AI-driven tax advice.",
            "default_openai_model": "gpt-4-turbo",
            "configured_openai_model": "gpt-4-turbo",
            "api": "/api/v1"
        }
        ```
### API Documentation

Interactive API documentation (Swagger UI) is available at `/docs` when the application is running.
ReDoc documentation is available at `/redoc`.

## Setup and Running Locally (without Docker)

1.  **Create and Activate Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `tax-filer-backend` root directory:
    ```env
    OPENAI_API_KEY="api-key"
    OPENAI_MODEL_NAME=gpt-4-turbo
    PYTHONUNBUFFERED=1
    ```
    Replace `"api-key"` with a valid OpenAI API key.

4.  **Run the Application:**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    The backend will be accessible at `http://localhost:8000`.


### Request Handling

* Each request is associated with a unique identifier (UUID) which is logged to a file, enabling the admininstrator
more fine grained control over the entire lifecycle of a single request and help with error debugging.
* A middleware intercepts each request and injects a unique request header `X-Request-ID` (if not already present).
* This ID is also added to the response headers, so other clients and services can trace it.
* These logs then can be stored in their raw format in a centralized storage like a data lake and ingested at scale
  for futher processing.

## AI Integration Details

-   The service in `app/services/ai_service.py` handles communication with the OpenAI API.
-   It constructs a prompt based on the user's input from the `TaxInfoInput` model.
-   The `gpt-4-turbo` model (configurable) is used to generate tax advice.
-   The OpenAI API key is securely managed via the `.env` file and `app.core.config.Settings`.

## Running with Docker

Refer to the main project `README.md` and `Dockerfile` in this directory for instructions on building and running the backend with Docker.
