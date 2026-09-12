# PAIMANA Post-Fix Audit

## Executive summary

The repair replaced the production same-month overrun claim with explicit contiguous T+1 escalation targets, preserved unknown/censored labels, centralized risk scoring, removed fabricated historical risk decay, excluded comparable self-matches, corrected API feature transforms, added OOD warnings and artifact metadata, removed the external AI request, and rebuilt the frontend data. The resulting forward models are scientifically weaker than the old descriptive classifiers; that limitation is reported rather than hidden.

## P0 issues fixed

1. Production cost/time paths now train on forward T+1 escalation targets.
2. T+1 labels require calendar continuity and known future outcomes.
3. “Calibrated” claims were removed; calibration status is explicit and uncalibrated.
4. No local SHAP values are claimed or hard-coded as SHAP.
5. `backend/risk_scoring.py` is the canonical priority/band implementation.
6. API log transform now matches training `log1p`; group history is data-derived before the reporting cutoff.
7. Legacy external Anthropic transmission was removed.

## P1/P2 fixes

- Added data quality validation and `data/data_quality_report.json`.
- Added model sidecar metadata and versioned risk/frontend artifacts.
- Fixed alert field parity and comparable similarity semantics.
- Removed mathematically fabricated historical risk scores.
- Added OOD warnings and explicit CORS origins.
- Added tests for target continuity, API metadata/OOD, risk parity, uniqueness, and self-match exclusion.
- Pinned Python dependencies and documented that raw PDFs are unavailable.

## ML methodology

Features use only current/prior telemetry and pre-T group history. Production targets are T+1 cost/time risk escalation. Training is chronological and uses the latest target-bearing month as holdout; July has no future label. Four snapshots support only this short horizon. Scores are uncalibrated XGBoost outputs.

## Explainability

SHAP is not implemented in this environment and no artifact or UI now claims local SHAP. Available drivers are observable telemetry rules or clearly labeled legacy global feature importance. Adding SHAP later requires installing it, using the exact production model, and versioning each local attribution.

## Risk engine

Priority weights are cost 0.35, time 0.30, forward escalation 0.15, and log1p-normalized cost scale 0.20. Bands are prototype thresholds: LOW below 30, MEDIUM 30-49.9, HIGH 50-69.9 or a dimension at 65+, CRITICAL 70+ or both dimensions at 75+. These are not official government classifications.

## Data and reproducibility

The panel contains 7,590 records and 1,775 July projects across four snapshots. Raw PDFs are not included, so reproduction begins at the normalized CSV. Commands are in `REPRODUCIBILITY.md`; generated artifacts include model/feature/dataset/cutoff metadata.

## Measured metrics before vs after

The former 0.95/0.99 AUC figures measured same-month descriptive labels and are not comparable to the repaired forward task. The repaired holdout results are: cost ROC-AUC 0.5766, PR-AUC 0.0516, F1 0.0000, Brier 0.0410; time ROC-AUC 0.5286, PR-AUC 0.1088, F1 0.0000, Brier 0.1051. This is a real performance downgrade and the system should not be sold as a strong predictor.

## Remaining limitations

Sparse positive escalation events, only four snapshots, project overlap across months, no true calibration dataset, no SHAP dependency, no model drift monitoring, no external validation, incomplete PDF reproducibility, and no authentication. Policy recommendations remain prototype suggestions pending authoritative source mapping.

## Master Prompt Delta Fixes

- Removed the obsolete Solan–Kaithlighat/99.5% case study and 167-project demo claim; the walkthrough now selects from the current priority ranking.
- Replaced probability/database wording with model-risk-score, threshold-rate, and local-data-store terminology.
- Added alert `trigger_type` values so predictive signals cannot be presented as observed deterministic anomalies.
- Replaced the unsupported SHAP portfolio chart with a data-derived observed telemetry driver summary.
- Added exact Python, NumPy, pandas, scikit-learn, and XGBoost versions to model metadata and verified them in tests.
- Updated the README pitch, FAQ, demo, architecture, and score explanations to match the generated artifacts and the 28-test suite.

## SIH readiness

Technical correctness: 7/10  
ML validity: 4/10  
Data engineering: 7/10  
Explainability: 4/10  
Frontend: 7/10  
Reproducibility: 6/10  
SIH judge defensibility: 5/10