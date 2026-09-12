"""
Tests to rigorously verify temporal leakage prevention.
Ensures historical track records and forward targets strictly respect chronological ordering.
"""
from pathlib import Path
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
FEATURES_PATH = ROOT / "data" / "snapshot_features.csv"


def test_first_month_has_no_prior_history():
    """In April 2026 (the first snapshot in our data), historical track records MUST be NaN."""
    df = pd.read_csv(FEATURES_PATH)
    apr_df = df[df["month"] == "2026-04"]
    
    # Agency, sector, and ministry historical performance in first snapshot cannot use current or future snapshots
    assert apr_df["agency_hist_cost_overrun_pct"].isna().all(), "April agency historical cost overrun should be NaN (no prior snapshot)"
    assert apr_df["sector_hist_cost_overrun_pct"].isna().all(), "April sector historical cost overrun should be NaN"
    assert apr_df["agency_hist_time_overrun_rate"].isna().all(), "April agency historical delay rate should be NaN"


def test_subsequent_months_have_valid_prior_history():
    """From May 2026 onward, historical group track records must be populated for observed groups."""
    df = pd.read_csv(FEATURES_PATH)
    may_df = df[df["month"] == "2026-05"]
    jul_df = df[df["month"] == "2026-07"]
    
    # May and July should have substantial non-null historical rates
    assert may_df["sector_hist_cost_overrun_pct"].notna().sum() > 0, "May should have populated sector history"
    assert jul_df["sector_hist_cost_overrun_pct"].notna().sum() > 0, "July should have populated sector history"


def test_forward_escalation_targets_not_available_for_latest_month():
    """The latest snapshot (July 2026) cannot know August 2026; forward targets must be NaN."""
    df = pd.read_csv(FEATURES_PATH)
    jul_df = df[df["month"] == "2026-07"]
    
    assert jul_df["forward_cost_risk_escalation"].isna().all(), "July forward cost escalation target must be NaN"
    assert jul_df["forward_time_risk_escalation"].isna().all(), "July forward time escalation target must be NaN"


def test_forward_escalation_targets_populated_for_earlier_months():
    """Earlier snapshots (April, May, June) must have forward targets for projects that persist to T+1."""
    df = pd.read_csv(FEATURES_PATH)
    apr_to_jun = df[df["month"].isin(["2026-04", "2026-05", "2026-06"])]
    
    assert apr_to_jun["forward_cost_risk_escalation"].notna().sum() > 5000
    assert apr_to_jun["forward_time_risk_escalation"].notna().sum() > 4000


def test_latest_snapshot_has_no_forward_target():
    df = pd.read_csv(FEATURES_PATH)
    latest = pd.to_datetime(df["month"] + "-01").max()
    latest_df = df[pd.to_datetime(df["month"] + "-01") == latest]
    assert latest_df["forward_cost_risk_escalation"].isna().all()
    assert latest_df["forward_time_risk_escalation"].isna().all()


def test_forward_targets_require_contiguous_months():
    df = pd.read_csv(FEATURES_PATH)
    month = pd.to_datetime(df["month"] + "-01")
    known = df["forward_time_risk_escalation"].notna()
    next_month = pd.to_datetime(df["next_month_dt"], errors="coerce")
    assert (next_month[known] == month[known] + pd.DateOffset(months=1)).all()
