"""
Automated tests for FastAPI endpoints.
Tests /api/health, /api/portfolio, /api/projects, /api/projects/{id}, /api/alerts, and /api/predict.
"""
from fastapi.testclient import TestClient
import pytest
from backend.app import app, load_data_and_models

# Ensure data is loaded
load_data_and_models()
client = TestClient(app)


def test_api_index():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PAIMANA SIH 26103" in data["title"]
    assert "endpoints" in data


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["projects_count"] == 1775
    assert data["models_loaded"]["cost_monitor"] is True
    assert data["models_loaded"]["time_monitor"] is True


def test_api_portfolio():
    response = client.get("/api/portfolio")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] == 1775
    assert data["total_original_cost_cr"] > 0
    assert "sector_breakdown" in data
    assert "agency_rankings" in data


def test_api_projects_list_and_filters():
    # 1. Base pagination
    response = client.get("/api/projects?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1775
    assert len(data["items"]) == 10

    # 2. Filter by risk band
    crit_resp = client.get("/api/projects?risk_band=CRITICAL")
    assert crit_resp.status_code == 200
    crit_data = crit_resp.json()
    assert crit_data["total"] > 0
    for item in crit_data["items"]:
        assert item["risk_band"] == "CRITICAL"

    # 3. Search query
    search_resp = client.get("/api/projects?search=NHAI")
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert search_data["total"] > 0


def test_api_project_detail():
    # Get first project from list
    list_resp = client.get("/api/projects?page=1&page_size=1")
    project_code = list_resp.json()["items"][0]["project_code"]

    detail_resp = client.get(f"/api/projects/{project_code}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["project_code"] == project_code
    assert "cost_risk_pct" in detail
    assert "time_risk_pct" in detail
    assert "top_comparables" in detail


def test_api_project_detail_not_found():
    response = client.get("/api/projects/NON_EXISTENT_PROJECT_XYZ_999")
    assert response.status_code == 404


def test_api_alerts():
    response = client.get("/api/alerts?limit=20")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert len(data["alerts"]) <= 20


def test_api_predict_scenario():
    payload = {
        "original_cost_cr": 1250.0,
        "planned_duration_months": 36.0,
        "physical_progress_pct": 35.0,
        "cumulative_expenditure_cr": 850.0,
        "project_age_months": 28.0,
        "approval_to_start_months": 6.0,
        "progress_velocity_pct_month": 0.8,
        "expenditure_velocity_cr_month": 25.0,
        "sector": "Road Transport and Highways",
        "ministry": "Ministry of Road Transport and Highways",
        "agency": "NHAI",
        "state": "Maharashtra",
        "is_multi_state": 0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert 0 <= data["predictions"]["cost_overrun_risk_pct"] <= 100
    assert 0 <= data["predictions"]["time_overrun_risk_pct"] <= 100
    assert "operational_recommendations" in data
    assert len(data["operational_recommendations"]) > 0
