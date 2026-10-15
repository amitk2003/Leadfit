"""
LeadFit API Routes - Lead analysis endpoints.
"""
import json
from collections import Counter
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.csv_parser import parse_csv
from app.deduplicator import detect_duplicates
from app.exporter import results_to_csv
from app.models import AnalysisResponse, ICPConfig, LeadResult, RecalculateRequest
from app.scorer import score_all_leads

router = APIRouter()


def build_summary(
    rows: List[Dict],
    results: List[LeadResult],
    parse_meta: Dict,
) -> Dict[str, Any]:
    """Build the analysis summary statistics."""
    priority_counts = Counter(r.priority for r in results)
    duplicate_count = sum(1 for r in results if r.is_duplicate)

    # Most common missing fields
    all_missing = []
    for r in results:
        all_missing.extend(r.missing_fields)
    top_missing = [field for field, _ in Counter(all_missing).most_common(5)]

    return {
        "input_rows": parse_meta.get("total_parsed", 0) + parse_meta.get("rejected_empty", 0),
        "processed_rows": len(results),
        "rejected_empty": parse_meta.get("rejected_empty", 0),
        "duplicate_candidates": duplicate_count,
        "high_fit": priority_counts.get("High fit", 0),
        "medium_fit": priority_counts.get("Medium fit", 0),
        "low_fit": priority_counts.get("Low fit", 0),
        "insufficient_data": priority_counts.get("Insufficient data", 0),
        "most_missing_fields": top_missing,
        "row_warnings": parse_meta.get("row_warnings", [])[:20],
        "unmapped_columns": parse_meta.get("unmapped_columns", []),
    }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_leads(
    file: UploadFile = File(...),
    icp: str = Form(...),
):
    """
    Upload a CSV and analyze leads against the provided ICP configuration.
    """
    # Validate file type
    if file.filename and not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported. Please upload a .csv file."
        )

    # Read file content
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Parse ICP config
    try:
        icp_data = json.loads(icp)
        icp_config = ICPConfig(**icp_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ICP configuration: {str(e)}")

    # Validate weights
    total_weight = (
        icp_config.industry_weight + icp_config.employee_weight +
        icp_config.completeness_weight + icp_config.geography_weight +
        icp_config.freshness_weight
    )
    if total_weight <= 0:
        raise HTTPException(
            status_code=400,
            detail="At least one criterion must have a positive weight."
        )

    # Parse CSV
    try:
        rows, warnings, parse_meta = parse_csv(content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"CSV parsing error: {str(e)}")

    # Detect duplicates
    rows = detect_duplicates(rows)

    # Score leads
    results = score_all_leads(rows, icp_config)

    summary = build_summary(rows, results, parse_meta)
    if warnings:
        summary["parse_warnings"] = warnings

    return AnalysisResponse(
        summary=summary,
        results=results,
        columns_detected=parse_meta.get("raw_headers", []),
        columns_mapped=parse_meta.get("column_mapping", {}),
    )


@router.post("/recalculate", response_model=AnalysisResponse)
async def recalculate_leads(request: RecalculateRequest):
    """
    Recalculate scores using already-parsed leads and a new ICP config.
    Avoids re-uploading the CSV.
    """
    if not request.leads:
        raise HTTPException(status_code=400, detail="No leads provided for recalculation.")

    icp_config = request.icp

    total_weight = (
        icp_config.industry_weight + icp_config.employee_weight +
        icp_config.completeness_weight + icp_config.geography_weight +
        icp_config.freshness_weight
    )
    if total_weight <= 0:
        raise HTTPException(
            status_code=400,
            detail="At least one criterion must have a positive weight."
        )

    rows = request.leads
    rows = detect_duplicates(rows)
    results = score_all_leads(rows, icp_config)

    parse_meta = {
        "total_parsed": len(rows),
        "rejected_empty": 0,
        "row_warnings": [],
        "unmapped_columns": [],
        "raw_headers": list(rows[0].keys()) if rows else [],
        "column_mapping": {},
    }
    summary = build_summary(rows, results, parse_meta)

    return AnalysisResponse(
        summary=summary,
        results=results,
        columns_detected=[],
        columns_mapped={},
    )


@router.post("/export")
async def export_leads(request: RecalculateRequest):
    """
    Export leads as a scored CSV file.
    Scores are recalculated from the provided data + ICP config.
    """
    if not request.leads:
        raise HTTPException(status_code=400, detail="No leads provided for export.")

    rows = detect_duplicates(request.leads)
    results = score_all_leads(rows, request.icp)

    try:
        csv_bytes = results_to_csv(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="leadfit_results.csv"',
            "Content-Type": "text/csv; charset=utf-8-sig",
        },
    )
