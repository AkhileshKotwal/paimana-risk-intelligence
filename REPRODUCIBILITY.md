# Reproducibility

## Environment

Use Python 3.11.9 and `requirements-lock.txt`. Raw PDFs are not included; the reproducible pipeline starts from the normalized CSV panel. PDF extraction therefore cannot be reproduced from this repository alone.

## Pipeline

```powershell
python backend/02_feature_engineering.py
python backend/train_models.py
python backend/05_comparable_project_lookup.py
python backend/06_package_risk_profiles.py
python scripts/build_frontend_data.py
pytest -q
Set-Location frontend
npm ci
npm run build
```

The sequence is: normalized panel -> validation/features -> contiguous T+1 targets -> chronological training/evaluation -> model metadata -> comparable lookup -> canonical risk packaging -> frontend JSON -> FastAPI/static frontend. Models use fixed random state 42. Metadata records model, feature, dataset, cutoff, and generation values; a future release should additionally record a source-data hash in the release manifest.

## Runtime boundary

The active React frontend uses precomputed local JSON. FastAPI provides project APIs and scenario inference separately. Authentication, authorization, rate limiting, and production TLS are not implemented in this prototype.