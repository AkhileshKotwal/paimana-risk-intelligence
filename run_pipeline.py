"""
PAIMANA SIH 26103 - End-to-End Pipeline Orchestrator & CLI
Controls data extraction, leakage-safe temporal feature engineering,
multi-model walk-forward training, historical precedent lookup,
risk profile packaging, frontend data compilation, and automated tests.

Usage:
  python run_pipeline.py --all          # Run complete pipeline end-to-end
  python run_pipeline.py --features     # Rebuild temporal features (7,590 rows)
  python run_pipeline.py --train        # Train & evaluate models across walk-forward folds
  python run_pipeline.py --comparables  # Generate Top-5 nearest historical precedents
  python run_pipeline.py --package      # Package July 2026 risk profiles
  python run_pipeline.py --build-data   # Compile frontend dataset
  python run_pipeline.py --test         # Run 20-point automated pytest suite
  python run_pipeline.py --serve        # Start zero-dependency web server (port 3000)
  python run_pipeline.py --api          # Start FastAPI REST server (port 8000)
"""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent


def run_step(description: str, cmd_args: list):
    print(f"\n{'='*70}")
    print(f" >>> [PAIMANA PIPELINE] {description}")
    print(f"{'='*70}")
    res = subprocess.run(cmd_args, cwd=str(ROOT))
    if res.returncode != 0:
        print(f"\n[ERROR] Step failed with return code {res.returncode}: {description}")
        sys.exit(res.returncode)


def main():
    parser = argparse.ArgumentParser(description="PAIMANA SIH 26103 Pipeline Orchestrator")
    parser.add_argument("--all", action="store_true", help="Run full pipeline from features to test suite")
    parser.add_argument("--features", action="store_true", help="Rebuild temporal features")
    parser.add_argument("--train", action="store_true", help="Train and benchmark ML models")
    parser.add_argument("--comparables", action="store_true", help="Generate Top-5 precedents")
    parser.add_argument("--package", action="store_true", help="Package July 2026 risk profiles")
    parser.add_argument("--build-data", action="store_true", help="Compile frontend data JSON")
    parser.add_argument("--test", action="store_true", help="Run automated test suite")
    parser.add_argument("--serve", action="store_true", help="Launch Python web server")
    parser.add_argument("--api", action="store_true", help="Launch FastAPI REST backend")
    args = parser.parse_args()

    # If no flags passed, default to running all
    run_all = args.all or not (
        args.features or args.train or args.comparables or args.package
        or args.build_data or args.test or args.serve or args.api
    )

    py = sys.executable

    if run_all or args.features:
        run_step(
            "1. Leakage-Safe Feature Engineering",
            [py, "backend/02_feature_engineering.py"]
        )

    if run_all or args.train:
        run_step(
            "2. Multi-Model Walk-Forward Temporal Training & Calibration",
            [py, "backend/train_models.py"]
        )

    if run_all or args.comparables:
        run_step(
            "3. Top-5 Historical Precedent Matching",
            [py, "backend/05_comparable_project_lookup.py"]
        )

    if run_all or args.package:
        run_step(
            "4. Packaging July 2026 Risk Profiles & Emerging Flags",
            [py, "backend/06_package_risk_profiles.py"]
        )

    if run_all or args.build_data:
        run_step(
            "5. Compiling Frontend Dataset & Pre-Indexed Structures",
            [py, "scripts/build_frontend_data.py"]
        )

    if run_all or args.test:
        run_step(
            "6. Executing 20-Point Automated Pytest Suite",
            [py, "-m", "pytest", "tests/", "-v"]
        )

    if args.serve:
        print("\nStarting PAIMANA Web Server on http://localhost:3000 ...")
        subprocess.run([py, "serve.py"], cwd=str(ROOT))

    if args.api:
        print("\nStarting FastAPI REST Server on http://localhost:8000 ...")
        subprocess.run([py, "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], cwd=str(ROOT))

    if run_all:
        print(f"\n{'='*70}")
        print(" [PAIMANA SUCCESS] Full Pipeline Verified & Ready for Evaluation!")
        print("   - Web Platform: python serve.py (http://localhost:3000)")
        print("   - REST API:     python -m uvicorn backend.app:app --port 8000")
        print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
