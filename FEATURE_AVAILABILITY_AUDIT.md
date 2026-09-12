# Feature Availability Audit

Feature version: `features-v2-forward-t1`  
Prediction cutoff: reporting month T.  
Production target: whether risk escalates in the next contiguous monthly snapshot T+1.

| Feature family | Features | Information cutoff | Leakage decision |
|---|---|---|---|
| Static project facts | `approval_year`, `start_year`, `planned_duration_months`, `approval_to_start_months`, `is_multi_state`, categorical agency/ministry/sector/state | Known at or before T from the project record | Allowed |
| Scale | `log_original_cost` | Original sanctioned cost known at T; transform is `log1p` | Allowed |
| Current telemetry | `physical_progress_pct`, `cumulative_expenditure_cr`, `expenditure_pct_of_original`, `progress_minus_expenditure_pct` | Current report T | Allowed for monitoring/forecasting, but not a future outcome field |
| Current dynamics | `project_age_months`, `progress_per_age_month`, `progress_velocity_pct_month`, `expenditure_velocity_cr_month` | Current and prior snapshot telemetry only; first available velocity is missing | Allowed |
| Historical group features | `agency_hist_cost_overrun_pct`, `sector_hist_cost_overrun_pct`, `ministry_hist_cost_overrun_pct`, and corresponding time rates | Expanding group history uses snapshots strictly before T | Allowed; April is missing and imputed |
| Excluded outcome fields | `revised_cost_cr`, `revised_doc_dt`, `cost_overrun_pct`, `schedule_slippage_months`, current/next target fields | Outcomes or labels at/after T | Excluded from production feature lists |

Forward labels require a next row for the same project whose month is exactly T+1. Unknown/censored schedule outcomes remain missing and are excluded from evaluation; they are never filled with zero.

Limit: the source contains only four monthly snapshots, so only T+1 has usable evidence. No T+3/T+6 claim is made.