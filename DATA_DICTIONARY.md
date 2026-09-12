# Data Dictionary

## Source panel

`data/paimana_projects_apr_jul_2026.csv` is the normalized monthly panel from MoSPI Table 6 extracts. `project_code` plus `month` is the row key. `month` is the reporting month in `YYYY-MM` form.

Observed fields include project name/code, agency, ministry, sector, state, approval/start/target/revised completion month, original/revised cost in crore rupees, cumulative expenditure in crore rupees, and physical progress percentage.

## Derived fields

- `cost_overrun_pct`: `(revised_cost_cr - original_cost_cr) / original_cost_cr * 100`.
- `schedule_slippage_months`: revised completion minus target completion in 30.44-day months; missing when no revised date is reported.
- `project_age_months`: reporting month minus start date.
- `progress_velocity_pct_month` and `expenditure_velocity_cr_month`: current minus immediately prior project snapshot.
- `*_hist_*`: expanding group means based only on months before the current row.
- `forward_cost_risk_escalation`: known T+1 label when cost overrun rises by more than two percentage points or crosses the overrun threshold.
- `forward_time_risk_escalation`: known T+1 label when schedule slippage rises by more than two months or crosses the time-overrun threshold; unknown/censored rows remain missing.

## Risk fields

Cost/time/forward scores are uncalibrated XGBoost outputs expressed as percentages for display. `priority_score`, `risk_band`, and scale normalization are defined only in `backend/risk_scoring.py`. Risk bands are prototype decision thresholds, not official classifications.