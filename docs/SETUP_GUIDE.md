# TECHSETU AI OS — Developer Setup Guide

This guide provides step-by-step instructions to get your local development environment for the TECHSETU AI OS platform up and running.

---

## 🏗️ Project Architecture

The codebase is split into the following main directories:
*   `frontend/`: React + Vite + TypeScript web application styled with Tailwind CSS v4.
*   `backend/`: Spring Boot (Java 21) REST API handling core database operations, security, and WebSockets.
*   `ai-services/`: Python FastAPI service for advanced AI flows, agents, and LangChain orchestrations.
*   `docker/`: Local database infrastructure (PostgreSQL, MongoDB, Redis) orchestration.
*   `docs/`: Product and engineering guides.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
1.  **Java JDK 21+** (e.g. Oracle JDK or Eclipse Temurin)
2.  **Node.js 22+** and **npm**
3.  **Docker Desktop** (with Docker Compose v2+)
4.  **Python 3.10+** (if developing the agentic Python services)

---

## 🚀 Step 1: Run the Database Infrastructure

We run PostgreSQL, MongoDB, and Redis locally inside Docker containers.

1.  Open a terminal and navigate to the `docker/` directory:
    ```bash
    cd docker
    ```
2.  Start the containers in detached mode:
    ```bash
    docker-compose up -d
    ```
3.  Verify the containers are running:
    ```bash
    docker-compose ps
    ```

*   **PostgreSQL**: Available on port `5432` (Username: `techsetu`, Password: `techsetu_password`, DB: `techsetu_ai_os`)
*   **MongoDB**: Available on port `27017` (Database: `techsetu_ai_os`)
*   **Redis**: Available on port `6379`

---

## ☕ Step 2: Start the Backend (Spring Boot)

The Spring Boot backend manages core business logic, users, and security.

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Make sure your local `application.properties` (or `application.yml`) is configured to connect to your Docker services. Under `src/main/resources/application.properties`, configure:
    ```properties
    # Database Settings
    spring.datasource.url=jdbc:postgresql://localhost:5432/techsetu_ai_os
    spring.datasource.username=techsetu
    spring.datasource.password=techsetu_password
    spring.jpa.hibernate.ddl-auto=update
    
    # JWT Secrets
    app.jwt.secret=your_extremely_long_super_secure_jwt_signing_key_32_bytes_or_more
    app.jwt.expiration-ms=86400000
    ```
3.  Run the application using the Maven Wrapper:
    ```bash
    # Windows
    mvnw.cmd spring-boot:run
    
    # macOS/Linux
    ./mvnw spring-boot:run
    ```

---

## ⚛️ Step 3: Start the Frontend (Vite + React)

The frontend dev server features hot module replacement (HMR) and connects to the backend REST APIs.

1.  Navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the local dev server:
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:5173`. You should see the TECHSETU AI OS landing dashboard.

---

## 🐍 Step 4: Start AI Services (FastAPI)

For running Python-based agents and advanced LangChain pipelines:

1.  Navigate to the `ai-services/` directory:
    ```bash
    cd ai-services
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    ```bash
    # Windows
    .\venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Create a `.env` file with your API keys:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    PORT=8000
    ```
6.  Start the FastAPI server:
    ```bash
    python main.py
    ```
    The AI server will boot on `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.
