"""
ICP Scoring Engine for LeadFit.
Deterministic, configurable, explainable scoring.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from app.models import ICPConfig, CriterionResult, LeadResult


def score_industry(
    row_industry: Optional[str],
    preferred_industries: List[str],
) -> Tuple[float, str, str]:
    """
    Score industry match.
    Returns (score 0-100, status, reason)
    """
    if not row_industry:
        return 0.0, "missing", "Industry field is not present in this record."

    if not preferred_industries:
        return 50.0, "unavailable", "No preferred industries configured; criterion not evaluated."

    # Normalize for comparison
    row_norm = row_industry.lower().strip()
    preferred_norms = [p.lower().strip() for p in preferred_industries]

    if row_norm in preferred_norms:
        return 100.0, "matched", f"Industry '{row_industry}' matches your preferred profile."

    # Partial match: check if any preferred is substring of row or vice versa
    for pref, pref_norm in zip(preferred_industries, preferred_norms):
        if pref_norm in row_norm or row_norm in pref_norm:
            return 60.0, "partial", f"Industry '{row_industry}' partially matches '{pref}'."

    return 0.0, "mismatched", (
        f"Industry '{row_industry}' does not match preferred industries: "
        f"{', '.join(preferred_industries)}."
    )


def score_employees(
    row_employees: Optional[int],
    min_employees: Optional[int],
    max_employees: Optional[int],
) -> Tuple[float, str, str]:
    """Score employee count against range."""
    if row_employees is None:
        return 0.0, "missing", "Employee count is not available for this record."

    if min_employees is None and max_employees is None:
        return 50.0, "unavailable", "No employee range configured; criterion not evaluated."

    lo = min_employees or 0
    hi = max_employees or float("inf")

    if lo <= row_employees <= hi:
        return 100.0, "matched", (
            f"Employee count {row_employees:,} is within target range "
            f"[{lo:,} – {'∞' if hi == float('inf') else f'{hi:,}'}]."
        )

    # Partial credit for being close
    if hi != float("inf"):
        midpoint = (lo + hi) / 2
        distance_ratio = abs(row_employees - midpoint) / max(midpoint, 1)
        if distance_ratio < 0.5:
            score = max(20.0, 80.0 - distance_ratio * 80)
            return score, "partial", (
                f"Employee count {row_employees:,} is outside target range "
                f"[{lo:,} – {hi:,}] but close."
            )

    direction = "too small" if row_employees < lo else "too large"
    limit = f"minimum {lo:,}" if row_employees < lo else f"maximum {hi:,}"
    return 0.0, "mismatched", (
        f"Employee count {row_employees:,} is {direction} (target {limit})."
    )


def score_geography(
    row_country: Optional[str],
    row_region: Optional[str],
    target_countries: List[str],
    target_regions: List[str],
) -> Tuple[float, str, str]:
    """Score geographic match."""
    if not row_country and not row_region:
        return 0.0, "missing", "Geographic information (country/region) is not available."

    if not target_countries and not target_regions:
        return 50.0, "unavailable", "No target geography configured; criterion not evaluated."

    country_norm = (row_country or "").lower().strip()
    region_norm = (row_region or "").lower().strip()
    target_countries_norm = [c.lower().strip() for c in target_countries]
    target_regions_norm = [r.lower().strip() for r in target_regions]

    if country_norm and country_norm in target_countries_norm:
        return 100.0, "matched", f"Country '{row_country}' matches your target geography."

    if region_norm and region_norm in target_regions_norm:
        return 80.0, "partial", f"Region '{row_region}' matches your target regions."

    geo_str = " / ".join(filter(None, [row_country, row_region]))
    targets = ", ".join(target_countries + target_regions) or "none set"
    return 0.0, "mismatched", f"Location '{geo_str}' does not match targets: {targets}."


def score_completeness(
    row: Dict[str, Any],
    required_fields: Optional[List[str]] = None,
) -> Tuple[float, str, str, List[str]]:
    """
    Score data completeness.
    Returns (score, status, reason, missing_fields_list)
    """
    fields_to_check = [
        "company_name", "company_domain", "industry",
        "employee_count", "country", "contact_name", "contact_email",
    ]
    if required_fields:
        fields_to_check = list(set(fields_to_check + required_fields))

    missing = []
    present = 0
    for field in fields_to_check:
        val = row.get(field)
        if val is None or str(val).strip() == "":
            missing.append(field)
        else:
            present += 1

    total = len(fields_to_check)
    score = (present / total) * 100 if total > 0 else 0

    if score >= 85:
        status = "matched"
        reason = f"Data completeness is high ({present}/{total} fields populated)."
    elif score >= 50:
        status = "partial"
        reason = f"Data completeness is moderate ({present}/{total} fields populated). Missing: {', '.join(missing)}."
    else:
        status = "mismatched"
        reason = f"Data completeness is low ({present}/{total} fields populated). Missing: {', '.join(missing)}."

    return score, status, reason, missing


def score_freshness(
    row: Dict[str, Any],
    freshness_days: Optional[int],
) -> Tuple[float, str, str]:
    """Score data freshness based on last_updated_at timestamp."""
    parsed_date_str = row.get("_parsed_date")

    if not parsed_date_str:
        return 0.0, "missing", "No date/timestamp field found; freshness cannot be evaluated."

    if freshness_days is None:
        return 50.0, "unavailable", "No freshness window configured; criterion not evaluated."

    try:
        record_date = datetime.fromisoformat(parsed_date_str)
    except (ValueError, TypeError):
        return 0.0, "missing", "Date field could not be parsed; freshness unknown."

    age_days = (datetime.utcnow() - record_date).days

    if age_days <= freshness_days:
        return 100.0, "matched", (
            f"Data is {age_days} days old, within the {freshness_days}-day freshness window."
        )

    # Partial credit for being within 2x the window
    if age_days <= freshness_days * 2:
        score = max(10.0, 100.0 - (age_days - freshness_days) / freshness_days * 80)
        return score, "partial", (
            f"Data is {age_days} days old, slightly outside the {freshness_days}-day window."
        )

    return 0.0, "mismatched", (
        f"Data is {age_days} days old, well outside the {freshness_days}-day freshness window."
    )


def determine_priority(score: float, coverage: float, icp: ICPConfig) -> str:
    """Assign priority band based on score and coverage."""
    if coverage < icp.min_coverage_threshold:
        return "Insufficient data"
    if score >= icp.high_fit_threshold:
        return "High fit"
    if score >= icp.medium_fit_threshold:
        return "Medium fit"
    return "Low fit"


def score_lead(row: Dict[str, Any], icp: ICPConfig) -> LeadResult:
    """
    Score a single lead against the ICP configuration.
    Returns a LeadResult with criterion breakdown, score, coverage, and explanations.
    """
    criteria_results: List[CriterionResult] = []
    evaluated_weight_sum = 0.0
    weighted_score_sum = 0.0

    # --- Industry ---
    raw_industry = row.get("industry")
    if icp.industry_weight > 0:
        sc, status, reason = score_industry(raw_industry, icp.preferred_industries)
        is_evaluable = status not in ("missing", "unavailable")
        if is_evaluable:
            evaluated_weight_sum += icp.industry_weight
            weighted_score_sum += icp.industry_weight * sc
        criteria_results.append(CriterionResult(
            name="industry",
            score=sc,
            weight=icp.industry_weight,
            status=status,
            reason=reason,
        ))

    # --- Employee size ---
    raw_employees = row.get("employee_count")
    if icp.employee_weight > 0:
        sc, status, reason = score_employees(raw_employees, icp.min_employees, icp.max_employees)
        is_evaluable = status not in ("missing", "unavailable")
        if is_evaluable:
            evaluated_weight_sum += icp.employee_weight
            weighted_score_sum += icp.employee_weight * sc
        criteria_results.append(CriterionResult(
            name="employee_size",
            score=sc,
            weight=icp.employee_weight,
            status=status,
            reason=reason,
        ))

    # --- Completeness ---
    if icp.completeness_weight > 0:
        sc, status, reason, missing_fields = score_completeness(row, icp.required_fields)
        # Completeness is always evaluable
        evaluated_weight_sum += icp.completeness_weight
        weighted_score_sum += icp.completeness_weight * sc
        criteria_results.append(CriterionResult(
            name="data_completeness",
            score=sc,
            weight=icp.completeness_weight,
            status=status,
            reason=reason,
        ))
    else:
        _, _, _, missing_fields = score_completeness(row, icp.required_fields)

    # --- Geography ---
    if icp.geography_weight > 0:
        sc, status, reason = score_geography(
            row.get("country"), row.get("state_or_region"),
            icp.target_countries, icp.target_regions,
        )
        is_evaluable = status not in ("missing", "unavailable")
        if is_evaluable:
            evaluated_weight_sum += icp.geography_weight
            weighted_score_sum += icp.geography_weight * sc
        criteria_results.append(CriterionResult(
            name="geography",
            score=sc,
            weight=icp.geography_weight,
            status=status,
            reason=reason,
        ))

    # --- Freshness ---
    if icp.freshness_weight > 0:
        sc, status, reason = score_freshness(row, icp.data_freshness_days)
        is_evaluable = status not in ("missing", "unavailable")
        if is_evaluable:
            evaluated_weight_sum += icp.freshness_weight
            weighted_score_sum += icp.freshness_weight * sc
        criteria_results.append(CriterionResult(
            name="data_freshness",
            score=sc,
            weight=icp.freshness_weight,
            status=status,
            reason=reason,
        ))

    # Total enabled weight (for coverage calculation)
    total_enabled_weight = (
        icp.industry_weight + icp.employee_weight +
        icp.completeness_weight + icp.geography_weight +
        icp.freshness_weight
    )

    # Weighted ICP Fit Score (renormalized over evaluated criteria only)
    if evaluated_weight_sum > 0:
        final_score = round(weighted_score_sum / evaluated_weight_sum, 2)
    else:
        final_score = 0.0

    # Coverage = sum of evaluated weights / sum of all enabled weights
    if total_enabled_weight > 0:
        coverage = round((evaluated_weight_sum / total_enabled_weight) * 100, 2)
    else:
        coverage = 0.0

    priority = determine_priority(final_score, coverage, icp)

    # Build warnings
    warnings = list(row.get("_warnings", []))
    if row.get("_is_duplicate"):
        dup_reason = row.get("_duplicate_reason", "")
        warnings.append(f"Possible duplicate: {dup_reason}")
    if row.get("_email_invalid"):
        warnings.append("Contact email has invalid syntax.")

    # Determine key reason
    matched = [c for c in criteria_results if c.status == "matched"]
    mismatched = [c for c in criteria_results if c.status == "mismatched"]

    return LeadResult(
        id=row["_id"],
        company_name=row.get("company_name") or row.get("_display_name", "Unknown"),
        company_domain=row.get("company_domain"),
        industry=row.get("industry"),
        employee_count=row.get("employee_count"),
        country=row.get("country"),
        state_or_region=row.get("state_or_region"),
        contact_name=row.get("contact_name"),
        contact_email=row.get("contact_email"),
        last_updated_at=row.get("last_updated_at"),
        score=final_score,
        coverage=coverage,
        priority=priority,
        criteria=criteria_results,
        warnings=warnings,
        is_duplicate=row.get("_is_duplicate", False),
        duplicate_of=row.get("_duplicate_of"),
        missing_fields=missing_fields,
        original_row=row.get("_original", {}),
    )


def score_all_leads(rows: List[Dict[str, Any]], icp: ICPConfig) -> List[LeadResult]:
    """Score all rows and return sorted results."""
    results = [score_lead(row, icp) for row in rows]
    # Sort by score desc, then by coverage desc
    results.sort(key=lambda r: (r.score, r.coverage), reverse=True)
    return results
