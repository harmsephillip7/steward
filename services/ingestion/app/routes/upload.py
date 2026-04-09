import uuid
import asyncio
from fastapi import APIRouter, UploadFile, File, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.connection import get_db
from app.services.parser import parse_pdf_factsheet

router = APIRouter(prefix="/upload", tags=["upload"])

# In-memory job store for development (replace with Redis in production)
_jobs: dict[str, dict] = {}


def _process_pdf_sync(job_id: str, fund_id: str | None, pdf_bytes: bytes, db: Session):
    """Synchronous processing — called in a thread pool via asyncio."""
    try:
        _jobs[job_id]["status"] = "processing"
        holdings = parse_pdf_factsheet(pdf_bytes)
        _jobs[job_id]["holdings_count"] = len(holdings)

        if fund_id and holdings:
            # Upsert holdings into the database
            for h in holdings:
                existing = db.execute(
                    text("SELECT id FROM holdings WHERE fund_id = :fid AND company_name = :name"),
                    {"fid": fund_id, "name": h["company_name"]},
                ).fetchone()

                if existing:
                    db.execute(
                        text(
                            "UPDATE holdings SET weight_pct = :w, isin = :isin WHERE id = :id"
                        ),
                        {"w": h["weight_pct"], "isin": h.get("isin"), "id": existing[0]},
                    )
                else:
                    db.execute(
                        text(
                            """INSERT INTO holdings (id, fund_id, company_name, isin, weight_pct, sector, country, is_fund)
                               VALUES (:id, :fund_id, :company_name, :isin, :weight_pct, :sector, :country, false)"""
                        ),
                        {
                            "id": str(uuid.uuid4()),
                            "fund_id": fund_id,
                            "company_name": h["company_name"],
                            "isin": h.get("isin"),
                            "weight_pct": h["weight_pct"],
                            "sector": h.get("sector"),
                            "country": h.get("country"),
                        },
                    )
            db.commit()

            # Update ingestion_jobs table
            db.execute(
                text(
                    "UPDATE ingestion_jobs SET status = 'complete', holdings_extracted = :count WHERE id = :id"
                ),
                {"count": len(holdings), "id": job_id},
            )
            db.commit()

        _jobs[job_id]["status"] = "complete"
        _jobs[job_id]["holdings"] = holdings

    except Exception as exc:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = str(exc)
        db.rollback()
        db.execute(
            text("UPDATE ingestion_jobs SET status = 'failed', error_message = :err WHERE id = :id"),
            {"err": str(exc), "id": job_id},
        )
        db.commit()


@router.post("")
async def upload_factsheet(
    file: UploadFile = File(...),
    fund_id: str | None = Query(None, description="Optional: link holdings to existing fund UUID"),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF fund fact sheet.
    Returns a job_id for polling via GET /status/{job_id}.
    """
    job_id = str(uuid.uuid4())
    pdf_bytes = await file.read()

    _jobs[job_id] = {
        "status": "pending",
        "filename": file.filename,
        "fund_id": fund_id,
        "holdings_count": 0,
    }

    # Insert a record in ingestion_jobs
    try:
        db.execute(
            text(
                """INSERT INTO ingestion_jobs (id, fund_id, filename, status)
                   VALUES (:id, :fund_id, :filename, 'pending')"""
            ),
            {"id": job_id, "fund_id": fund_id, "filename": file.filename},
        )
        db.commit()
    except Exception:
        db.rollback()

    # Process in background thread
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _process_pdf_sync, job_id, fund_id, pdf_bytes, db)

    return {"job_id": job_id, "status": "pending"}
