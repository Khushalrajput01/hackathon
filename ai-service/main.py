import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ingest, query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Doubt Solver - RAG Service starting up...")
    yield
    logger.info("🛑 AI Doubt Solver - RAG Service shutting down...")


app = FastAPI(
    title="AI Doubt Solver - RAG Service",
    description="FastAPI service for PDF ingestion and RAG-based question answering",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/ingest", tags=["Ingestion"])
app.include_router(query.router, prefix="/query", tags=["Query"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "RAG Service", "version": "1.0.0"}
