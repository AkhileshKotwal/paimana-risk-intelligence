"""
PAIMANA Temporal Feature Engineering & Leakage-Safe Feature Store.

Builds chronological project trajectories, higher-order velocity dynamics
(velocity, acceleration, rolling rates), censored schedule labels, and both
contemporaneous monitoring and forward early-warning targets.
"""
from pathlib import Path
import argparse
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

def parse_mmyyyy(value):
    """Safely converts MM/YYYY strings into pandas Timestamps."""
    if pd.isna(value) or str(value).strip() in {"", "-", "nan", "None", "00/0000"}:
        return pd.NaT
    try:
        parts = str(value).strip().split("/")
        if len(parts) == 2:
            m, y = parts
            return pd.Timestamp(year=int(y), month=int(m), day=1)
    except Exception:
        return pd.NaT
    return pd.NaT

def load_and_clean_raw(path):
    """Loads raw extracted PAIMANA records and normalizes numerical and date columns."""
    df = pd.read_csv(path)
    
    # Date parsing
    for col in ["date_of_approval", "start_date", "target_doc", "revised_doc"]:
        df[col + "_dt"] = df[col].map(parse_mmyyyy)
        
    # Numeric conversions
    numeric_cols = [
        "original_cost_cr", "revised_cost_cr", "cumulative_expenditure_cr",
        "physical_progress_pct"
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        
    # Month timestamp
    df["month_dt"] = pd.to_datetime(df["month"], format="%Y-%m", errors="coerce")
    
    # Ensure sorted order by project and chronological month
    return df.sort_values(["project_code", "month_dt"]).reset_index(drop=True)

def build_temporal_features(df):
    """Constructs comprehensive temporal features, velocity dynamics, and targets."""
    d = df.copy()

    # 1. Financial Overrun Targets (Contemporaneous)
    d["cost_overrun_pct"] = np.where(
        d["original_cost_cr"] > 0,
        (d["revised_cost_cr"] - d["original_cost_cr"]) / d["original_cost_cr"] * 100.0,
        0.0
    )
    d["is_cost_overrun"] = (d["cost_overrun_pct"] > 1.0).astype("Int64")

    # 2. Schedule Slippage & Censorship Handling
    d["schedule_slippage_months"] = np.where(
        d["revised_doc_dt"].notna() & d["target_doc_dt"].notna(),
        (d["revised_doc_dt"] - d["target_doc_dt"]).dt.days / 30.44,
        0.0
    )
    
    # Categorize schedule status
    d["is_censored"] = 0
    d["is_time_overrun"] = pd.Series(pd.NA, index=d.index, dtype="Int64")
    
    # Condition A: Target DoC is still in the future and no revision exists -> Currently on-time (0)
    future_target = d["target_doc_dt"].notna() & (d["target_doc_dt"] > d["month_dt"])
    d.loc[future_target & d["revised_doc_dt"].isna(), "is_time_overrun"] = 0
    
    # Condition B: Target and Revised DoC both available -> Directly calculate delay
    revised_mask = d["revised_doc_dt"].notna() & d["target_doc_dt"].notna()
    d.loc[revised_mask, "is_time_overrun"] = (d.loc[revised_mask, "schedule_slippage_months"] > 1.0).astype(int)
    
    # Condition C: Target has passed, but revised DoC is missing/blank -> Censored observation!
    past_due_unrevised = d["target_doc_dt"].notna() & (d["target_doc_dt"] <= d["month_dt"]) & d["revised_doc_dt"].isna()
    d.loc[past_due_unrevised, "is_censored"] = 1
    # is_time_overrun remains NA for censored rows so it is NOT falsely trained as 0

    # 3. Static & Gestation Baseline Features
    d["approval_year"] = d["date_of_approval_dt"].dt.year
    d["start_year"] = d["start_date_dt"].dt.year
    d["planned_duration_months"] = np.where(
        d["target_doc_dt"].notna() & d["start_date_dt"].notna(),
        (d["target_doc_dt"] - d["start_date_dt"]).dt.days / 30.44,
        np.nan
    )
    d["approval_to_start_months"] = np.where(
        d["start_date_dt"].notna() & d["date_of_approval_dt"].notna(),
        (d["start_date_dt"] - d["date_of_approval_dt"]).dt.days / 30.44,
        np.nan
    )
    d["project_age_months"] = np.where(
        d["month_dt"].notna() & d["start_date_dt"].notna(),
        (d["month_dt"] - d["start_date_dt"]).dt.days / 30.44,
        np.nan
    )
    
    # Time Exhaustion Ratio: age vs sanctioned duration
    d["time_exhaustion_ratio"] = d["project_age_months"] / d["planned_duration_months"].clip(lower=1.0)
    
    d["log_original_cost"] = np.log1p(d["original_cost_cr"].clip(lower=0))
    d["is_multi_state"] = d["state"].astype(str).str.contains("Multi-States", case=False, na=False).astype(int)

    # 4. Progress vs Expenditure Telemetry
    d["expenditure_pct_of_original"] = np.where(
        d["original_cost_cr"] > 0,
        d["cumulative_expenditure_cr"] / d["original_cost_cr"] * 100.0,
        0.0
    )
    d["progress_minus_expenditure_pct"] = d["physical_progress_pct"] - d["expenditure_pct_of_original"]
    d["progress_per_age_month"] = d["physical_progress_pct"] / d["project_age_months"].clip(lower=1.0)

    # 5. Higher-Order Velocity & Acceleration Dynamics
    d = d.sort_values(["project_code", "month_dt"]).reset_index(drop=True)
    p_group = d.groupby("project_code", sort=False)

    # Month-over-month shifts
    d["prev_physical_progress_pct"] = p_group["physical_progress_pct"].shift(1)
    d["prev_cumulative_expenditure_cr"] = p_group["cumulative_expenditure_cr"].shift(1)
    d["prev_cost_overrun_pct"] = p_group["cost_overrun_pct"].shift(1)
    d["prev_schedule_slippage_months"] = p_group["schedule_slippage_months"].shift(1)

    # Velocities
    d["progress_velocity_pct_month"] = d["physical_progress_pct"] - d["prev_physical_progress_pct"]
    d["expenditure_velocity_cr_month"] = d["cumulative_expenditure_cr"] - d["prev_cumulative_expenditure_cr"]
    d["cost_overrun_velocity_pct_month"] = d["cost_overrun_pct"] - d["prev_cost_overrun_pct"]
    d["schedule_slippage_velocity_months"] = d["schedule_slippage_months"] - d["prev_schedule_slippage_months"]

    # Progress Acceleration / Deceleration: change in velocity
    d["prev_progress_velocity"] = p_group["progress_velocity_pct_month"].shift(1)
    d["progress_acceleration"] = d["progress_velocity_pct_month"] - d["prev_progress_velocity"]

    # Rolling Progress Velocity (2-month expanding window)
    d["rolling_progress_velocity"] = p_group["progress_velocity_pct_month"].transform(lambda s: s.rolling(2, min_periods=1).mean())

    # Stalled Progress Flag: flat physical progress (<0.2%) while expenditure climbed (> ₹5 Cr)
    d["is_progress_stalled"] = np.where(
        (d["progress_velocity_pct_month"].abs() < 0.2) & (d["expenditure_velocity_cr_month"] > 5.0) & (d["physical_progress_pct"] < 99.0),
        1,
        0
    )

    # 6. Forward Early-Warning Targets (Horizon: Transition at Month T+1)
    d["next_month_cost_overrun_pct"] = p_group["cost_overrun_pct"].shift(-1)
    d["next_month_slippage_months"] = p_group["schedule_slippage_months"].shift(-1)
    d["next_month_is_cost_overrun"] = p_group["is_cost_overrun"].shift(-1)
    d["next_month_is_time_overrun"] = p_group["is_time_overrun"].shift(-1)

    # Target 1: Enters or deteriorates cost risk in T+1 (cost overrun increases by >2% or newly exceeds threshold)
    cost_escalated = (
        (d["next_month_cost_overrun_pct"] > (d["cost_overrun_pct"].fillna(0) + 2.0)) |
        ((d["is_cost_overrun"].fillna(0) == 0) & (d["next_month_is_cost_overrun"].fillna(0) == 1))
    ).fillna(False)

    time_escalated = (
        (d["next_month_slippage_months"] > (d["schedule_slippage_months"].fillna(0) + 2.0)) |
        ((d["is_time_overrun"].fillna(0) == 0) & (d["next_month_is_time_overrun"].fillna(0) == 1))
    ).fillna(False)

    d["forward_cost_risk_escalation"] = np.where(
        d["next_month_cost_overrun_pct"].notna(),
        cost_escalated.astype(int),
        np.nan
    )

    d["forward_time_risk_escalation"] = np.where(
        d["next_month_slippage_months"].notna(),
        time_escalated.astype(int),
        np.nan
    )

    # 7. Strict Leakage-Safe Historical Group Track Record
    # Calculate group performance only from snapshots strictly earlier than the current snapshot.
    d = d.sort_values("month_dt").reset_index(drop=True)
    
    for group, target, out in [
        ("agency", "cost_overrun_pct", "agency_hist_cost_overrun_pct"),
        ("sector", "cost_overrun_pct", "sector_hist_cost_overrun_pct"),
        ("ministry", "cost_overrun_pct", "ministry_hist_cost_overrun_pct"),
    ]:
        tmp = d[["month_dt", group, target]].copy()
        monthly = tmp.groupby(["month_dt", group], dropna=False)[target].mean().reset_index()
        monthly[out] = monthly.groupby(group, dropna=False)[target].transform(lambda s: s.shift(1).expanding().mean())
        d = d.merge(monthly[["month_dt", group, out]], on=["month_dt", group], how="left")

    for group, target, out in [
        ("agency", "is_time_overrun", "agency_hist_time_overrun_rate"),
        ("sector", "is_time_overrun", "sector_hist_time_overrun_rate"),
        ("ministry", "is_time_overrun", "ministry_hist_time_overrun_rate"),
    ]:
        tmp = d[["month_dt", group, target]].copy()
        tmp[target] = pd.to_numeric(tmp[target], errors="coerce")
        monthly = tmp.groupby(["month_dt", group], dropna=False)[target].mean().reset_index()
        monthly[out] = monthly.groupby(group, dropna=False)[target].transform(lambda s: s.shift(1).expanding().mean())
        d = d.merge(monthly[["month_dt", group, out]], on=["month_dt", group], how="left")

    return d

def main():
    parser = argparse.ArgumentParser(description="Build leakage-safe temporal features and forward-looking early warning targets.")
    parser.add_argument("--input", default=str(ROOT / "data" / "paimana_projects_apr_jul_2026.csv"))
    parser.add_argument("--output", default=str(ROOT / "data" / "snapshot_features.csv"))
    args = parser.parse_args()

    print(f"Loading raw PAIMANA records from {args.input}...")
    raw_df = load_and_clean_raw(args.input)
    print(f"Loaded {len(raw_df):,} records. Building temporal feature store...")
    
    features_df = build_temporal_features(raw_df)
    
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    features_df.to_csv(out_path, index=False)
    
    print(f"Wrote {len(features_df):,} feature-engineered rows to {args.output}")
    print("\nProject count per monthly snapshot:")
    print(features_df["month"].value_counts().sort_index().to_string())
    print("\nCensored schedule observation count:", int(features_df["is_censored"].sum()))
    print("Forward cost escalation target known rows:", int(features_df["forward_cost_risk_escalation"].notna().sum()))
    print("Forward schedule escalation target known rows:", int(features_df["forward_time_risk_escalation"].notna().sum()))

if __name__ == "__main__":
    main()
