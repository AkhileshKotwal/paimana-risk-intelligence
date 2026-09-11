"""
PAIMANA SIH 26103 - FastAPI Decision Support & Early Warning REST API
Serves verified MoSPI infrastructure monitoring data, ML model inferences,
temporal trends, Top-5 historical precedents, and scenario predictions.
"""
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, List, Optional, Any
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]

# Global in-memory cache
DATA_CACHE: Dict[str, Any] = {
    "projects": [],
    "projects_map": {},
    "portfolio": {},
    "alerts": [],
    "models": {},
    "evaluation": {},
    "comparables_df": None
}


def load_data_and_models():
    print("[API Startup] Loading PAIMANA datasets and trained ML pipelines...")
    
    # 1. Load compiled project dataset
    json_path = ROOT / "frontend" / "src" / "data" / "paimana_data.json"
    if not json_path.exists():
        json_path = ROOT / "frontend" / "public" / "data" / "paimana_data.json"
        
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            compiled = json.load(f)
            kpi = compiled.get("kpi", {})
            DATA_CACHE["portfolio"] = {
                **kpi,
                "total_original_cost_cr": kpi.get("total_sanctioned_cr", kpi.get("total_original_cost_cr", 0)),
                "sector_breakdown": compiled.get("sectors", []),
                "agency_rankings": compiled.get("agencies", []),
                "ministry_breakdown": compiled.get("ministries", [])
            }
            DATA_CACHE["projects"] = compiled.get("projects", [])
            DATA_CACHE["alerts"] = compiled.get("alerts", [])
            for p in DATA_CACHE["projects"]:
                if "cost_risk_pct" not in p and "cost_risk_score" in p:
                    p["cost_risk_pct"] = p["cost_risk_score"]
                if "time_risk_pct" not in p and "time_risk_score" in p:
                    p["time_risk_pct"] = p["time_risk_score"]
            DATA_CACHE["projects_map"] = {str(p["project_code"]): p for p in DATA_CACHE["projects"]}
            print(f"[API Startup] Loaded {len(DATA_CACHE['projects']):,} projects from compiled cache.")
    else:
        print("[API Startup] Warning: Compiled JSON cache not found.")

    # 2. Load model evaluation report
    report_path = ROOT / "results" / "model_evaluation_report.json"
    if report_path.exists():
        with open(report_path, "r", encoding="utf-8") as f:
            DATA_CACHE["evaluation"] = json.load(f)
            print("[API Startup] Loaded model evaluation report.")

    # 3. Load production ML pipelines
    cost_model_path = ROOT / "backend" / "models" / "cost_monitor.joblib"
    time_model_path = ROOT / "backend" / "models" / "time_monitor.joblib"
    
    if cost_model_path.exists():
        try:
            DATA_CACHE["models"]["cost"] = joblib.load(cost_model_path)
            print("[API Startup] Loaded cost overrun model pipeline.")
        except Exception as e:
            print(f"[API Startup] Error loading cost model: {e}")

    if time_model_path.exists():
        try:
            DATA_CACHE["models"]["time"] = joblib.load(time_model_path)
            print("[API Startup] Loaded time overrun model pipeline.")
        except Exception as e:
            print(f"[API Startup] Error loading time model: {e}")

    # 4. Load historical precedents
    comp_path = ROOT / "results" / "historical_comparables.csv"
    if comp_path.exists():
        try:
            DATA_CACHE["comparables_df"] = pd.read_csv(comp_path)
            print(f"[API Startup] Loaded {len(DATA_CACHE['comparables_df']):,} comparable precedents.")
        except Exception as e:
            print(f"[API Startup] Error loading historical comparables: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_data_and_models()
    yield


app = FastAPI(
    title="PAIMANA Early-Warning Infrastructure Intelligence API",
    description="MoSPI Central Sector Projects Decision Support & Risk Intelligence Engine (SIH 26103)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionInput(BaseModel):
    original_cost_cr: float = Field(..., gt=0, description="Original sanctioned cost in ₹ Crores")
    planned_duration_months: float = Field(..., gt=0, description="Planned project duration in months")
    physical_progress_pct: float = Field(..., ge=0, le=100, description="Current physical progress (%)")
    cumulative_expenditure_cr: float = Field(..., ge=0, description="Cumulative expenditure to date in ₹ Crores")
    project_age_months: float = Field(..., ge=0, description="Elapsed months since date of approval")
    approval_to_start_months: float = Field(default=6.0, ge=0, description="Months elapsed between sanction and physical work commencement")
    progress_velocity_pct_month: float = Field(default=1.5, description="Physical progress rate (% per month)")
    expenditure_velocity_cr_month: float = Field(default=10.0, description="Expenditure rate (₹ Cr per month)")
    sector: str = Field(default="Road Transport and Highways", description="Infrastructure sector")
    ministry: str = Field(default="Ministry of Road Transport and Highways", description="Nodal Ministry")
    agency: str = Field(default="NHAI", description="Executing agency")
    state: str = Field(default="Multi-State", description="Project location state")
    is_multi_state: int = Field(default=0, ge=0, le=1)


@app.get("/")
def api_index():
    return {
        "title": "PAIMANA SIH 26103 REST API",
        "description": "Government of India Institutional Infrastructure Monitoring & Decision Support Platform",
        "version": "2.0.0",
        "source": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "monitoring_cycle": "July 2026 (1,775 active projects, ₹150 Cr+ threshold)",
        "docs": "/docs",
        "endpoints": [
            "/api/health",
            "/api/portfolio",
            "/api/projects",
            "/api/projects/{project_code}",
            "/api/alerts",
            "/api/models/evaluation",
            "/api/predict"
        ]
    }


@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "database": "online",
        "active_snapshot": "July 2026",
        "projects_count": len(DATA_CACHE["projects"]),
        "alerts_count": len(DATA_CACHE["alerts"]),
        "models_loaded": {
            "cost_monitor": "cost" in DATA_CACHE["models"],
            "time_monitor": "time" in DATA_CACHE["models"]
        },
        "comparables_records": len(DATA_CACHE["comparables_df"]) if DATA_CACHE["comparables_df"] is not None else 0
    }


@app.get("/api/portfolio")
def get_portfolio_summary():
    if not DATA_CACHE["portfolio"]:
        raise HTTPException(status_code=503, detail="Portfolio data not initialized.")
    return DATA_CACHE["portfolio"]


@app.get("/api/projects")
def list_projects(
    search: Optional[str] = Query(None, description="Search term for project code, name, or agency"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    ministry: Optional[str] = Query(None, description="Filter by ministry"),
    state: Optional[str] = Query(None, description="Filter by state"),
    risk_band: Optional[str] = Query(None, description="Filter by risk band (CRITICAL, HIGH, MEDIUM, LOW)"),
    has_emerging_risk: Optional[bool] = Query(None, description="Filter projects with emerging risk flags"),
    sort_by: str = Query("priority_score", description="Field to sort by"),
    order: str = Query("desc", description="Sort order ('asc' or 'desc')"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Records per page")
):
    projects = DATA_CACHE["projects"]
    
    # Filtering
    filtered = projects
    if search:
        s = search.lower().strip()
        filtered = [
            p for p in filtered
            if s in str(p.get("project_name", "")).lower()
            or s in str(p.get("project_code", "")).lower()
            or s in str(p.get("agency", "")).lower()
            or s in str(p.get("sector", "")).lower()
        ]

    if sector and sector != "All Sectors":
        filtered = [p for p in filtered if p.get("sector") == sector]

    if ministry and ministry != "All Ministries":
        filtered = [p for p in filtered if p.get("ministry") == ministry]

    if state and state != "All States":
        filtered = [p for p in filtered if p.get("state") == state]

    if risk_band and risk_band != "All":
        filtered = [p for p in filtered if p.get("risk_band") == risk_band]

    if has_emerging_risk is not None:
        filtered = [p for p in filtered if p.get("has_emerging_risk") == has_emerging_risk]

    # Sorting
    reverse = (order.lower() == "desc")
    try:
        filtered.sort(key=lambda x: (x.get(sort_by) is not None, x.get(sort_by) or 0), reverse=reverse)
    except Exception:
        filtered.sort(key=lambda x: x.get("priority_score", 0), reverse=True)

    # Pagination
    total = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    items = filtered[start_idx:end_idx]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "items": items
    }


@app.get("/api/projects/{project_code}")
def get_project_detail(project_code: str):
    p = DATA_CACHE["projects_map"].get(str(project_code))
    if not p:
        raise HTTPException(status_code=404, detail=f"Project code '{project_code}' not found in active inventory.")
    
    # Check if Top-5 comparables exist from historical lookup
    comparables = []
    cdf = DATA_CACHE.get("comparables_df")
    if cdf is not None:
        matches = cdf[cdf["project_code"].astype(str) == str(project_code)].sort_values("similarity_pct", ascending=False)
        if not matches.empty:
            comparables = matches.head(5).to_dict(orient="records")

    # If project already has comparables in pre-compiled format and cdf yielded none, keep existing
    if not comparables and "comparables" in p:
        comparables = p["comparables"]

    result = dict(p)
    result["top_comparables"] = comparables
    return result


@app.get("/api/alerts")
def get_alerts(
    level: Optional[str] = Query(None, description="Alert level filter (CRITICAL, HIGH, MEDIUM, LOW)"),
    type: Optional[str] = Query(None, description="Alert type filter"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of alerts to return")
):
    alerts = DATA_CACHE["alerts"]
    if level and level != "All":
        alerts = [a for a in alerts if a.get("level") == level]
    if type and type != "All":
        alerts = [a for a in alerts if a.get("type") == type]
    return {
        "total": len(alerts),
        "alerts": alerts[:limit]
    }


@app.get("/api/models/evaluation")
def get_model_evaluation():
    if not DATA_CACHE["evaluation"]:
        raise HTTPException(status_code=503, detail="Model evaluation report not initialized.")
    return DATA_CACHE["evaluation"]


@app.post("/api/predict")
def predict_scenario_risk(payload: PredictionInput):
    """
    Real-time what-if scenario testing:
    Feeds user-supplied parameters through the trained production XGBoost pipelines
    to compute deterministic cost and time overrun probabilities.
    """
    cost_model = DATA_CACHE["models"].get("cost")
    time_model = DATA_CACHE["models"].get("time")

    if not cost_model or not time_model:
        raise HTTPException(status_code=503, detail="Trained production models are not loaded in memory.")

    # Calculate engineered features
    log_cost = float(np.log10(max(payload.original_cost_cr, 1.0)))
    exp_pct = (payload.cumulative_expenditure_cr / max(payload.original_cost_cr, 1.0)) * 100.0
    progress_gap = payload.physical_progress_pct - exp_pct
    prog_per_month = payload.physical_progress_pct / max(payload.project_age_months, 1.0)
    
    current_year = 2026
    start_year = current_year - int(payload.project_age_months // 12)
    approval_year = start_year - int(payload.approval_to_start_months // 12)

    # Feature row matching training schema
    feature_dict = {
        "log_original_cost": log_cost,
        "planned_duration_months": payload.planned_duration_months,
        "approval_to_start_months": payload.approval_to_start_months,
        "project_age_months": payload.project_age_months,
        "physical_progress_pct": payload.physical_progress_pct,
        "cumulative_expenditure_cr": payload.cumulative_expenditure_cr,
        "expenditure_pct_of_original": exp_pct,
        "progress_minus_expenditure_pct": progress_gap,
        "progress_per_age_month": prog_per_month,
        "progress_velocity_pct_month": payload.progress_velocity_pct_month,
        "expenditure_velocity_cr_month": payload.expenditure_velocity_cr_month,
        "approval_year": approval_year,
        "start_year": start_year,
        "is_multi_state": payload.is_multi_state,
        "agency_hist_cost_overrun_pct": 25.0,
        "sector_hist_cost_overrun_pct": 24.0,
        "ministry_hist_cost_overrun_pct": 24.5,
        "agency_hist_time_overrun_rate": 0.65,
        "sector_hist_time_overrun_rate": 0.64,
        "ministry_hist_time_overrun_rate": 0.64,
        "agency": payload.agency,
        "ministry": payload.ministry,
        "sector": payload.sector,
        "state": payload.state
    }

    input_df = pd.DataFrame([feature_dict])

    try:
        cost_prob = float(cost_model.predict_proba(input_df)[:, 1][0]) * 100.0
        time_prob = float(time_model.predict_proba(input_df)[:, 1][0]) * 100.0
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(e)}")

    # Priority score
    scale_factor = min(100.0, (log_cost / np.log10(50000.0)) * 100.0)
    priority_score = round((0.40 * cost_prob) + (0.35 * time_prob) + (0.25 * scale_factor), 1)

    # Risk band
    if priority_score >= 70.0 or (cost_prob >= 75.0 and time_prob >= 75.0):
        risk_band = "CRITICAL"
    elif priority_score >= 50.0 or cost_prob >= 65.0 or time_prob >= 65.0:
        risk_band = "HIGH"
    elif priority_score >= 30.0:
        risk_band = "MEDIUM"
    else:
        risk_band = "LOW"

    # Actionable operational guidance
    recommendations = []
    if progress_gap < -20.0:
        recommendations.append("Severe negative physical-financial gap: Conduct technical forensic progress audit.")
    if payload.progress_velocity_pct_month < 0.5 and payload.expenditure_velocity_cr_month > 10.0:
        recommendations.append("High capital burn with stagnant progress: Review contractor billings against milestone completion.")
    if time_prob > 70.0:
        recommendations.append("High schedule slippage probability: Fast-track statutory clearances and utility shifting.")
    if cost_prob > 70.0:
        recommendations.append("Elevated cost escalation probability: Freeze scope variations and index price escalation formulas.")
    if not recommendations:
        recommendations.append("Project trajectory within nominal tolerances. Continue bi-weekly monitoring.")

    inputs_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()

    return {
        "inputs": inputs_dict,
        "predictions": {
            "cost_overrun_risk_pct": round(cost_prob, 1),
            "time_overrun_risk_pct": round(time_prob, 1),
            "priority_score": priority_score,
            "risk_band": risk_band
        },
        "operational_recommendations": recommendations
    }
