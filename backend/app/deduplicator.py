"""
Duplicate detection for LeadFit.
Uses normalized domains and company name+location heuristics.
"""
from typing import Any, Dict, List, Optional, Tuple


def normalize_for_dedup(s: Optional[str]) -> str:
    """Normalize a string for deduplication comparison."""
    if not s:
        return ""
    import re
    s = s.lower().strip()
    # Remove common legal suffixes
    s = re.sub(r'\b(inc|llc|ltd|corp|co|company|group|holdings|international|technologies|solutions|services)\b', '', s)
    # Remove punctuation and extra spaces
    s = re.sub(r'[^\w\s]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def detect_duplicates(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect likely duplicate records.
    Strategy:
    1. Exact normalized domain match -> definite flag.
    2. If no domain, normalized company name + country -> flag as suspected.
    Returns rows with _is_duplicate and _duplicate_of fields set.
    """
    domain_index: Dict[str, str] = {}   # domain -> first occurrence id
    name_loc_index: Dict[str, str] = {} # name+loc -> first occurrence id

    for row in rows:
        row_id = row["_id"]
        row["_is_duplicate"] = False
        row["_duplicate_of"] = None

        domain = row.get("company_domain")
        company_name = row.get("company_name")
        country = row.get("country")

        # Strategy 1: domain-based
        if domain and domain.strip():
            norm_domain = domain.strip().lower()
            if norm_domain in domain_index:
                row["_is_duplicate"] = True
                row["_duplicate_of"] = domain_index[norm_domain]
                row["_duplicate_reason"] = f"Same domain: {norm_domain}"
            else:
                domain_index[norm_domain] = row_id

        # Strategy 2: name+location-based (only if no domain match)
        if not row["_is_duplicate"] and company_name:
            norm_name = normalize_for_dedup(company_name)
            norm_country = normalize_for_dedup(country or "")
            key = f"{norm_name}||{norm_country}"

            if norm_name and key in name_loc_index:
                row["_is_duplicate"] = True
                row["_duplicate_of"] = name_loc_index[key]
                row["_duplicate_reason"] = f"Similar name '{company_name}' in same location"
            elif norm_name:
                name_loc_index[key] = row_id

    return rows
