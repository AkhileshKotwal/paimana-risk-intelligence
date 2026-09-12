import json
from pathlib import Path

import pandas as pd

from backend.risk_scoring import calculate_priority_score, determine_risk_band

ROOT = Path(__file__).resolve().parents[1]


def test_frontend_projects_use_canonical_priority_and_band():
    payload = json.loads((ROOT / "frontend" / "src" / "data" / "paimana_data.json").read_text(encoding="utf-8"))
    for project in payload["projects"][:50]:
        expected_score = calculate_priority_score(
            project["cost_risk_pct"],
            project["time_risk_pct"],
            project.get("forward_escalation_risk_pct", 0.0),
            project["original_cost_cr"],
        )
        assert project["priority_score"] == expected_score
        assert project["risk_band"] == determine_risk_band(
            expected_score, project["cost_risk_pct"], project["time_risk_pct"]
        )


def test_comparables_never_match_the_same_project():
    path = ROOT / "results" / "historical_comparables.csv"
    comparisons = pd.read_csv(path)
    assert not (comparisons["project_code"].astype(str) == comparisons["comparable_project_code"].astype(str)).any()
    assert "similarity_score" in comparisons.columns
    assert "similarity_pct" not in comparisons.columns


def test_alerts_have_consistent_evidence_type():
    payload = json.loads((ROOT / "frontend" / "src" / "data" / "paimana_data.json").read_text(encoding="utf-8"))
    projects = {project["project_code"]: project for project in payload["projects"]}
    for alert in payload["alerts"]:
        project = projects[alert["project_code"]]
        assert alert["severity"] in {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
        assert alert["trigger_type"] in {"OBSERVED_TRIGGER", "PREDICTIVE_SIGNAL"}
        assert alert["primary_trigger"]
        if alert["trigger_type"] == "PREDICTIVE_SIGNAL":
            assert "ML risk signal" in alert["primary_trigger"] or "No deterministic" in alert["primary_trigger"]
        assert alert["risk_type"]
        assert project["risk_band"] == alert["severity"]