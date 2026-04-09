import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, status, holdings

load_dotenv()

app = FastAPI(
    title="Steward Ingestion Service",
    description="PDF fund fact sheet parsing and holdings extraction",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(status.router)
app.include_router(holdings.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
