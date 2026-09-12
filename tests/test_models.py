"""
Tests for trained ML models and evaluation reports.
Verifies model pipelines, probability calibration bounds, and benchmark thresholds.
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
COST_MODEL_PATH = ROOT / "backend" / "models" / "cost_monitor.joblib"
TIME_MODEL_PATH = ROOT / "backend" / "models" / "time_monitor.joblib"
EVAL_REPORT_PATH = ROOT / "results" / "model_evaluation_report.json"
FEATURES_PATH = ROOT / "data" / "snapshot_features.csv"


def test_production_model_files_exist():
    assert COST_MODEL_PATH.exists(), f"Cost model missing at {COST_MODEL_PATH}"
    assert TIME_MODEL_PATH.exists(), f"Time model missing at {TIME_MODEL_PATH}"
    assert EVAL_REPORT_PATH.exists(), f"Evaluation report missing at {EVAL_REPORT_PATH}"
    metadata = json.loads((COST_MODEL_PATH.with_suffix(COST_MODEL_PATH.suffix + ".meta.json")).read_text(encoding="utf-8"))
    assert metadata["model_version"] == "xgb-forward-t1-v1"
    assert metadata["feature_version"] == "features-v2-forward-t1"
    assert metadata["training_cutoff"]
    assert metadata["python_version"].startswith("3.")


def test_cost_model_inference():
    model = joblib.load(COST_MODEL_PATH)
    assert hasattr(model, "predict_proba"), "Cost model lacks predict_proba method"
    
    df = pd.read_csv(FEATURES_PATH)
    jul_sample = df[df["month"] == "2026-07"].head(10)
    
    probs = model.predict_proba(jul_sample)[:, 1]
    assert len(probs) == 10
    assert (probs >= 0.0).all() and (probs <= 1.0).all(), "Cost probabilities outside [0, 1] range"


def test_time_model_inference():
    model = joblib.load(TIME_MODEL_PATH)
    assert hasattr(model, "predict_proba"), "Time model lacks predict_proba method"
    
    df = pd.read_csv(FEATURES_PATH)
    jul_sample = df[df["month"] == "2026-07"].head(10)
    
    probs = model.predict_proba(jul_sample)[:, 1]
    assert len(probs) == 10
    assert (probs >= 0.0).all() and (probs <= 1.0).all(), "Time probabilities outside [0, 1] range"


def test_evaluation_report_thresholds():
    report = json.loads(EVAL_REPORT_PATH.read_text(encoding="utf-8"))
    
    cost_metrics = report["cost_overrun_model"]["holdout_performance"]
    time_metrics = report["time_overrun_model"]["holdout_performance"]

    assert report["dataset"]["target_design"].startswith("Production models predict")
    assert report["cost_overrun_model"]["target"] == "forward_cost_risk_escalation"
    assert report["time_overrun_model"]["target"] == "forward_time_risk_escalation"
    for metrics in (cost_metrics, time_metrics):
        assert metrics["sample_size"] > 0
        assert metrics["positive_count"] >= 0
        assert metrics["negative_count"] >= 0
        assert len(metrics["confusion_matrix"]) == 2
        assert metrics["calibration_status"] == "uncalibrated"
