import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Techsetu AI OS Services", version="0.1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str
    stream: bool = False

@app.get("/")
def read_root():
    return {"message": "Welcome to TECHSETU AI OS Services API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-services"}

@app.post("/api/ai/query")
async def query_ai(request: QueryRequest):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    # Placeholder response
    return {
        "response": f"This is a placeholder response for prompt: '{request.prompt}'",
        "model": "gemini-1.5-flash"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
