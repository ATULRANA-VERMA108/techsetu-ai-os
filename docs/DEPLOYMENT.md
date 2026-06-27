# TECHSETU AI OS — Production Deployment Guide

This guide provides instructions to compile, containerize, and run the complete **TECHSETU AI OS** platform locally or in cloud production using Docker Compose.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your host system:
1.  **Docker** (v24.0.0 or higher)
2.  **Docker Compose** (v2.20.0 or higher)

---

## 🔑 Environment Configuration

The application uses Google's Gemini Flash model to perform chat streams, candidate parsing, and RAG document queries. To configure your global Gemini API Key:

On Linux/macOS:
```bash
export GEMINI_API_KEY="your-actual-api-key"
```

On Windows (PowerShell):
```powershell
$env:GEMINI_API_KEY="your-actual-api-key"
```

Alternatively, you can create a `.env` file in the workspace root:
```properties
GEMINI_API_KEY=your-actual-api-key
```

---

## 🚀 Launching the Platform

To build and run all 6 containerized instances (Postgres, MongoDB, Redis, Spring Boot Backend, FastAPI Service, Nginx Frontend) in background detached mode, execute the following command in the workspace root:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### What happens under the hood:
1.  **PostgreSQL** launches on port `5432` internally and mounts database files to `postgres_prod_data`.
2.  **MongoDB** launches on port `27017` internally and mounts schema indexes to `mongodb_prod_data`.
3.  **Redis** launches on port `6379` internally for caching.
4.  **Spring Boot API** compiles the Maven jar, packages the security filter layers, connects to databases, and exposes endpoints on `http://localhost:8080`.
5.  **FastAPI Service** installs Python requirements, exposes endpoints on `http://localhost:8000`.
6.  **React Frontend** builds static chunks via Node, copies assets to Nginx, maps routing configurations, and exposes the app on `http://localhost` (port `80`).

---

## 🔍 Verification Checklist

Once the container orchestrator finishes launching, verify database connections and service healths:

| Service | Port | Endpoint URL | Status / Health Check |
| :--- | :--- | :--- | :--- |
| **Vite Frontend** | `80` | `http://localhost` | Opens the Landing Page |
| **Spring Boot API** | `8080` | `http://localhost:8080` | Check logs: `docker logs techsetu-backend-prod` |
| **FastAPI Services** | `8000` | `http://localhost:8000` | Health check returns JSON: `{"status":"healthy"}` |

---

## 🛑 Shutting Down

To stop all active services and release container mappings without losing persistent database volumes:
```bash
docker compose -f docker-compose.prod.yml down
```

To stop services and delete database volumes (warning: resets data):
```bash
docker compose -f docker-compose.prod.yml down -v
```
