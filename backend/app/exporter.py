"""
CSV Export Service for LeadFit.
Generates sanitized CSV output with all scoring data.
"""
import csv
import io
from typing import Any, Dict, List
from app.models import LeadResult


def sanitize_csv_value(value: Any) -> str:
    """Escape values to prevent formula injection in spreadsheets."""
    s = str(value) if value is not None else ""
    # Prevent formula injection: prefix with ' if starts with dangerous chars
    if s and s[0] in ('=', '+', '-', '@', '\t', '\r'):
        s = "'" + s
    return s


def results_to_csv(results: List[LeadResult]) -> bytes:
    """Convert LeadResult list to CSV bytes."""
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)

    # Determine criterion names from first result
    criterion_names = []
    if results:
        criterion_names = [c.name for c in results[0].criteria]

    headers = [
        "company_name", "company_domain", "industry", "employee_count",
        "country", "state_or_region", "contact_name", "contact_email",
        "last_updated_at", "icp_fit_score", "coverage_pct", "priority",
        "is_duplicate", "duplicate_of", "missing_fields", "warnings",
    ]
    # Add per-criterion columns
    for cname in criterion_names:
        headers.append(f"criterion_{cname}_score")
        headers.append(f"criterion_{cname}_status")
        headers.append(f"criterion_{cname}_reason")

    writer.writerow([sanitize_csv_value(h) for h in headers])

    for r in results:
        crit_map = {c.name: c for c in r.criteria}
        row = [
            sanitize_csv_value(r.company_name),
            sanitize_csv_value(r.company_domain or ""),
            sanitize_csv_value(r.industry or ""),
            sanitize_csv_value(r.employee_count or ""),
            sanitize_csv_value(r.country or ""),
            sanitize_csv_value(r.state_or_region or ""),
            sanitize_csv_value(r.contact_name or ""),
            sanitize_csv_value(r.contact_email or ""),
            sanitize_csv_value(r.last_updated_at or ""),
            sanitize_csv_value(round(r.score, 2)),
            sanitize_csv_value(round(r.coverage, 2)),
            sanitize_csv_value(r.priority),
            sanitize_csv_value("yes" if r.is_duplicate else "no"),
            sanitize_csv_value(r.duplicate_of or ""),
            sanitize_csv_value("; ".join(r.missing_fields)),
            sanitize_csv_value("; ".join(r.warnings)),
        ]
        for cname in criterion_names:
            c = crit_map.get(cname)
            if c:
                row.extend([
                    sanitize_csv_value(round(c.score, 2)),
                    sanitize_csv_value(c.status),
                    sanitize_csv_value(c.reason),
                ])
            else:
                row.extend(["", "", ""])

        writer.writerow(row)

    return output.getvalue().encode("utf-8-sig")  # BOM for Excel compatibility
