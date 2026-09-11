"""
PAIMANA SIH 26103 - Generate Comprehensive Risk Profiles & Early Warnings (July 2026)
Uses trained, leakage-safe production models to score all 1,775 ongoing projects.
Computes:
  - Calibrated Cost Overrun Probability (%)
  - Calibrated Time Overrun Probability (%)
  - Forward Delay Escalation Probability (%)
  - Composite Priority Score (0-100)
  - 4-Tier Risk Classification (CRITICAL, HIGH, MEDIUM, LOW)
  - Emerging Risk Flags (e.g., Stagnant Progress + High Burn, Looming Deadline)
"""
from pathlib import Path
import argparse
import json
import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

COST_FEATURES = [
    "log_original_cost", "planned_duration_months", "approval_to_start_months",
    "project_age_months", "physical_progress_pct", "cumulative_expenditure_cr",
    "expenditure_pct_of_original", "progress_minus_expenditure_pct",
    "progress_per_age_month", "progress_velocity_pct_month", "expenditure_velocity_cr_month",
    "approval_year", "start_year", "is_multi_state",
    "agency_hist_cost_overrun_pct", "sector_hist_cost_overrun_pct", "ministry_hist_cost_overrun_pct",
]

TIME_FEATURES = [
    "log_original_cost", "planned_duration_months", "approval_to_start_months",
    "project_age_months", "physical_progress_pct", "cumulative_expenditure_cr",
    "expenditure_pct_of_original", "progress_minus_expenditure_pct",
    "progress_per_age_month", "progress_velocity_pct_month", "expenditure_velocity_cr_month",
    "approval_year", "start_year", "is_multi_state",
    "agency_hist_time_overrun_rate", "sector_hist_time_overrun_rate", "ministry_hist_time_overrun_rate",
]

CATEGORICAL_FEATURES = ["agency", "ministry", "sector", "state"]


def calculate_priority_score(row, w_cost=0.35, w_time=0.30, w_esc=0.15, w_scale=0.20):
    cost_r = row.get("cost_risk_pct", 0.0)
    time_r = row.get("time_risk_pct", 0.0)
    esc_r = row.get("forward_escalation_risk_pct", 0.0)
    
    # Capital scale factor (log normalized up to ₹50,000 Cr)
    cost_cr = max(row.get("original_cost_cr") or 0.0, 1.0)
    scale_factor = min(100.0, (np.log10(cost_cr) / np.log10(50000.0)) * 100.0)
    
    score = (w_cost * cost_r) + (w_time * time_r) + (w_esc * esc_r) + (w_scale * scale_factor)
    return round(float(np.clip(score, 0.0, 100.0)), 1)


def determine_risk_band(priority_score, cost_risk, time_risk):
    if priority_score >= 70.0 or (cost_risk >= 75.0 and time_risk >= 75.0):
        return "CRITICAL"
    elif priority_score >= 50.0 or cost_risk >= 65.0 or time_risk >= 65.0:
        return "HIGH"
    elif priority_score >= 30.0:
        return "MEDIUM"
    else:
        return "LOW"


def evaluate_emerging_flags(row):
    flags = []
    
    # 1. Stagnant progress but high burn
    prog_vel = row.get("progress_velocity_pct_month")
    exp_vel = row.get("expenditure_velocity_cr_month")
    phys_prog = row.get("physical_progress_pct") or 0.0
    
    if pd.notna(prog_vel) and pd.notna(exp_vel):
        if abs(prog_vel) < 0.2 and exp_vel > 5.0 and phys_prog < 98.0:
            flags.append("STAGNANT_PROGRESS_HIGH_EXPENDITURE")
            
    # 2. Acute Schedule Slippage (> 24 months)
    delay_months = row.get("schedule_slippage_months") or 0.0
    if delay_months >= 24.0:
        flags.append("ACUTE_SCHEDULE_SLIPPAGE")
        
    # 3. Severe Cost Overrun (> 50%)
    cost_overrun_pct = row.get("cost_overrun_pct") or 0.0
    if cost_overrun_pct >= 50.0:
        flags.append("SEVERE_COST_OVERRUN")
        
    # 4. Expenditure exceeding original budget before completion
    exp_pct = row.get("expenditure_pct_of_original") or 0.0
    if exp_pct > 100.0 and phys_prog < 95.0:
        flags.append("EXPENDITURE_EXCEEDS_ORIGINAL_BUDGET")
        
    # 5. Censored project past target completion
    if row.get("is_censored") == 1:
        flags.append("CENSORED_SCHEDULE_UNREVISED")
        
    return flags


def main():
    parser = argparse.ArgumentParser(description="Package comprehensive July 2026 risk profiles.")
    parser.add_argument("--input", default=str(ROOT / "data" / "snapshot_features.csv"))
    parser.add_argument("--cost-model", default=str(ROOT / "backend" / "models" / "cost_monitor.joblib"))
    parser.add_argument("--time-model", default=str(ROOT / "backend" / "models" / "time_monitor.joblib"))
    parser.add_argument("--esc-model", default=str(ROOT / "backend" / "models" / "forward_time_escalation.joblib"))
    parser.add_argument("--output-json", default=str(ROOT / "results" / "risk_profiles.json"))
    parser.add_argument("--top10-csv", default=str(ROOT / "results" / "top10_risk_projects.csv"))
    parser.add_argument("--emerging-json", default=str(ROOT / "results" / "emerging_risks_july_2026.json"))
    args = parser.parse_args()

    print(f"Loading snapshot features from {args.input}...")
    df = pd.read_csv(args.input)
    latest_month = df["month"].max()
    print(f"Targeting active monitoring snapshot: {latest_month}")
    
    current_df = df[df["month"] == latest_month].copy().reset_index(drop=True)
    
    # Load ML models
    cost_clf = joblib.load(args.cost_model)
    time_clf = joblib.load(args.time_model)
    esc_clf = joblib.load(args.esc_model) if Path(args.esc_model).exists() else None

    # Predict Risk Probabilities
    current_df["cost_risk_pct"] = np.round(cost_clf.predict_proba(current_df[COST_FEATURES + CATEGORICAL_FEATURES])[:, 1] * 100.0, 1)
    current_df["time_risk_pct"] = np.round(time_clf.predict_proba(current_df[TIME_FEATURES + CATEGORICAL_FEATURES])[:, 1] * 100.0, 1)
    current_df["overall_risk_pct"] = np.round((current_df["cost_risk_pct"] + current_df["time_risk_pct"]) / 2.0, 1)
    
    if esc_clf is not None:
        current_df["forward_escalation_risk_pct"] = np.round(esc_clf.predict_proba(current_df[TIME_FEATURES + CATEGORICAL_FEATURES])[:, 1] * 100.0, 1)
    else:
        current_df["forward_escalation_risk_pct"] = 0.0

    # Calculate Priority and Risk Bands
    current_df["priority_score"] = current_df.apply(calculate_priority_score, axis=1)
    current_df["risk_band"] = current_df.apply(
        lambda r: determine_risk_band(r["priority_score"], r["cost_risk_pct"], r["time_risk_pct"]), axis=1
    )
    current_df["emerging_risk_flags"] = current_df.apply(evaluate_emerging_flags, axis=1)
    current_df["has_emerging_risk"] = current_df["emerging_risk_flags"].apply(lambda f: len(f) > 0)

    # Sort by Priority Score descending
    current_df = current_df.sort_values("priority_score", ascending=False).reset_index(drop=True)

    export_cols = [
        "project_code", "project_name", "agency", "ministry", "sector", "state",
        "original_cost_cr", "revised_cost_cr", "cumulative_expenditure_cr",
        "cost_overrun_pct", "cost_risk_pct",
        "schedule_slippage_months", "time_risk_pct",
        "overall_risk_pct", "forward_escalation_risk_pct", "priority_score", "risk_band",
        "physical_progress_pct", "progress_velocity_pct_month", "expenditure_velocity_cr_month",
        "has_emerging_risk", "emerging_risk_flags"
    ]
    
    # Save results
    out_dir = Path(args.output_json).parent
    out_dir.mkdir(parents=True, exist_ok=True)
    
    current_df[export_cols].to_json(args.output_json, orient="records", indent=2)
    current_df[export_cols].head(10).to_csv(args.top10_csv, index=False)
    
    emerging_df = current_df[current_df["has_emerging_risk"]][export_cols]
    emerging_df.to_json(args.emerging_json, orient="records", indent=2)

    print(f"Generated {len(current_df):,} risk profiles for {latest_month}")
    print(f"Risk Band Distribution:\n{current_df['risk_band'].value_counts().to_string()}")
    print(f"Projects with Emerging Risk Flags: {len(emerging_df):,}")
    print(f"Top 10 High-Priority Projects exported to: {args.top10_csv}")


if __name__ == "__main__":
    main()
