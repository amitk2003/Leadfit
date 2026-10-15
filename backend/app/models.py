"""
Pydantic models for LeadFit API request/response schemas.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ICPCriterion(BaseModel):
    enabled: bool = True
    weight: float = Field(ge=0, le=100)


class ICPConfig(BaseModel):
    preferred_industries: List[str] = []
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    target_countries: List[str] = []
    target_regions: List[str] = []
    required_fields: List[str] = []
    data_freshness_days: Optional[int] = None
    min_coverage_threshold: float = Field(default=40.0, ge=0, le=100)

    # Criterion weights (must sum to ~100 or be renormalized)
    industry_weight: float = Field(default=30.0, ge=0, le=100)
    employee_weight: float = Field(default=25.0, ge=0, le=100)
    completeness_weight: float = Field(default=20.0, ge=0, le=100)
    geography_weight: float = Field(default=15.0, ge=0, le=100)
    freshness_weight: float = Field(default=10.0, ge=0, le=100)

    # Score thresholds
    high_fit_threshold: float = Field(default=75.0, ge=0, le=100)
    medium_fit_threshold: float = Field(default=50.0, ge=0, le=100)


class RecalculateRequest(BaseModel):
    leads: List[Dict[str, Any]]
    icp: ICPConfig


class CriterionResult(BaseModel):
    name: str
    score: float
    weight: float
    status: str  # "matched", "partial", "mismatched", "missing", "unavailable"
    reason: str


class LeadResult(BaseModel):
    id: str
    company_name: str
    company_domain: Optional[str]
    industry: Optional[str]
    employee_count: Optional[int]
    country: Optional[str]
    state_or_region: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    last_updated_at: Optional[str]
    score: float
    coverage: float
    priority: str  # "High fit", "Medium fit", "Low fit", "Insufficient data"
    criteria: List[CriterionResult]
    warnings: List[str]
    is_duplicate: bool
    duplicate_of: Optional[str]
    missing_fields: List[str]
    original_row: Dict[str, Any]


class AnalysisResponse(BaseModel):
    summary: Dict[str, Any]
    results: List[LeadResult]
    columns_detected: List[str]
    columns_mapped: Dict[str, str]
