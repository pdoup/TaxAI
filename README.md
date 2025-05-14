
# Intelligent Tax Filing Web Application

**Version:** 1.0.0

**Last Updated:** 14/05/25

[![Backend CI](https://github.com/pdoup/TaxAI/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/pdoup/TaxAI/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/pdoup/TaxAI/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/pdoup/TaxAI/actions/workflows/frontend-ci.yml)
[![Docker Compose Integration](https://github.com/pdoup/TaxAI/actions/workflows/docker-compose-integration.yaml/badge.svg)](https://github.com/pdoup/TaxAI/actions/workflows/docker-compose-integration.yaml)

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Features](#features)
3.  [Technical Stack](#technical-stack)
4.  [Architecture Overview](#architecture-overview)
5.  [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Local Development Setup](#local-development-setup)
    * [Dockerized Setup (Recommended)](#dockerized-setup-recommended)
6.  [Application Usage](#application-usage)
7.  [AI Integration Details](#ai-integration-details)
    * [Model Used](#model-used)
    * [Prompt Engineering](#prompt-engineering)
    * [Limitations](#limitations)
8.  [Dockerization](#dockerization)
    * [Frontend Dockerfile](#frontend-dockerfile)
    * [Backend Dockerfile](#backend-dockerfile)
    * [Docker Compose](#docker-compose)
9.  [CI/CD Pipeline](#cicd-pipeline)
    * [Overview](#overview)
    * [Frontend CI Workflow](#frontend-ci-workflow)
    * [Backend CI Workflow](#backend-ci-workflow)
    * [Integration CI Workflow](#integration-ci-workflow)
    * [Deployment Strategy (Image Publishing)](#deployment-strategy-image-publishing)
10. [Testing Strategy](#testing-strategy)
    * [Frontend Testing](#frontend-testing)
    * [Backend Testing](#backend-testing)
11. [Key Learnings & Challenges Faced](#key-learnings--challenges-faced)
12. [Potential Future Enhancements](#potential-future-enhancements)


## Project Overview

The Intelligent Tax Filing Web Application is a full-stack solution designed to simplify the initial stages of tax preparation for users. It provides a user-friendly interface to input basic financial information and leverages generative AI (via OpenAI's API) to offer general tax-related insights and advice.

**Core Objective:** To provide users with AI-driven preliminary tax advice based on their inputs, facilitating a better understanding of their potential tax situation before consulting a professional.

## Features

* **Responsive User Interface:** Built with React, ensuring a seamless experience across devices.
* **User-Friendly Tax Form:** Intuitive form for submitting income, expenses, deductions, and country of residence.
* **AI-Powered Tax Advice:** Integration with OpenAI's GPT models to generate personalized tax considerations.
* **Secure Backend API:** FastAPI backend handling data processing and AI service communication.
* **Containerized Application:** Fully containerized using Docker and orchestrated with Docker Compose for easy setup and deployment.
* **Automated CI/CD:** GitHub Actions pipelines for automated linting, testing, building, and Docker image publishing.
* **Safe API Key Handling:** Environment variables for API keys, not stored in code or images.
* **Comprehensive API Documentation:** Interactive Swagger UI and ReDoc for backend API exploration.

## Technical Stack

* **Frontend:**
    * Framework: React 18
    * Language: JavaScript (ES6+)
    * Styling: CSS3, CSS Modules (as per `HomePage.css`, `TaxForm.css`)
    * Routing: React Router DOM v6
    * State Management: React Hooks (useState, useEffect)
    * HTTP Client: Axios
    * Testing: Jest, React Testing Library
    * Linting/Formatting: ESLint, Prettier
* **Backend:**
    * Framework: FastAPI
    * Language: Python v3.10
    * AI Integration: OpenAI Python SDK (`gpt-4-turbo`, configurable via environment variables)
    * Data Validation: Pydantic v2
    * ASGI Server: Uvicorn
    * Testing: Pytest, Pytest-Asyncio, Pytest-Cov, Mocker
    * Logging: Standard Python `logging` module, configured for different levels.
    * Linting/Formatting: Flake8, Black, isort
    * API Endpoints:
        * `POST /api/v1/tax/submit-advice`:
            * Request Body: `{ "income": float, "expenses": Optional[float], "deductions": Optional[float], "country": str (acronym) }`
            * Response (Success): `{ "advice": str }`
            * Response (Error): `{ "detail": str or List[ErrorDetail] }`
        * `GET /api/v1/tax/health` (Simple health check endpoint):
            * Response: `{ "status": "healthy", "message": "Backend is running!" }`
        * `GET /api/v1/tax/info` (Get non-sensitive configuration info in JSON format):
            * Response: `{ "project_name": "Intelligent Tax Filing API", "version": "0.1.0", ...}`

* **Containerization & DevOps (CI/CD):**
    * Containerization: Docker, Docker Compose - Separate Dockerfiles for frontend (multi-stage Nginx build) and backend with `.dockerignore` files optimized for build context.
    * Access control: Non-root users in containers and health checks implemented
    * CI/CD: GitHub Actions
    * Version Control: Git, GitHub
    * Package Management: npm (frontend), pip (backend)

## Architecture Overview

The application follows a standard three-tier architecture:

1.  **Presentation Tier (Frontend):** A React single-page application (SPA) served by Nginx. It handles user interaction, form input, and displays advice received from the backend.
2.  **Application Tier (Backend):** A FastAPI service that exposes RESTful APIs. It receives data from the frontend, validates it, interacts with the OpenAI API for tax advice, and returns the results.
3.  **AI Service Tier (External):** OpenAI's GPT API, which processes prompts constructed by the backend and generates tax-related text.

* Conceptually this is the the overview of how components interact in the application workflow

`[User via Browser] <--> [React Frontend (Nginx in Docker)] <--> [FastAPI Backend (Python in Docker)] <--> [OpenAI API]`

* Communication between frontend and backend relies on RESTful API calls.
* Both frontend and backend applications are containerized separately and can be orchestrated to run together using Docker Compose.

## Getting Started

### Prerequisites

* Git
* Docker Engine + Docker Compose CLI
* Node.js (v18+ recommended, for local frontend dev if not using Docker exclusively)
* Python (v3.10+ recommended, for local backend dev if not using Docker exclusively)
* An OpenAI API Key (set as `OPENAI_API_KEY` in `tax-filer-backend/.env`)
* GitHub Account (for CI/CD)

### Local Development Setup

(Refer to `tax-filer-frontend/README.md` and `tax-filer-backend/README.md` for detailed individual setup if not using the main Docker Compose setup immediately.)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pdoup/TaxAI.git
    cd TaxAI
    ```

2.  **Backend Setup:**
    * Navigate to `tax-filer-backend`.
    * Create a virtual environment: `python -m venv venv` then `source venv/bin/activate` (or `venv\Scripts\activate` on Windows).
    * Install dependencies: `pip install -r requirements.txt`.
    * `cp .env.example .env` and replace value with your actual `OPENAI_API_KEY`.
    * Run: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`.
3.  **Frontend Setup:**
    * Navigate to `tax-filer-frontend`.
    * Install dependencies: `npm install`.
    * Create a `.env` file and set `REACT_APP_API_BASE_URL=http://localhost:8000/api/v1` (or as per your backend).
    * Run: `npm start`.

### Dockerized Setup (Recommended)

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/pdoup/TaxAI.git
    cd TaxAI
    ```
2.  **Configure Backend Environment:**
    * Ensure `tax-filer-backend/.env` exists and contains your valid `OPENAI_API_KEY`. Example:
        ```env
        OPENAI_API_KEY="sk-yourActualOpenAIKeyHere"
        ```
    **IMPORTANT** : The project comes with a `.env.example` file outlining the environment variables needed (mainly `OPENAI_API_KEY`).
    Make sure that you replace the API key with an actual key first, by running:
    ```bash
    cp .env.example .env
    ```
    Afterwards replace the value of the key with your `OPENAI_API_KEY` inside the `.env` file.
3.  **Configure Frontend Environment (Optional for Docker Compose if default is fine):**
    * The `docker-compose.yml` passes `REACT_APP_API_BASE_URL` during the frontend build. If you need to change this for the Docker build, modify the `args` in `docker-compose.yml` or the `tax-filer-frontend/.env` if your Dockerfile reads it directly (current setup uses build args).
4.  **Build and Run with Docker Compose:**
    From the project root:
    ```bash
    docker compose up --build --detach --wait
    ```
5.  **Access the Application:**
    * Frontend: [http://localhost:3000](http://localhost:3000)
    * Backend API Docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
    * Backend API Docs (ReDoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)
6.  **Stopping the Application:**
    ```bash
    docker compose down
    ```

## Application Usage

1.  Navigate to the home page ([http://localhost:3000](http://localhost:3000)).
2.  Read the application description and click "Get Started" or navigate to the "Tax Form".
3.  Fill in the required fields in the tax information form:
    * **Annual Income:** Your total annual income.
    * **Total Business/Work Expenses:** Relevant deductible expenses.
    * **Other Deductions Claimed:** Any other deductions you are considering.
    * **Country of Residence:** The country for which tax advice is sought.
4.  Click "Get AI Tax Advice".
5.  The application will submit your information to the backend.
6.  The backend processes the request and queries the OpenAI API.
7.  AI-generated advice will be displayed in a popup that renders markdown.
8.  Summary can be download in PDF format by clicling the `Download as PDF` button inside the popup.
9.  Review the advice. (_Remember the disclaimer: The tax-related responses generated by this system are for informational purposes only and should not be construed as professional or financial advice._)

## AI Integration Details

### Model Used

* The application defaults to OpenAI's `gpt-4-turbo` model but can be configured by setting the `OPENAI_MODEL_NAME` environment variable.

### Prompt Engineering

The quality of AI-generated advice heavily depends on the prompt provided to the model. The current prompt in `ai_service.py` is engineered to:
* Set the AI's persona as a "helpful AI Tax Assistant."
* Clearly state the informational and non-professional nature of the advice.
* Instruct the AI to be concise and use the provided user data (income, expenses, deductions, country).
* Ask for general tax considerations, potential deductions, or common tax obligations.
* Remind the AI to emphasize that tax laws vary and professional consultation is crucial.

### Limitations

* **General Advice Only:** The AI provides general information based on patterns in its training data. It is not a certified tax professional and does not have access to specific, up-to-date tax codes for all jurisdictions or individual circumstances.
* **No Real-time Tax Law Updates:** The model's knowledge is based on its last training cut-off. Tax laws change frequently.
* **Not a Substitute for Professional Advice:** Users must consult with a qualified tax advisor for decisions regarding their specific financial situation.
* **Potential for Inaccuracies:** Like all LLMs, there's a possibility of generating plausible-sounding but incorrect or incomplete information.
* **API Costs:** Each call to the OpenAI API incurs a cost.

## Dockerization

The application is fully containerized for ease of development, deployment, and scalability.

### Frontend Dockerfile

* Uses a multi-stage build:
    1.  **Builder Stage (`node:18-alpine`):** Installs dependencies, builds the static React application (`npm run build`).
    2.  **Final Stage (`nginx:1.25-alpine`):** Copies the built static assets from the builder stage and serves them using Nginx. A custom `nginx.conf` is used to correctly handle SPA routing (directing all paths to `index.html`).
* Build arguments like `REACT_APP_API_BASE_URL` can be passed during the image build.

### Backend Dockerfile

* Uses a `python:3.10-slim` base image.
* Sets environment variables for Python (`PYTHONDONTWRITEBYTECODE`, `PYTHONUNBUFFERED`).
* Copies `requirements.txt` and installs dependencies.
* Copies the application code (`./app`).
* Exposes port 8000.
* Runs the FastAPI application using `uvicorn`.

### Docker Compose

* Orchestrates the `frontend` and `backend` services.
* Defines build contexts and Dockerfiles for each service.
* Maps ports from the host to the containers (e.g., `3000:80` for frontend, `8000:8000` for backend).
* Uses `env_file` for the backend service to inject environment variables from `tax-filer-backend/.env` at runtime.
* Sets up a shared network (`tax_app_network`) for inter-service communication.
* Includes `depends_on` to manage startup order if necessary (frontend depends on backend conceptually).

## CI/CD Pipeline

Continuous Integration and Continuous Deployment/Delivery are managed using GitHub Actions. Workflows are defined in the `.github/workflows` directory.

### Overview

* **Separate Workflows:** Independent CI pipelines for frontend (`frontend-ci.yml`) and backend (`backend-ci.yml`).
* **Docker Compose Worfklow**: Ensures the entire application plays nicely together using Docker Compose within the CI pipeline in place (`docker-compose-integration.yml`)
* **Triggers:** Workflows are triggered on pushes to the `main` or `develop` branch and on pull requests targeting `main` or `develop`, specifically when changes occur in their respective directories or workflow files.
* **Goal:** Automate linting, formatting checks, testing, application builds, and Docker image generation.

### Frontend CI Workflow

1.  **`lint-test-build` Job:**
    * Checks out code.
    * Sets up Node.js (with caching for `npm` dependencies).
    * Installs dependencies (`npm ci`).
    * Runs ESLint for code quality and Prettier for format checking.
    * Setup testing with Jest with coverage.
    * Executes unit and component tests using Jest.
    * Builds the production version of the React application (`npm run build`).
    * Uses `REACT_APP_API_BASE_URL` (from GitHub vars or default).
    * Archives production artifacts on success

2.  **`build-docker-image` Job:**
    * Predicated upon success of previous job
    * Setup docker build
    * Build docker image using Dockerfile

### Backend CI Workflow

1.  **`lint-and-test` Job:**
    * Checks out code.
    * Sets up Python (with caching for `pip` dependencies).
    * Installs dependencies from `requirements.txt`.
    * Runs Flake8, Black (check only), isort (check only)
    * Runs Pytest for unit and integration tests.
    * Generates code coverage reports (term-missing and XML).
    * `OPENAI_API_KEY` is made available as an environment variable from GitHub secrets for tests that might require it (though tests use mock).

2.  **`build-docker-image` Job:**
    * Predicated upon success of previous job
    * Builds docker image using Dockerfile

### Integration CI Workflow

1. **`integrate_and_test_compose` Job:**
    * Triggered after existing backend and frontend CI workflows have successfully completed for the same commit.
    * Checkout the code
    * Creates the necessary `.env` file for Docker Compose using GitHub Secrets and Variables.
    * Builds the services using `docker compose build`
    * Starts all services using `docker compose up`
    * Performs a simple health check using `curl` to see if the services are running and accessible.
    * Outputs logs from all services for debugging.
    * Clean up by stopping the services using `docker compose down`

### Deployment Strategy (Image Publishing)

* Deployment to a hosting environment (e.g., Kubernetes, AWS ECS, Google Cloud Run, Azure App Service) would be the next step, potentially triggered by the successful publishing of these images. This would involve additional workflow steps or separate deployment workflows using tools like `kubectl`, `aws cli`, `gcloud cli`, etc., and managing environment-specific configurations.

## Testing Strategy

### Frontend Testing

* **Unit/Component Tests:**
    * Framework: Jest and React Testing Library.
    * Focus: Testing individual React components in isolation for correct rendering, user interactions, and state changes.
    * Examples: Verifying text presence, button clicks, form input handling (mocking API calls).
    * Run via `npm test`.
* **Linting/Formatting:** ESLint and Prettier ensure code quality and consistency, caught by the linter CI job.

### Backend Testing

* **Unit/Integration Tests:**
    * Framework: Pytest with `pytest-asyncio` (for async code) and `pytest-cov` (for coverage).
    * Focus:
        * Testing individual service functions (e.g., `ai_service.py` logic - heavily mocked).
        * Testing API endpoints (router functions in `tax_info.py`) for correct request handling, response codes, and data validation. `AsyncClient` from `httpx` is used for this.
    * Mocking: The `mocker` fixture (from `pytest-mock`) is used extensively to mock external dependencies like the OpenAI API, ensuring tests are fast, deterministic, and don't incur external API costs.
    * Run via `pytest`.
* **Linting/Formatting:** Flake8, Black and isort ensure code quality and consistency, caught by the linter CI job.

## Key Learnings & Challenges Faced

* **Challenge: Effective Prompt Engineering:** Crafting prompts for the OpenAI API that yield consistently useful and appropriately constrained advice required iteration.
    * **Solution:** Experimented with different phrasings, explicit instructions on tone and scope, and providing clear context in the prompt.
* **Challenge: CI/CD Setup Complexity:** Configuring separate, efficient CI pipelines for both frontend and backend, including Docker image publishing and caching, had many small details.
    * **Solution:** Broke down workflows into logical jobs, utilized GitHub Actions documentation for caching and Docker actions, and iterated on YAML configurations. Careful management of secrets and permissions was key.
* **Challenge: Backend Asynchronous Code Testing:** Writing tests for asynchronous FastAPI endpoints and services.
    * **Solution:** Utilized `pytest-asyncio` and `httpx.AsyncClient` for testing async routes. Leveraged `mocker.AsyncMock` for mocking asynchronous functions.
* **Challenge: Cross-Environment Configuration:** Ensuring consistent API URLs and environment variables between local development, Docker Compose, and CI build environments for the frontend.
    * **Solution:** Used `.env` files, Docker build arguments (`ARG` in Dockerfile, `build.args` in compose), and GitHub Actions `vars` to manage configuration.
* **Learning: Importance of Mocking:** Realized the critical role of mocking external services (like OpenAI) in creating reliable and efficient automated tests for the backend.
* **Learning: Docker Multi-Stage Builds:** Implemented multi-stage Docker builds for the frontend to create lean production images.

## Potential Future Enhancements

* **User Authentication & Authorization:** Implement user accounts to save tax information history and provide a more personalized experience.
* **Database Integration:** Store user data, form submissions, and possibly AI advice history securely.
* **Richer User Input:** Consult with experts to add more input fields, enable users to upload documents used as context for LLMs to generate more personalized responses.
* **Advanced AI Features:**
    * Allow users to ask follow-up questions.
    * Integrate with more specific tax data sources or calculators (with appropriate disclaimers).
    * Fine-tune a model for more specialized tax advice (requires significant data and effort).
* **End-to-End (E2E) Testing:** Implement E2E tests using frameworks like Cypress or Playwright to test full user flows.
* **Full Deployment to Cloud:** Extend CI/CD to deploy the application to GHCR or cloud platform (e.g., AWS, Google Cloud, Azure).
* **TLS Support for HTTPS:** Add HTTPS support via TLS to ensure secure communication between clients and the server, protecting sensitive tax data during transmission.
* **Accessibility (a11y) Improvements:** Conduct thorough accessibility audits and implement enhancements.
* **Rate Limiting & Enhanced Security:** Implement stricter security measures on the API.
