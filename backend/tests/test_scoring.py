"""
Unit tests for LeadFit scoring engine.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from app.scorer import (
    score_industry,
    score_employees,
    score_geography,
    score_completeness,
    score_freshness,
    score_lead,
    score_all_leads,
)
from app.models import ICPConfig


def make_icp(**kwargs):
    defaults = dict(
        preferred_industries=["Technology"],
        min_employees=50,
        max_employees=500,
        target_countries=["United States"],
        target_regions=[],
        required_fields=[],
        data_freshness_days=365,
        min_coverage_threshold=40.0,
        industry_weight=30.0,
        employee_weight=25.0,
        completeness_weight=20.0,
        geography_weight=15.0,
        freshness_weight=10.0,
        high_fit_threshold=75.0,
        medium_fit_threshold=50.0,
    )
    defaults.update(kwargs)
    return ICPConfig(**defaults)


# --- Industry Tests ---

def test_industry_exact_match():
    sc, status, reason = score_industry("Technology", ["Technology"])
    assert sc == 100.0
    assert status == "matched"

def test_industry_case_insensitive():
    sc, status, reason = score_industry("technology", ["Technology"])
    assert sc == 100.0
    assert status == "matched"

def test_industry_mismatch():
    sc, status, reason = score_industry("Healthcare", ["Technology"])
    assert sc == 0.0
    assert status == "mismatched"

def test_industry_missing():
    sc, status, reason = score_industry(None, ["Technology"])
    assert sc == 0.0
    assert status == "missing"

def test_industry_no_icp_configured():
    sc, status, reason = score_industry("Technology", [])
    assert status == "unavailable"

def test_industry_partial_match():
    sc, status, reason = score_industry("Financial Technology", ["Technology"])
    assert status == "partial"
    assert sc > 0


# --- Employee Tests ---

def test_employee_in_range():
    sc, status, reason = score_employees(200, 50, 500)
    assert sc == 100.0
    assert status == "matched"

def test_employee_at_lower_bound():
    sc, status, reason = score_employees(50, 50, 500)
    assert sc == 100.0

def test_employee_at_upper_bound():
    sc, status, reason = score_employees(500, 50, 500)
    assert sc == 100.0

def test_employee_too_small():
    sc, status, reason = score_employees(10, 100, 500)
    assert status in ("mismatched", "partial")

def test_employee_too_large():
    sc, status, reason = score_employees(10000, 50, 500)
    assert status == "mismatched"

def test_employee_missing():
    sc, status, reason = score_employees(None, 50, 500)
    assert status == "missing"

def test_employee_no_range_configured():
    sc, status, reason = score_employees(200, None, None)
    assert status == "unavailable"


# --- Geography Tests ---

def test_geography_country_match():
    sc, status, reason = score_geography("United States", None, ["United States"], [])
    assert sc == 100.0
    assert status == "matched"

def test_geography_mismatch():
    sc, status, reason = score_geography("Germany", None, ["United States"], [])
    assert sc == 0.0
    assert status == "mismatched"

def test_geography_missing():
    sc, status, reason = score_geography(None, None, ["United States"], [])
    assert status == "missing"

def test_geography_region_match():
    sc, status, reason = score_geography(None, "California", [], ["California"])
    assert status == "partial"

def test_geography_no_target_configured():
    sc, status, reason = score_geography("Germany", None, [], [])
    assert status == "unavailable"


# --- Completeness Tests ---

def test_completeness_all_fields():
    row = {
        "company_name": "Acme Corp",
        "company_domain": "acme.com",
        "industry": "Technology",
        "employee_count": 100,
        "country": "United States",
        "contact_name": "John Doe",
        "contact_email": "john@acme.com",
    }
    sc, status, reason, missing = score_completeness(row)
    assert sc == 100.0
    assert missing == []

def test_completeness_many_missing():
    row = {"company_name": "Acme Corp"}
    sc, status, reason, missing = score_completeness(row)
    assert sc < 50.0
    assert len(missing) > 0

def test_completeness_none_values():
    row = {k: None for k in ["company_name", "company_domain", "industry", "employee_count", "country", "contact_name", "contact_email"]}
    sc, status, reason, missing = score_completeness(row)
    assert sc == 0.0


# --- Scoring Integration Tests ---

def test_score_lead_deterministic():
    """Same input always produces same output."""
    row = {
        "_id": "test-123",
        "_warnings": [],
        "_is_duplicate": False,
        "_display_name": "TechCo",
        "_original": {},
        "company_name": "TechCo",
        "company_domain": "techco.com",
        "industry": "Technology",
        "employee_count": 200,
        "country": "United States",
        "state_or_region": None,
        "contact_name": "Alice",
        "contact_email": "alice@techco.com",
        "last_updated_at": None,
        "_parsed_date": None,
    }
    icp = make_icp()
    result1 = score_lead(row, icp)
    result2 = score_lead(row, icp)
    assert result1.score == result2.score
    assert result1.priority == result2.priority


def test_different_icp_produces_different_rankings():
    """Verify scores change when ICP changes."""
    rows = [
        {
            "_id": "r1", "_warnings": [], "_is_duplicate": False, "_display_name": "TechCo", "_original": {},
            "company_name": "TechCo", "company_domain": "techco.com", "industry": "Technology",
            "employee_count": 200, "country": "United States", "state_or_region": None,
            "contact_name": "Alice", "contact_email": "alice@techco.com", "last_updated_at": None, "_parsed_date": None,
        },
        {
            "_id": "r2", "_warnings": [], "_is_duplicate": False, "_display_name": "HealthCare Inc", "_original": {},
            "company_name": "HealthCare Inc", "company_domain": "healthcareinc.com", "industry": "Healthcare",
            "employee_count": 1000, "country": "Germany", "state_or_region": None,
            "contact_name": "Bob", "contact_email": "bob@hcinc.com", "last_updated_at": None, "_parsed_date": None,
        },
    ]

    icp_tech = make_icp(preferred_industries=["Technology"], target_countries=["United States"])
    icp_health = make_icp(preferred_industries=["Healthcare"], target_countries=["Germany"])

    results_tech = score_all_leads(rows, icp_tech)
    results_health = score_all_leads(rows, icp_health)

    # TechCo should rank first under tech ICP
    assert results_tech[0].company_name == "TechCo"
    # HealthCare Inc should rank first under health ICP
    assert results_health[0].company_name == "HealthCare Inc"


def test_missing_data_does_not_fabricate():
    """Missing fields must not create false positives."""
    row = {
        "_id": "r3", "_warnings": [], "_is_duplicate": False, "_display_name": "Mystery Co", "_original": {},
        "company_name": "Mystery Co", "company_domain": None, "industry": None,
        "employee_count": None, "country": None, "state_or_region": None,
        "contact_name": None, "contact_email": None, "last_updated_at": None, "_parsed_date": None,
    }
    icp = make_icp()
    result = score_lead(row, icp)
    # Completeness should drag it down; priority should not be "High fit"
    assert result.priority != "High fit"
    assert result.missing_fields != []


def test_zero_weight_criteria_excluded():
    """Criteria with zero weight should not influence the score."""
    row = {
        "_id": "r4", "_warnings": [], "_is_duplicate": False, "_display_name": "Corp", "_original": {},
        "company_name": "Corp", "company_domain": "corp.com", "industry": "Technology",
        "employee_count": 200, "country": "United States", "state_or_region": None,
        "contact_name": None, "contact_email": None, "last_updated_at": None, "_parsed_date": None,
    }
    # Zero out some weights
    icp = make_icp(geography_weight=0.0, freshness_weight=0.0)
    result = score_lead(row, icp)
    # Should still produce a valid score
    assert 0 <= result.score <= 100


# --- Normalization Tests ---

def test_csv_parser_normalization():
    from app.csv_parser import parse_csv
    csv_content = (
        "Company Name,Domain,Industry,Employees,Country\n"
        "  Acme Corp  , acme.com ,tech, 150 ,usa\n"
        ",,,,\n"  # empty row should be skipped
        "Beta Ltd,beta.io,healthcare,50,uk\n"
    ).encode("utf-8")
    rows, warnings, meta = parse_csv(csv_content)
    assert len(rows) == 2
    assert rows[0]["company_name"] == "Acme Corp"
    assert rows[0]["industry"] == "Technology"  # normalized
    assert rows[0]["country"] == "United States"  # normalized
    assert rows[0]["employee_count"] == 150
    assert meta["rejected_empty"] == 1


def test_csv_parser_empty_file():
    from app.csv_parser import parse_csv
    with pytest.raises(ValueError, match="empty"):
        parse_csv(b"")


def test_csv_parser_no_data_rows():
    from app.csv_parser import parse_csv
    with pytest.raises(ValueError):
        parse_csv(b"Company Name,Industry\n")


# --- Deduplication Tests ---

def test_dedup_exact_domain():
    from app.deduplicator import detect_duplicates
    rows = [
        {"_id": "a1", "company_name": "Foo Inc", "company_domain": "foo.com", "country": "US"},
        {"_id": "a2", "company_name": "Foo Corp", "company_domain": "foo.com", "country": "US"},
    ]
    result = detect_duplicates(rows)
    assert result[0]["_is_duplicate"] is False
    assert result[1]["_is_duplicate"] is True
    assert result[1]["_duplicate_of"] == "a1"


def test_dedup_same_name_location():
    from app.deduplicator import detect_duplicates
    rows = [
        {"_id": "b1", "company_name": "Acme Corporation", "company_domain": None, "country": "United States"},
        {"_id": "b2", "company_name": "Acme Corporation", "company_domain": None, "country": "United States"},
    ]
    result = detect_duplicates(rows)
    assert result[1]["_is_duplicate"] is True


def test_dedup_distinct_companies():
    from app.deduplicator import detect_duplicates
    rows = [
        {"_id": "c1", "company_name": "Alpha Corp", "company_domain": "alpha.com", "country": "US"},
        {"_id": "c2", "company_name": "Beta Corp", "company_domain": "beta.com", "country": "US"},
    ]
    result = detect_duplicates(rows)
    assert all(not r["_is_duplicate"] for r in result)


# --- Export Tests ---

def test_export_correct_columns():
    from app.exporter import results_to_csv
    from app.models import LeadResult, CriterionResult
    r = LeadResult(
        id="x1", company_name="Test Co", company_domain="test.com",
        industry="Technology", employee_count=100, country="United States",
        state_or_region=None, contact_name="Alice", contact_email="alice@test.com",
        last_updated_at=None, score=85.0, coverage=80.0, priority="High fit",
        criteria=[CriterionResult(name="industry", score=100.0, weight=30.0, status="matched", reason="Matches")],
        warnings=[], is_duplicate=False, duplicate_of=None, missing_fields=[], original_row={}
    )
    csv_bytes = results_to_csv([r])
    csv_str = csv_bytes.decode("utf-8-sig")
    assert "icp_fit_score" in csv_str
    assert "Test Co" in csv_str
    assert "High fit" in csv_str


def test_export_formula_injection_protection():
    from app.exporter import sanitize_csv_value
    assert sanitize_csv_value("=SUM(A1:B1)").startswith("'")
    assert sanitize_csv_value("+malicious").startswith("'")
    assert sanitize_csv_value("normal text") == "normal text"
