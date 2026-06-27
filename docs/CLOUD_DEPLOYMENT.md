# TECHSETU AI OS — Serverless Cloud Deployment Guide

This guide details how to deploy **TECHSETU AI OS** using serverless cloud platforms to obtain a public live link, using:
*   **GitHub**: For repository hosting and automatic CI/CD.
*   **Vercel**: For React Frontend hosting.
*   **Render**: For Spring Boot Backend and Python AI services.
*   **Supabase**: For serverless PostgreSQL.
*   **MongoDB Atlas**: For serverless MongoDB.

---

## 📁 1. Push Codebase to GitHub

1.  **Initialize Git** in the workspace root:
    ```bash
    git init
    git add .
    git commit -m "feat: complete techsetu ai os platform"
    ```
2.  **Create a Repository** on [GitHub](https://github.com):
    *   Name it `techsetu-ai-os`. Keep it Public or Private.
3.  **Push to GitHub**:
    ```bash
    git remote add origin https://github.com/your-username/techsetu-ai-os.git
    git branch -M main
    git push -u origin main
    ```

---

## 💾 2. Setup Serverless Databases

### PostgreSQL on Supabase:
1.  Sign up on [Supabase](https://supabase.com).
2.  Create a new project named `techsetu-db`.
3.  Go to **Project Settings -> Database**.
4.  Copy the **Connection String** (under URI):
    `postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres`

### MongoDB on Atlas:
1.  Sign up on [MongoDB Atlas](https://mongodb.com/atlas).
2.  Create a Free Shared Cluster (`M0 Cluster`).
3.  Add a Database User and configure the IP access list (allow `0.0.0.0/0` for cloud services access).
4.  Click **Connect -> Drivers** and copy the URI:
    `mongodb+srv://user:<password>@cluster.xxxx.mongodb.net/techsetu_ai_os`

---

## ☕ 3. Deploy Backend on Render

1.  Sign up on [Render](https://render.com) and link your GitHub account.
2.  Click **New + -> Web Service**.
3.  Connect your `techsetu-ai-os` repository.
4.  Configure the Service:
    *   **Name**: `techsetu-backend`
    *   **Root Directory**: `backend` (Points to the Java directory)
    *   **Runtime**: `Docker` (Render will build your Spring Boot app automatically using our `Dockerfile`!)
5.  Add the **Environment Variables**:
    *   `SPRING_DATASOURCE_URL`: `jdbc:postgresql://db.xxxx.supabase.co:5432/postgres`
    *   `SPRING_DATASOURCE_USERNAME`: `postgres`
    *   `SPRING_DATASOURCE_PASSWORD`: `your-supabase-db-password`
    *   `SPRING_DATA_MONGODB_URI`: `mongodb+srv://...`
    *   `APP_JWT_SECRET`: `secure_32_character_secret_key_here`
    *   `APP_GEMINI_API_KEY`: `your-gemini-api-key`
6.  Click **Deploy**. Once finished, you will receive a public API link:
    `https://techsetu-backend.onrender.com`

---

## 🎨 4. Configure & Deploy Frontend on Vercel

### Step A: Update API Config in Frontend
To ensure the frontend calls your live Render API rather than `localhost:8080`, we read URLs from Vite environment variables.

In `frontend/src/components/chat/ChatView.tsx`, `CollaborationView.tsx`, etc., endpoints can be declared dynamically:
*   **Http API Base**: `import.meta.env.VITE_API_URL || 'http://localhost:8080'`
*   **WebSocket Base**: `import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'`

### Step B: Deploy to Vercel
1.  Sign up on [Vercel](https://vercel.com) and link GitHub.
2.  Click **Add New -> Project** and select `techsetu-ai-os`.
3.  Configure the settings:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: Edit and select `frontend`.
    *   **Build & Development Settings**:
        *   Build Command: `npm run build`
        *   Output Directory: `dist`
4.  Add **Environment Variables** (under Settings -> Environment Variables):
    *   `VITE_API_URL`: `https://techsetu-backend.onrender.com` (Your live Render backend URL)
    *   `VITE_WS_URL`: `wss://techsetu-backend.onrender.com/ws` (WebSocket connection with secure `wss` protocol)
5.  Click **Deploy**. You will receive your live link:
    `https://techsetu-ai-os.vercel.app` 🎉
