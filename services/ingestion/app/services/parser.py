import re
import io
from typing import Optional
import pdfplumber

ISIN_PATTERN = re.compile(r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b')
WEIGHT_PATTERN = re.compile(r'(\d{1,3}(?:\.\d{1,4})?)\s*%')


def _normalise_holding(row: dict) -> Optional[dict]:
    """Attempt to extract a normalised holding from a raw table row dict."""
    name = None
    isin = None
    weight = None

    for key, val in row.items():
        if val is None:
            continue
        val_str = str(val).strip()

        # Try to find ISIN
        if isin is None:
            m = ISIN_PATTERN.search(val_str)
            if m:
                isin = m.group(1)

        # Try to find weight
        if weight is None:
            m = WEIGHT_PATTERN.search(val_str)
            if m:
                try:
                    weight = float(m.group(1))
                except ValueError:
                    pass

        # Likely the company name column — heuristic: longest non-numeric string
        if name is None and len(val_str) > 3 and not val_str.replace('.', '').replace('%', '').replace(',', '').isnumeric():
            name = val_str

    if name and weight is not None:
        return {
            "company_name": name,
            "isin": isin,
            "weight_pct": weight,
            "sector": None,
            "country": None,
        }
    return None


def parse_pdf_factsheet(pdf_bytes: bytes) -> list[dict]:
    """
    Extract holdings from a PDF fund fact sheet.
    Returns a list of normalised holding dicts.
    """
    holdings = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    if not table or len(table) < 2:
                        continue

                    # Use first row as header
                    headers = [str(h).strip().lower() if h else f"col{i}" for i, h in enumerate(table[0])]

                    for data_row in table[1:]:
                        if not data_row:
                            continue
                        row_dict = dict(zip(headers, data_row))
                        holding = _normalise_holding(row_dict)
                        if holding:
                            holdings.append(holding)
            else:
                # Fallback: raw text parsing
                text = page.extract_text() or ""
                for line in text.split("\n"):
                    line = line.strip()
                    if not line:
                        continue
                    weight_match = WEIGHT_PATTERN.search(line)
                    isin_match = ISIN_PATTERN.search(line)
                    if weight_match:
                        name_part = line[:weight_match.start()].strip()
                        if len(name_part) > 2:
                            holdings.append({
                                "company_name": name_part,
                                "isin": isin_match.group(1) if isin_match else None,
                                "weight_pct": float(weight_match.group(1)),
                                "sector": None,
                                "country": None,
                            })

    # Deduplicate by company name (keep highest weight)
    seen: dict[str, dict] = {}
    for h in holdings:
        key = h["company_name"].lower()
        if key not in seen or h["weight_pct"] > seen[key]["weight_pct"]:
            seen[key] = h

    return list(seen.values())
