"""
Unit tests for PAIMANA data pipeline and feature engineering.
Verifies snapshot counts, schema integrity, and domain constraints.
"""
from pathlib import Path
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "data" / "paimana_projects_apr_jul_2026.csv"
FEATURES_PATH = ROOT / "data" / "snapshot_features.csv"


def test_raw_dataset_exists_and_has_expected_rows():
    assert RAW_PATH.exists(), f"Raw dataset not found at {RAW_PATH}"
    df = pd.read_csv(RAW_PATH)
    assert len(df) == 7590, f"Expected 7,590 raw records, found {len(df):,}"


def test_monthly_snapshot_counts():
    df = pd.read_csv(RAW_PATH)
    counts = df["month"].value_counts().to_dict()
    assert counts.get("2026-04") == 1981, "April 2026 count mismatch"
    assert counts.get("2026-05") == 1987, "May 2026 count mismatch"
    assert counts.get("2026-06") == 1847, "June 2026 count mismatch"
    assert counts.get("2026-07") == 1775, "July 2026 count mismatch"


def test_features_file_schema_and_constraints():
    assert FEATURES_PATH.exists(), f"Snapshot features not found at {FEATURES_PATH}"
    df = pd.read_csv(FEATURES_PATH)
    assert len(df) == 7590
    
    # Check essential columns
    required_cols = [
        "project_code", "project_name", "month", "original_cost_cr",
        "cumulative_expenditure_cr", "physical_progress_pct",
        "is_cost_overrun", "is_time_overrun", "is_censored"
    ]
    for col in required_cols:
        assert col in df.columns, f"Missing required column: {col}"

    # Verify physical progress bounds (0% to 100%)
    valid_progress = df["physical_progress_pct"].dropna()
    assert (valid_progress >= 0.0).all(), "Found negative physical progress"
    assert (valid_progress <= 100.0).all(), "Found physical progress > 100%"

    # Verify non-negative costs
    valid_cost = df["original_cost_cr"].dropna()
    assert (valid_cost >= 0.0).all(), "Found negative original cost"


def test_july_2026_active_inventory():
    df = pd.read_csv(FEATURES_PATH)
    jul_df = df[df["month"] == "2026-07"]
    assert len(jul_df) == 1775, f"Expected exactly 1,775 July projects, found {len(jul_df)}"
    # All active projects must have a project_code
    assert jul_df["project_code"].notna().all(), "Found missing project codes in July snapshot"
