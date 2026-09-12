"""Data quality checks for the normalized PAIMANA monthly panel."""
from __future__ import annotations

from pathlib import Path
import json
import pandas as pd

REQUIRED_COLUMNS = {
    "project_code", "month", "original_cost_cr", "revised_cost_cr",
    "cumulative_expenditure_cr", "physical_progress_pct", "date_of_approval",
    "start_date", "target_doc", "revised_doc", "agency", "ministry", "sector", "state",
}


def validate_panel(df: pd.DataFrame, fail_on_critical: bool = True) -> dict:
    issues: list[dict] = []

    missing_columns = sorted(REQUIRED_COLUMNS - set(df.columns))
    if missing_columns:
        issues.append({"severity": "critical", "check": "required_columns", "count": len(missing_columns), "details": missing_columns})

    if "project_code" in df:
        missing_ids = int(df["project_code"].isna().sum())
        if missing_ids:
            issues.append({"severity": "critical", "check": "missing_project_ids", "count": missing_ids})
    if {"project_code", "month"}.issubset(df.columns):
        duplicate_keys = int(df.duplicated(["project_code", "month"]).sum())
        if duplicate_keys:
            issues.append({"severity": "critical", "check": "duplicate_project_month", "count": duplicate_keys})

    for column in ("original_cost_cr", "revised_cost_cr", "cumulative_expenditure_cr", "physical_progress_pct"):
        if column not in df:
            continue
        values = pd.to_numeric(df[column], errors="coerce")
        invalid = int(values.isna().sum())
        if invalid:
            issues.append({"severity": "critical", "check": f"invalid_{column}", "count": invalid})
        if column != "physical_progress_pct":
            negative = int((values < 0).sum())
            if negative:
                issues.append({"severity": "critical", "check": f"negative_{column}", "count": negative})
        else:
            out_of_range = int(((values < 0) | (values > 100)).sum())
            if out_of_range:
                issues.append({"severity": "critical", "check": "progress_out_of_range", "count": out_of_range})

    if {"original_cost_cr", "revised_cost_cr"}.issubset(df.columns):
        original = pd.to_numeric(df["original_cost_cr"], errors="coerce")
        revised = pd.to_numeric(df["revised_cost_cr"], errors="coerce")
        revised_below = int((revised < original).sum())
        if revised_below:
            issues.append({"severity": "warning", "check": "revised_cost_below_original", "count": revised_below})

    if "month" in df:
        parsed_month = pd.to_datetime(df["month"], format="%Y-%m", errors="coerce")
        invalid_months = int(parsed_month.isna().sum())
        if invalid_months:
            issues.append({"severity": "critical", "check": "invalid_reporting_month", "count": invalid_months})

    for column in ("agency", "ministry", "sector", "state"):
        if column in df:
            missing_categories = int(df[column].isna().sum() + (df[column].astype(str).str.strip() == "").sum())
            if missing_categories:
                issues.append({"severity": "warning", "check": f"missing_{column}", "count": missing_categories})

    critical = [issue for issue in issues if issue["severity"] == "critical"]
    report = {
        "status": "fail" if critical else "pass",
        "row_count": int(len(df)),
        "project_count": int(df["project_code"].nunique()) if "project_code" in df else 0,
        "months": sorted(df["month"].dropna().astype(str).unique().tolist()) if "month" in df else [],
        "critical_issue_count": len(critical),
        "warning_count": len([issue for issue in issues if issue["severity"] == "warning"]),
        "issues": issues,
    }
    if fail_on_critical and critical:
        raise ValueError(json.dumps(report, indent=2))
    return report


def validate_csv(input_path: str | Path, report_path: str | Path | None = None) -> dict:
    df = pd.read_csv(input_path)
    report = validate_panel(df, fail_on_critical=True)
    if report_path:
        Path(report_path).write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report