from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.connection import get_db

router = APIRouter(prefix="/funds", tags=["holdings"])


@router.get("/{fund_id}/holdings")
def get_holdings(fund_id: str, db: Session = Depends(get_db)):
    """Return all holdings for a fund, including any compromise flags."""
    # Verify fund exists
    fund = db.execute(
        text("SELECT id, name FROM funds WHERE id = :id"),
        {"id": fund_id},
    ).fetchone()

    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    rows = db.execute(
        text(
            """SELECT h.id, h.company_name, h.isin, h.weight_pct, h.sector, h.country, h.is_fund,
                      cf.category, cf.confidence_score, cf.flagged_by, cf.notes
               FROM holdings h
               LEFT JOIN compromise_flags cf ON cf.holding_id = h.id
               WHERE h.fund_id = :fid
               ORDER BY h.weight_pct DESC"""
        ),
        {"fid": fund_id},
    ).fetchall()

    # Group flags per holding
    holdings_map: dict[str, dict] = {}
    for r in rows:
        hid = str(r[0])
        if hid not in holdings_map:
            holdings_map[hid] = {
                "id": hid,
                "company_name": r[1],
                "isin": r[2],
                "weight_pct": float(r[3]) if r[3] is not None else None,
                "sector": r[4],
                "country": r[5],
                "is_fund": r[6],
                "flags": [],
            }
        if r[7]:  # has a flag
            holdings_map[hid]["flags"].append(
                {
                    "category": r[7],
                    "confidence_score": float(r[8]) if r[8] else None,
                    "flagged_by": r[9],
                    "notes": r[10],
                }
            )

    return {
        "fund_id": fund_id,
        "fund_name": fund[1],
        "holdings": list(holdings_map.values()),
    }
