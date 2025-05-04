from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Smart API DevTool",
    description="A tool that streamlines API integration by analyzing documentation and generating wrapper code",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include API routes
from app.routes.api import router as api_router
app.include_router(api_router)

# Determine the static directory path
static_dir = Path(__file__).parent.parent / "static"

# Mount the static directory
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)