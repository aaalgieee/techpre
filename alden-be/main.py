from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import settings
from app.database import create_tables
from app.routers import study_sessions, mindful_sessions, ai_chat, documents, progress

# Create tables on startup
create_tables()

app = FastAPI(
    title="Alden Backend API",
    description="Backend API for Alden - Study Assistant with AI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allow_methods,
    allow_headers=settings.allow_headers,
)

# Include routers
app.include_router(study_sessions.router, prefix="/api")
app.include_router(mindful_sessions.router, prefix="/api")
app.include_router(ai_chat.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(progress.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Alden Backend API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )