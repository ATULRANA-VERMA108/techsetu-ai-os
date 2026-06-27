# Use Python slim base image
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code files
COPY . .

# Expose FastAPI server port
EXPOSE 8000

# Execute server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
