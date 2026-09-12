# PAIMANA Model Card

## Scope

The production `cost_monitor.joblib` and `time_monitor.joblib` files are XGBoost classifiers trained on `features-v2-forward-t1`. They predict T+1 cost-risk escalation and T+1 schedule-risk escalation, respectively. They are not current-state overrun labels and are not calibrated probabilities.

## Data and split

The panel has 7,590 rows across April-July 2026. Training uses earlier target-bearing months and the final known T+1 month is the chronological holdout. July has no observed T+1 label and is scored only for dashboard demonstration. Projects can overlap across months, so this is a monitoring/generalization-over-time evaluation, not an unseen-project benchmark.

## Measured holdout results

| Target | N | Positives | ROC-AUC | PR-AUC | Precision | Recall | F1 | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Forward cost escalation | 1,732 | 71 | 0.5766 | 0.0516 | 0.0000 | 0.0000 | 0.0000 | 0.0410 | 0.0402 |
| Forward time escalation | 1,404 | 142 | 0.5286 | 0.1088 | 0.0000 | 0.0000 | 0.0000 | 0.1051 | 0.0820 |

These results are weak. The system must not present them as strong predictive performance. The threshold-0.5 confusion matrices contain no true positives on the holdout; PR-AUC and positive counts are more informative than accuracy under this imbalance.

## Calibration and explainability

Calibration status is explicitly `uncalibrated`; Brier/ECE are reported descriptively and do not establish calibration. SHAP is not installed or generated. The UI labels available explanations as telemetry rules or legacy global feature importance and does not claim local SHAP values.

## Limitations

Four snapshots, sparse positives, censoring, project overlap, possible source extraction drift, and no external-project validation. This is a prototype decision-support signal, not an official government classification or an autonomous decision system.