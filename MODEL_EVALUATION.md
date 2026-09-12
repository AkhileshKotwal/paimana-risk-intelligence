# Model Evaluation

The authoritative numeric results are generated in `results/model_evaluation_report.json` and summarized in `MODEL_CARD.md`. Evaluation uses chronological walk-forward splits and a final known T+1 holdout. Metrics include ROC-AUC, PR-AUC, precision, recall, F1, Brier score, confusion matrix, calibration bins, ECE, sample size, and class counts.

The measured forward results are weak: cost ROC-AUC 0.5766 / PR-AUC 0.0516 and time ROC-AUC 0.5286 / PR-AUC 0.1088. The old same-month metrics were not carried forward as production evidence because they answer a different descriptive question.