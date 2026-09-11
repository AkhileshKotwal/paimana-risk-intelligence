"""Train a leakage-safe cost-overrun monitoring classifier."""
from pathlib import Path
import argparse
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score, average_precision_score, brier_score_loss
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[1]
FEATURES = [
    "log_original_cost", "planned_duration_months", "approval_to_start_months",
    "project_age_months", "physical_progress_pct", "cumulative_expenditure_cr",
    "expenditure_pct_of_original", "progress_minus_expenditure_pct",
    "progress_per_age_month", "progress_velocity_pct_month", "expenditure_velocity_cr_month",
    "approval_year", "start_year", "is_multi_state",
    "agency_hist_cost_overrun_pct", "sector_hist_cost_overrun_pct", "ministry_hist_cost_overrun_pct",
]
CATS = ["agency", "ministry", "sector", "state"]

def evaluate(model, X, y):
    p = model.predict_proba(X)[:, 1]
    pred = (p >= 0.5).astype(int)
    return {
        "accuracy": float(accuracy_score(y, pred)),
        "precision": float(precision_score(y, pred, zero_division=0)),
        "recall": float(recall_score(y, pred, zero_division=0)),
        "f1": float(f1_score(y, pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y, p)),
        "pr_auc": float(average_precision_score(y, p)),
        "brier": float(brier_score_loss(y, p)),
        "n": int(len(y)),
        "positive_rate": float(y.mean()),
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default=str(ROOT / "data" / "snapshot_features.csv"))
    ap.add_argument("--model-out", default=str(ROOT / "backend" / "models" / "cost_monitor.joblib"))
    ap.add_argument("--metrics-out", default=str(ROOT / "results" / "cost_monitor_metrics.json"))
    args = ap.parse_args()
    df = pd.read_csv(args.input)
    df["month_dt"] = pd.to_datetime(df["month"] + "-01")
    df = df.dropna(subset=["is_cost_overrun", "original_cost_cr"])
    # Hold out the latest usable snapshot. Train only on earlier snapshots.
    months = sorted(df.month_dt.dropna().unique())
    if len(months) < 2: raise SystemExit("Need at least two months for temporal validation")
    test_month = months[-1]
    train = df[df.month_dt < test_month].copy()
    test = df[df.month_dt == test_month].copy()
    # Historical features are naturally missing in the first month; impute.
    Xtr, ytr = train[FEATURES + CATS], train.is_cost_overrun.astype(int)
    Xte, yte = test[FEATURES + CATS], test.is_cost_overrun.astype(int)
    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), FEATURES),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("ohe", OneHotEncoder(handle_unknown="ignore"))]), CATS),
    ])
    model = Pipeline([("prep", pre), ("clf", XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05, subsample=0.85,
        colsample_bytree=0.85, objective="binary:logistic", eval_metric="logloss",
        random_state=42, n_jobs=4
    ))])
    model.fit(Xtr, ytr)
    metrics = {"train_months": [str(x)[:10] for x in months[:-1]], "test_month": str(test_month)[:10], "test": evaluate(model, Xte, yte)}
    Path(args.model_out).parent.mkdir(parents=True, exist_ok=True); Path(args.metrics_out).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, args.model_out)
    Path(args.metrics_out).write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__": main()
