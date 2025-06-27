import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api import router
from config import load_environment_variables

# Global variables to store the RAG chain and chat history
# These are now managed within rag_core.py, but we keep them here
# if there's a need for app-level state that spans beyond rag_core

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the .env file at startup
    load_environment_variables()
    yield

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
