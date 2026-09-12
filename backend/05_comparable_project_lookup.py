"""
PAIMANA SIH 26103 - Historical Precedent / Comparable Project Lookup
Identifies the Top-K nearest historical precedents for each project using strictly past snapshot data.
Prevents lookahead leakage by searching only among projects with snapshot dates strictly earlier
than the target project's monitoring snapshot.
"""
from pathlib import Path
import argparse
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.neighbors import NearestNeighbors
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]

NUMERIC_FEATURES = [
    "log_original_cost", "planned_duration_months", "approval_year",
    "physical_progress_pct", "expenditure_pct_of_original"
]
CATEGORICAL_FEATURES = ["sector", "ministry"]


def build_match_rationale(target, comp, dist):
    reasons = []
    if target.get("sector") == comp.get("sector"):
        reasons.append(f"Matching sector ({target.get('sector')})")
    if target.get("ministry") == comp.get("ministry"):
        reasons.append(f"Same ministry ({target.get('ministry')})")
    
    cost_diff = abs((target.get("original_cost_cr") or 0) - (comp.get("original_cost_cr") or 0))
    if cost_diff < 100:
        reasons.append("Comparable capital outlay (within ₹100 Cr)")
    elif cost_diff < 500:
        reasons.append("Similar capital tier (within ₹500 Cr)")
        
    dur_diff = abs((target.get("planned_duration_months") or 0) - (comp.get("planned_duration_months") or 0))
    if dur_diff <= 12:
        reasons.append(f"Similar planned timeframe (±{int(dur_diff)} mos)")
        
    return "; ".join(reasons) if reasons else "Proximity in multi-dimensional scale and progress embedding"


def main():
    parser = argparse.ArgumentParser(description="Find Top-K historical comparable precedents.")
    parser.add_argument("--input", default=str(ROOT / "data" / "snapshot_features.csv"))
    parser.add_argument("--output", default=str(ROOT / "results" / "historical_comparables.csv"))
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    df = pd.read_csv(args.input)
    df["month_dt"] = pd.to_datetime(df["month"] + "-01")
    months = sorted(df["month_dt"].dropna().unique())

    all_comparable_rows = []

    for month in months:
        current_df = df[df["month_dt"] == month].copy().reset_index(drop=True)
        # Historical pool strictly earlier than current snapshot
        hist_df = df[df["month_dt"] < month].copy().reset_index(drop=True)
        
        if hist_df.empty:
            continue

        preprocessor = ColumnTransformer([
            ("num", Pipeline([
                ("imp", SimpleImputer(strategy="median")),
                ("scale", StandardScaler())
            ]), NUMERIC_FEATURES),
            ("cat", Pipeline([
                ("imp", SimpleImputer(strategy="most_frequent")),
                ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
            ]), CATEGORICAL_FEATURES)
        ])

        H_mat = preprocessor.fit_transform(hist_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES])
        Q_mat = preprocessor.transform(current_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES])

        # Query more candidates to allow domain re-ranking (prioritize same sector/ministry)
        query_k = min(len(hist_df), max(args.top_k * 4, 20))
        nn = NearestNeighbors(n_neighbors=query_k, metric="euclidean", n_jobs=-1)
        nn.fit(H_mat)
        distances, indices = nn.kneighbors(Q_mat)

        for i, (_, row) in enumerate(current_df.iterrows()):
            candidates = []
            for rank_idx, cand_idx in enumerate(indices[i]):
                c = hist_df.iloc[cand_idx]
                if str(c["project_code"]) == str(row["project_code"]):
                    continue
                dist = float(distances[i, rank_idx])
                
                # Boost score if sector or ministry matches
                same_sec = bool(c.get("sector") == row.get("sector"))
                same_min = bool(c.get("ministry") == row.get("ministry"))
                adjusted_dist = dist * (0.6 if (same_sec and same_min) else (0.8 if same_sec else 1.0))
                
                similarity_score = round(1.0 / (1.0 + adjusted_dist), 4)
                
                candidates.append({
                    "target_month": row["month"],
                    "project_code": row["project_code"],
                    "project_name": row.get("project_name", ""),
                    "rank": 0,
                    "comparable_project_code": c["project_code"],
                    "comparable_project_name": c.get("project_name", ""),
                    "comparable_month": c["month"],
                    "similarity_score": similarity_score,
                    "distance": round(dist, 3),
                    "same_sector": same_sec,
                    "same_ministry": same_min,
                    "comparable_cost_overrun_pct": round(float(c.get("cost_overrun_pct") or 0.0), 1),
                    "comparable_schedule_slippage_months": round(float(c.get("schedule_slippage_months") or 0.0), 1),
                    "comparable_progress_pct": round(float(c.get("physical_progress_pct") or 0.0), 1),
                    "match_rationale": build_match_rationale(row, c, dist)
                })

            # Sort by highest similarity
            candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
            for rank, item in enumerate(candidates[:args.top_k], start=1):
                item["rank"] = rank
                all_comparable_rows.append(item)

    out_df = pd.DataFrame(all_comparable_rows)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(out_path, index=False)
    print(f"Successfully generated {len(out_df):,} historical precedent links (Top-{args.top_k} per project) -> {out_path}")


if __name__ == "__main__":
    main()
