FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1 # Prevents Python from writing .pyc files
ENV PYTHONUNBUFFERED 1     # Forces Python output to be sent directly to terminal
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r appgroup && useradd --no-log-init -r -g appgroup appuser

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container at /app
COPY ./app ./app

RUN chown -R appuser:appgroup /app
# Switch to the non-root user
USER appuser
# Expose the port the app runs on
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8000/api/v1/tax/health || exit 1

# Run uvicorn instance with 1 worker for now
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--log-level", "warning"]
