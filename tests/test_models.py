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
    
    cost_metrics = report["cost_overrun_model"]["holdout_july_2026_performance"]
    time_metrics = report["time_overrun_model"]["holdout_july_2026_performance"]
    
    # Verify strong statistical discrimination on temporal holdout
    assert cost_metrics["roc_auc"] >= 0.85, f"Cost model ROC-AUC {cost_metrics['roc_auc']} below 0.85 threshold"
    assert time_metrics["roc_auc"] >= 0.85, f"Time model ROC-AUC {time_metrics['roc_auc']} below 0.85 threshold"
    
    # Verify well-calibrated probabilities (Brier score < 0.15)
    assert cost_metrics["brier_score"] < 0.15, f"Cost Brier score {cost_metrics['brier_score']} too high"
    assert time_metrics["brier_score"] < 0.15, f"Time Brier score {time_metrics['brier_score']} too high"
