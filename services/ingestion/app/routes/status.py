from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.connection import get_db
from app.routes.upload import _jobs  # shared in-memory store

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/{job_id}")
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """Return status, holdings_extracted count, and any error for a given job."""
    # Check in-memory store first (fast path)
    if job_id in _jobs:
        job = _jobs[job_id]
        return {
            "job_id": job_id,
            "status": job["status"],
            "filename": job.get("filename"),
            "holdings_extracted": job.get("holdings_count", 0),
            "error_message": job.get("error"),
        }

    # Fallback to database (e.g., after service restart)
    row = db.execute(
        text("SELECT id, status, filename, holdings_extracted, error_message FROM ingestion_jobs WHERE id = :id"),
        {"id": job_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": str(row[0]),
        "status": row[1],
        "filename": row[2],
        "holdings_extracted": row[3] or 0,
        "error_message": row[4],
    }
