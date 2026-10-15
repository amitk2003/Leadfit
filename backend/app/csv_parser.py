"""
CSV Parser & Normalizer for LeadFit.
Handles parsing, header normalization, row validation, and field normalization.
"""
import csv
import io
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


# Canonical column names and their known aliases
COLUMN_ALIASES: Dict[str, List[str]] = {
    "company_name": [
        "company", "company name", "organization", "org", "business name",
        "account name", "account", "name", "firm"
    ],
    "company_domain": [
        "domain", "website", "url", "web", "company domain", "company url",
        "company website", "homepage"
    ],
    "industry": [
        "industry", "sector", "vertical", "business type", "market", "category"
    ],
    "employee_count": [
        "employees", "employee count", "headcount", "head count", "staff",
        "num employees", "number of employees", "size", "company size",
        "employee size", "no of employees"
    ],
    "country": [
        "country", "country name", "nation", "location country"
    ],
    "state_or_region": [
        "state", "region", "province", "state or region", "location",
        "location state", "location region"
    ],
    "contact_name": [
        "contact", "contact name", "first name", "full name", "person",
        "point of contact", "poc", "rep", "representative"
    ],
    "contact_email": [
        "email", "contact email", "email address", "e-mail", "mail"
    ],
    "last_updated_at": [
        "last updated", "last updated at", "last verified", "last verified at",
        "date", "updated at", "verified at", "data date", "timestamp"
    ],
}

# Country name normalization
COUNTRY_ALIASES: Dict[str, str] = {
    "usa": "United States",
    "us": "United States",
    "u.s.": "United States",
    "u.s.a.": "United States",
    "united states of america": "United States",
    "uk": "United Kingdom",
    "u.k.": "United Kingdom",
    "great britain": "United Kingdom",
    "gb": "United Kingdom",
    "uae": "United Arab Emirates",
    "emirates": "United Arab Emirates",
    "deutschland": "Germany",
    "republic of india": "India",
    "peoples republic of china": "China",
    "prc": "China",
}

# Industry normalization
INDUSTRY_ALIASES: Dict[str, str] = {
    "tech": "Technology",
    "technology": "Technology",
    "information technology": "Technology",
    "it": "Technology",
    "software": "Technology",
    "saas": "Technology",
    "fintech": "Financial Services",
    "finance": "Financial Services",
    "financial services": "Financial Services",
    "banking": "Financial Services",
    "healthcare": "Healthcare",
    "health care": "Healthcare",
    "health": "Healthcare",
    "medtech": "Healthcare",
    "manufacturing": "Manufacturing",
    "retail": "Retail",
    "ecommerce": "Retail",
    "e-commerce": "Retail",
    "education": "Education",
    "edtech": "Education",
    "real estate": "Real Estate",
    "realestate": "Real Estate",
    "media": "Media & Entertainment",
    "entertainment": "Media & Entertainment",
    "logistics": "Logistics & Supply Chain",
    "supply chain": "Logistics & Supply Chain",
    "consulting": "Consulting",
    "professional services": "Consulting",
    "marketing": "Marketing & Advertising",
    "advertising": "Marketing & Advertising",
    "construction": "Construction",
    "energy": "Energy",
    "telecom": "Telecommunications",
    "telecommunications": "Telecommunications",
    "legal": "Legal",
    "government": "Government",
    "nonprofit": "Non-profit",
    "non-profit": "Non-profit",
    "ngo": "Non-profit",
}

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
DOMAIN_REGEX = re.compile(r'^(?:https?://)?(?:www\.)?([^/\s?#]+)', re.IGNORECASE)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_ROWS = 5000


def normalize_header(header: str) -> str:
    """Normalize a column header for matching."""
    return re.sub(r'[^a-z0-9 ]', ' ', header.lower()).strip()


def map_columns(raw_headers: List[str]) -> Tuple[Dict[str, str], List[str]]:
    """
    Map raw CSV headers to canonical field names.
    Returns (mapping dict canonical->raw, unmapped_raw_headers)
    """
    normalized_to_raw = {normalize_header(h): h for h in raw_headers}
    mapping: Dict[str, str] = {}  # canonical -> raw
    used_raw: set = set()

    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            normalized_alias = normalize_header(alias)
            if normalized_alias in normalized_to_raw:
                raw = normalized_to_raw[normalized_alias]
                if raw not in used_raw:
                    mapping[canonical] = raw
                    used_raw.add(raw)
                    break

    unmapped = [h for h in raw_headers if h not in used_raw]
    return mapping, unmapped


def normalize_domain(raw: str) -> Optional[str]:
    """Normalize a company domain."""
    if not raw or not raw.strip():
        return None
    raw = raw.strip()
    match = DOMAIN_REGEX.match(raw)
    if match:
        domain = match.group(1).lower().rstrip(".")
        # Remove www prefix
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    return raw.lower().strip()


def normalize_country(raw: str) -> str:
    """Normalize country name using known aliases."""
    if not raw:
        return raw
    cleaned = raw.strip()
    lower = cleaned.lower()
    return COUNTRY_ALIASES.get(lower, cleaned)


def normalize_industry(raw: str) -> str:
    """Normalize industry using known aliases."""
    if not raw:
        return raw
    cleaned = raw.strip()
    lower = cleaned.lower()
    return INDUSTRY_ALIASES.get(lower, cleaned)


def parse_employee_count(raw: Any) -> Optional[int]:
    """Parse employee count from various formats."""
    if raw is None or str(raw).strip() == "":
        return None
    s = str(raw).strip().replace(",", "").replace(" ", "")
    # Handle ranges like "100-500" -> take midpoint or lower bound
    if "-" in s:
        parts = s.split("-")
        try:
            return int(parts[0])
        except ValueError:
            pass
    # Handle "1000+" or "500k"
    s_clean = s.lower().replace("+", "").replace("k", "000")
    try:
        val = int(float(s_clean))
        if val < 0:
            return None
        return val
    except (ValueError, OverflowError):
        return None


def validate_email_syntax(email: str) -> bool:
    """Validate email syntax only (no deliverability check)."""
    if not email or not email.strip():
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def parse_date(raw: str) -> Optional[datetime]:
    """Try multiple date formats."""
    if not raw or not raw.strip():
        return None
    formats = [
        "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d",
        "%d-%m-%Y", "%m-%d-%Y", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ", "%d %b %Y", "%B %d, %Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(raw.strip(), fmt)
        except ValueError:
            continue
    return None


def parse_csv(content: bytes) -> Tuple[List[Dict[str, Any]], List[str], Dict[str, Any]]:
    """
    Parse CSV bytes into normalized rows.
    Returns (rows, warnings, parse_meta)
    """
    errors = []
    warnings = []

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File too large. Maximum size is 10 MB.")

    # Detect encoding
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = content.decode("latin-1")
            warnings.append("File was decoded using latin-1 (not UTF-8).")
        except Exception:
            raise ValueError("Unable to decode file. Please ensure it is a valid CSV (UTF-8 or latin-1).")

    if not text.strip():
        raise ValueError("The uploaded file is empty.")

    try:
        sample = text[:4096]
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel  # fallback

    reader = csv.DictReader(io.StringIO(text), dialect=dialect)

    if reader.fieldnames is None or len(reader.fieldnames) == 0:
        raise ValueError("No column headers found in the CSV file.")

    raw_headers = [h.strip() for h in reader.fieldnames if h and h.strip()]
    column_mapping, unmapped = map_columns(raw_headers)

    if "company_name" not in column_mapping:
        warnings.append(
            "No 'company name' column detected. Rows will be identified by row number. "
            "Consider adding a 'company_name' column."
        )

    rows = []
    rejected = 0
    row_warnings: List[Dict] = []

    for i, raw_row in enumerate(reader, start=2):
        # Strip whitespace from all values
        row = {k.strip(): (v.strip() if v else "") for k, v in raw_row.items() if k and k.strip()}

        # Check for completely empty rows
        non_empty = [v for v in row.values() if v]
        if not non_empty:
            rejected += 1
            continue

        normalized: Dict[str, Any] = {}
        row_warn: List[str] = []

        # Map columns
        for canonical, raw_col in column_mapping.items():
            val = row.get(raw_col, "").strip()
            normalized[f"_raw_{canonical}"] = val
            if not val:
                normalized[canonical] = None
            else:
                normalized[canonical] = val

        # Normalize specific fields
        if normalized.get("company_domain"):
            nd = normalize_domain(normalized["company_domain"])
            normalized["company_domain"] = nd

        if normalized.get("industry"):
            normalized["industry"] = normalize_industry(normalized["industry"])

        if normalized.get("country"):
            normalized["country"] = normalize_country(normalized["country"])

        if normalized.get("employee_count") is not None:
            ec = parse_employee_count(normalized["employee_count"])
            if ec is None and normalized["employee_count"]:
                row_warn.append(f"Row {i}: employee_count '{normalized['employee_count']}' is not a valid number.")
            normalized["employee_count"] = ec

        if normalized.get("contact_email"):
            if not validate_email_syntax(normalized["contact_email"]):
                row_warn.append(f"Row {i}: email '{normalized['contact_email']}' has invalid syntax.")
                normalized["_email_invalid"] = True

        if normalized.get("last_updated_at"):
            parsed_date = parse_date(normalized["last_updated_at"])
            normalized["_parsed_date"] = parsed_date.isoformat() if parsed_date else None
            if parsed_date is None:
                row_warn.append(f"Row {i}: could not parse date '{normalized['last_updated_at']}'.")

        # Attach original row data
        normalized["_original"] = dict(row)
        normalized["_row_number"] = i
        normalized["_id"] = str(uuid.uuid4())
        normalized["_warnings"] = row_warn

        # Assign display name
        normalized["_display_name"] = (
            normalized.get("company_name")
            or normalized.get("company_domain")
            or f"Row {i}"
        )

        rows.append(normalized)
        row_warnings.extend(row_warn)

    if not rows:
        raise ValueError("No valid rows found after parsing. The CSV may be empty or entirely malformed.")

    if len(rows) > MAX_ROWS:
        rows = rows[:MAX_ROWS]
        warnings.append(f"Only the first {MAX_ROWS} rows were processed.")

    return rows, warnings, {
        "column_mapping": column_mapping,
        "unmapped_columns": unmapped,
        "raw_headers": raw_headers,
        "total_parsed": len(rows),
        "rejected_empty": rejected,
        "row_warnings": row_warnings[:50],  # cap for response size
    }
