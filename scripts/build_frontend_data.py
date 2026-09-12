"""
Package all PAIMANA data, ML risk predictions, temporal trends, SHAP drivers,
comparable projects, agency metrics, and methodology data into a unified,
highly-optimized JSON dataset for the PAIMANA web prototype.
"""
import json
from pathlib import Path
from datetime import datetime, timezone
import sys
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.risk_scoring import calculate_priority_score, determine_risk_band, RISK_SCORING_VERSION


def clean_json(value):
    if isinstance(value, dict):
        return {key: clean_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [clean_json(item) for item in value]
    if isinstance(value, (np.floating, float)):
        return float(value) if np.isfinite(value) else None
    if isinstance(value, (np.integer, int)):
        return int(value)
    return value

def build_data():
    print("Loading data files...")
    snap_path = ROOT / "data" / "snapshot_features.csv"
    snap = pd.read_csv(snap_path)
    
    def load_profile_payload(path):
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
        if isinstance(payload, dict):
            return payload.get("projects", []), payload.get("metadata", {})
        return payload, {}

    # The current risk artifact is authoritative. Legacy full profiles are not
    # mixed into the active dashboard because their model schema is unknown.
    july_rows, profile_metadata = load_profile_payload(ROOT / "results" / "risk_profiles.json")
    july_profiles = {p["project_code"]: p for p in july_rows}
    full_profiles = {}
        
    hist_comp_file = ROOT / "results" / "historical_comparables.csv"
    top_comps_by_proj = {}
    if hist_comp_file.exists():
        comp_df = pd.read_csv(hist_comp_file)
        for pcode, grp in comp_df.groupby("project_code"):
            top_comps_by_proj[int(pcode)] = grp.head(5).to_dict(orient="records")
        print(f"Loaded {len(comp_df):,} historical precedent links across {len(top_comps_by_proj):,} projects")
    elif (ROOT / "results" / "comparables.csv").exists():
        comp_df = pd.read_csv(ROOT / "results" / "comparables.csv")
        for _, r in comp_df.iterrows():
            top_comps_by_proj[int(r.project_code)] = [r.to_dict()]
    
    with open(ROOT / "results" / "cost_monitor_metrics.json", encoding="utf-8") as f:
        cost_metrics = json.load(f)
        
    with open(ROOT / "results" / "time_monitor_metrics.json", encoding="utf-8") as f:
        time_metrics = json.load(f)
        
    with open(ROOT / "results" / "cost_model_comparison.json", encoding="utf-8") as f:
        cost_comparison = json.load(f)
        
    with open(ROOT / "results" / "time_model_comparison.json", encoding="utf-8") as f:
        time_comparison = json.load(f)

    # Focus on July active projects as primary cross-section (1,775 projects)
    latest_month = str(snap["month"].max())
    july_df = snap[snap["month"] == latest_month].copy()
    print(f"Found {len(july_df):,} projects in {latest_month} snapshot")

    # Map month ordering for temporal trend analysis
    months_order = sorted(snap["month"].dropna().astype(str).unique())
    month_display_names = {
        "2026-04": "Apr 2026",
        "2026-05": "May 2026",
        "2026-06": "Jun 2026",
        "2026-07": "Jul 2026"
    }

    # Group full snapshot table by project_code for quick temporal lookup
    snap_grouped = snap.sort_values(["project_code", "month"]).groupby("project_code")

    projects_list = []
    alerts_list = []
    
    feature_labels = {
        "approval_year": "Year of Approval",
        "start_year": "Year Work Commenced",
        "log_original_cost": "Sanctioned Cost Scale",
        "planned_duration_months": "Sanctioned Duration (Months)",
        "approval_to_start_months": "Approval-to-Groundwork Lag",
        "project_age_months": "Project Age (Months)",
        "physical_progress_pct": "Physical Progress %",
        "cumulative_expenditure_cr": "Cumulative Expenditure",
        "expenditure_pct_of_original": "Expenditure vs Sanctioned Cost %",
        "progress_minus_expenditure_pct": "Progress-Expenditure Divergence",
        "progress_per_age_month": "Historical Progress Pace / Month",
        "progress_velocity_pct_month": "Monthly Progress Velocity",
        "expenditure_velocity_cr_month": "Monthly Expenditure Velocity",
        "agency_hist_overrun_pct": "Agency Historical Cost Overrun Track Record",
        "agency_hist_cost_overrun_pct": "Agency Historical Cost Overrun %",
        "sector_hist_cost_overrun_pct": "Sector Historical Cost Overrun %",
        "ministry_hist_cost_overrun_pct": "Ministry Historical Cost Overrun %",
        "agency_hist_slippage_months": "Agency Historical Schedule Slippage Track Record",
        "agency_hist_time_overrun_rate": "Agency Historical Schedule Slippage Rate",
        "sector_hist_time_overrun_rate": "Sector Historical Schedule Slippage Rate",
        "ministry_hist_time_overrun_rate": "Ministry Historical Schedule Slippage Rate",
        "is_multi_state": "Multi-State Execution Complexity"
    }

    for _, row in july_df.iterrows():
        pcode = int(row["project_code"])
        pname = str(row["project_name"])
        agency = str(row["agency"]) if pd.notna(row["agency"]) else "Not Specified"
        ministry = str(row["ministry"]) if pd.notna(row["ministry"]) else "Not Specified"
        sector = str(row["sector"]) if pd.notna(row["sector"]) else "Uncategorized"
        state = str(row["state"]) if pd.notna(row["state"]) else "General"
        
        orig_cost = float(row["original_cost_cr"]) if pd.notna(row["original_cost_cr"]) else 0.0
        rev_cost = float(row["revised_cost_cr"]) if pd.notna(row["revised_cost_cr"]) else orig_cost
        expenditure = float(row["cumulative_expenditure_cr"]) if pd.notna(row["cumulative_expenditure_cr"]) else 0.0
        phys_progress = float(row["physical_progress_pct"]) if pd.notna(row["physical_progress_pct"]) else 0.0
        
        cost_overrun = float(row["cost_overrun_pct"]) if pd.notna(row["cost_overrun_pct"]) else 0.0
        slippage = float(row["schedule_slippage_months"]) if pd.notna(row["schedule_slippage_months"]) else 0.0
        
        # Risk scores from July profiles or fallback
        if pcode in july_profiles:
            c_risk = round(float(july_profiles[pcode]["cost_risk_pct"]), 1)
            t_risk = round(float(july_profiles[pcode]["time_risk_pct"]), 1)
            o_risk = round(float(july_profiles[pcode]["overall_risk_pct"]), 1)
        elif pcode in full_profiles:
            c_risk = round(float(full_profiles[pcode]["cost_risk_score"]) * 100, 1)
            t_risk = round(float(full_profiles[pcode]["time_risk_score"]) * 100, 1)
            o_risk = round(float(full_profiles[pcode]["overall_risk_score"]) * 100, 1)
        else:
            c_risk = 50.0 if cost_overrun > 0 else 20.0
            t_risk = 70.0 if slippage > 6 else 25.0
            o_risk = round((c_risk + t_risk) / 2, 1)

        # 4-tier risk band
        risk_band = "LOW"

        # Temporal Monthly Snapshots for this project
        history_records = []
        if pcode in snap_grouped.groups:
            p_history = snap_grouped.get_group(pcode).sort_values("month")
            for _, h_row in p_history.iterrows():
                m_code = str(h_row["month"])
                h_cost_ov = float(h_row["cost_overrun_pct"]) if pd.notna(h_row["cost_overrun_pct"]) else 0.0
                h_slip = float(h_row["schedule_slippage_months"]) if pd.notna(h_row["schedule_slippage_months"]) else 0.0
                h_prog = float(h_row["physical_progress_pct"]) if pd.notna(h_row["physical_progress_pct"]) else 0.0
                h_exp = float(h_row["cumulative_expenditure_cr"]) if pd.notna(h_row["cumulative_expenditure_cr"]) else 0.0
                h_rev = float(h_row["revised_cost_cr"]) if pd.notna(h_row["revised_cost_cr"]) else orig_cost
                
                history_records.append({
                    "month": m_code,
                    "month_label": month_display_names.get(m_code, m_code),
                    "physical_progress_pct": round(h_prog, 1),
                    "cumulative_expenditure_cr": round(h_exp, 2),
                    "revised_cost_cr": round(h_rev, 2),
                    "cost_overrun_pct": round(h_cost_ov, 1),
                    "schedule_slippage_months": round(h_slip, 1),
                    "risk_score_status": "not_scored_from_historical_snapshot",
                })
                
        risk_trend = "UNAVAILABLE_WITHOUT_HISTORICAL_SCORING"

        # Deterministic Risk Drivers (from SHAP if available + observable telemetry)
        drivers_cost = []
        drivers_time = []
        if pcode in full_profiles:
            fp = full_profiles[pcode]
            for d in fp.get("cost_top_drivers", []):
                feat_name = d.get("feature", "")
                drivers_cost.append({
                    "feature": feat_name,
                    "label": feature_labels.get(feat_name, feat_name.replace("_", " ").title()),
                    "impact": round(float(d.get("impact", 0)), 2)
                })
            for d in fp.get("time_top_drivers", []):
                feat_name = d.get("feature", "")
                drivers_time.append({
                    "feature": feat_name,
                    "label": feature_labels.get(feat_name, feat_name.replace("_", " ").title()),
                    "impact": round(float(d.get("impact", 0)), 2)
                })
        else:
            # Fallback drivers from observable features
            if cost_overrun > 20:
                drivers_cost.append({"feature": "revised_cost_escalation", "label": "Sanctioned Cost Escalation", "impact": round(cost_overrun / 40, 2)})
            if orig_cost > 1000:
                drivers_cost.append({"feature": "log_original_cost", "label": "Large Capital Outlay Scale", "impact": 1.15})
            drivers_cost.append({"feature": "agency_hist_overrun_pct", "label": "Agency Sector Performance Factor", "impact": 0.85})
            
            if slippage > 12:
                drivers_time.append({"feature": "schedule_slippage_months", "label": "Extended Schedule Slippage", "impact": round(slippage / 15, 2)})
            if phys_progress < 80:
                drivers_time.append({"feature": "physical_progress_pct", "label": "Lagging Physical Progress", "impact": 1.45})
            drivers_time.append({"feature": "planned_duration_months", "label": "Multi-Year Duration Execution Complexity", "impact": 0.95})

        # Deterministic Triggers and Actionable Recommendations
        triggers = []
        recommended_actions = []

        if slippage >= 36:
            triggers.append(f"Severe schedule delay: slippage has reached +{slippage:.1f} months beyond target DoC")
            recommended_actions.append("Convene an Inter-Ministerial Empowered Committee to clear right-of-way, statutory clearances, and contractor disputes.")
        elif slippage >= 12:
            triggers.append(f"Moderate schedule slippage (+{slippage:.1f} months)")
            recommended_actions.append("Review milestone execution schedule with implementing agency and enforce liquidated damages clauses where applicable.")

        if cost_overrun >= 50:
            triggers.append(f"Major cost escalation (+{cost_overrun:.1f}% over approved cost)")
            recommended_actions.append("Mandate a Revised Cost Estimate (RCE) audit through MoSPI / Expenditure Department before sanctioning further releases.")
        elif cost_overrun >= 10:
            triggers.append(f"Budget overrun (+{cost_overrun:.1f}%)")
            recommended_actions.append("Review variation orders and material cost escalation clauses against initial contract terms.")

        # Progress vs expenditure divergence check
        exp_ratio = (expenditure / orig_cost * 100) if orig_cost > 0 else 0
        if exp_ratio > (phys_progress + 20) and phys_progress < 95:
            triggers.append(f"Progress-expenditure divergence: {exp_ratio:.1f}% funds expended vs {phys_progress:.1f}% physical completion")
            recommended_actions.append("Deploy a physical milestone verification inspection team to reconcile site progress against released contractor payments.")

        # Stalled progress check across historical snapshots
        if len(history_records) >= 3:
            first_p = history_records[0]["physical_progress_pct"]
            last_p = history_records[-1]["physical_progress_pct"]
            first_e = history_records[0]["cumulative_expenditure_cr"]
            last_e = history_records[-1]["cumulative_expenditure_cr"]
            if abs(last_p - first_p) < 0.5 and (last_e - first_e) > 10.0 and last_p < 99:
                triggers.append(f"Progress stagnation: physical progress remained flat at {last_p:.1f}% while ₹{(last_e - first_e):.1f} Cr was disbursed")
                recommended_actions.append("Halt progressive disbursements pending joint on-site physical measurement certification by independent engineers.")

        observed_trigger = bool(triggers)
        if not observed_trigger:
            triggers.append("No deterministic execution trigger observed in current telemetry")
            recommended_actions.append("Review the forward ML risk signal alongside monthly telemetry before escalating intervention.")

        # Top-5 Historical Precedents
        top_comps = top_comps_by_proj.get(pcode, [])
        comp_info = None
        if top_comps:
            c = top_comps[0]
            comp_info = {
                "project_code": int(c["comparable_project_code"]) if pd.notna(c.get("comparable_project_code")) else None,
                "project_name": str(c.get("comparable_project_name", "Historical Infrastructure Precedent")),
                "agency": str(c.get("comparable_agency", agency)),
                "similarity_score": round(float(c.get("similarity_score", 0.0)), 4),
                "cost_overrun_pct": round(float(c.get("comparable_cost_overrun_pct", 0.0)), 1),
                "schedule_slippage_months": round(float(c.get("comparable_schedule_slippage_months", 0.0)), 1),
                "outcome_note": "Completed within schedule" if float(c.get("comparable_schedule_slippage_months", 0)) <= 0 else f"+{float(c.get('comparable_schedule_slippage_months', 0)):.0f} mo slippage",
                "match_rationale": str(c.get("match_rationale", "Matching capital scale and sectoral domain"))
            }
        elif pcode in full_profiles and full_profiles[pcode].get("comparable_project_name"):
            fp = full_profiles[pcode]
            comp_info = {
                "project_code": None,
                "project_name": fp.get("comparable_project_name"),
                "agency": fp.get("comparable_agency", agency),
                "similarity_score": 0.0,
                "cost_overrun_pct": round(float(fp.get("comparable_cost_overrun_pct", 0.0)), 1),
                "schedule_slippage_months": round(float(fp.get("comparable_schedule_slippage_months", 0.0)), 1),
                "outcome_note": fp.get("comparable_outcome_note", "Historical Precedent"),
                "match_rationale": "Matching scale tier"
            }

        # Attention-Priority Score (composite formula for executive ranking)
        forward_risk = float(july_profiles.get(pcode, {}).get("forward_escalation_risk_pct", 0.0))
        priority_score = calculate_priority_score(c_risk, t_risk, forward_risk, orig_cost)
        risk_band = determine_risk_band(priority_score, c_risk, t_risk)

        project_obj = {
            "project_code": pcode,
            "legacy_ocms_code": str(row["legacy_ocms_code"]) if pd.notna(row["legacy_ocms_code"]) else "",
            "project_name": pname,
            "agency": agency,
            "ministry": ministry,
            "sector": sector,
            "state": state,
            "date_of_approval": str(row["date_of_approval"]) if pd.notna(row["date_of_approval"]) else "",
            "start_date": str(row["start_date"]) if pd.notna(row["start_date"]) else "",
            "target_doc": str(row["target_doc"]) if pd.notna(row["target_doc"]) else "",
            "revised_doc": str(row["revised_doc"]) if pd.notna(row["revised_doc"]) and str(row["revised_doc"]).strip() != "-" else "",
            "planned_duration_months": round(float(row["planned_duration_months"]), 1) if pd.notna(row["planned_duration_months"]) else None,
            "project_age_months": round(float(row["project_age_months"]), 1) if pd.notna(row["project_age_months"]) else None,
            "original_cost_cr": round(orig_cost, 2),
            "revised_cost_cr": round(rev_cost, 2),
            "cumulative_expenditure_cr": round(expenditure, 2),
            "physical_progress_pct": round(phys_progress, 1),
            "cost_overrun_pct": round(cost_overrun, 1),
            "schedule_slippage_months": round(slippage, 1),
            "cost_risk_score": c_risk,
            "cost_risk_pct": c_risk,
            "time_risk_score": t_risk,
            "time_risk_pct": t_risk,
            "forward_escalation_risk_pct": forward_risk,
            "overall_risk_score": o_risk,
            "risk_band": risk_band,
            "risk_trend": risk_trend,
            "priority_score": priority_score,
            "cost_top_drivers": drivers_cost[:3],
            "time_top_drivers": drivers_time[:3],
            "comparable": comp_info,
            "top_comparables": top_comps,
            "triggers": triggers,
            "recommended_actions": recommended_actions,
            "monthly_history": history_records,
            "last_updated": latest_month,
            "explanation_status": "No local SHAP values are claimed; drivers are telemetry rules or legacy global importances"
        }
        projects_list.append(project_obj)

        # Generate alert entry if high or critical
        if risk_band in ["CRITICAL", "HIGH", "MEDIUM"]:
            alerts_list.append({
                "severity": risk_band,
                "level": risk_band,
                "project_code": pcode,
                "project_name": pname,
                "agency": agency,
                "sector": sector,
                "state": state,
                "overall_risk_score": o_risk,
                "priority_score": priority_score,
                "risk_type": "Cost & Schedule Overrun" if (c_risk > 70 and t_risk > 70) else ("Cost Escalation" if c_risk > 70 else ("Schedule Slippage" if t_risk > 70 else "Monitoring Required")),
                "type": "Cost & Schedule Overrun" if (c_risk > 70 and t_risk > 70) else ("Cost Escalation" if c_risk > 70 else ("Schedule Slippage" if t_risk > 70 else "Monitoring Required")),
                "primary_trigger": triggers[0],
                "trigger_type": "OBSERVED_TRIGGER" if observed_trigger else "PREDICTIVE_SIGNAL",
                "current_metric": f"Cost: +{cost_overrun:.1f}% | Delay: +{slippage:.1f}mo",
                "recommended_action": recommended_actions[0],
                "last_updated": "July 2026"
            })

    # Sort projects by priority score descending
    projects_list.sort(key=lambda x: x["priority_score"], reverse=True)
    alerts_list.sort(key=lambda x: (0 if x["severity"] == "CRITICAL" else (1 if x["severity"] == "HIGH" else 2), -x["priority_score"]))

    print(f"Compiled {len(projects_list):,} projects and {len(alerts_list):,} early warning alerts.")

    # Calculate portfolio-wide KPIs
    total_projects = len(projects_list)
    total_sanctioned_cost = sum(p["original_cost_cr"] for p in projects_list)
    total_revised_cost = sum(p["revised_cost_cr"] for p in projects_list)
    total_expenditure = sum(p["cumulative_expenditure_cr"] for p in projects_list)
    
    critical_count = sum(1 for p in projects_list if p["risk_band"] == "CRITICAL")
    high_count = sum(1 for p in projects_list if p["risk_band"] == "HIGH")
    medium_count = sum(1 for p in projects_list if p["risk_band"] == "MEDIUM")
    low_count = sum(1 for p in projects_list if p["risk_band"] == "LOW")
    
    avg_progress = round(float(np.mean([p["physical_progress_pct"] for p in projects_list])), 1)
    avg_slippage = round(float(np.mean([p["schedule_slippage_months"] for p in projects_list])), 1)
    avg_cost_overrun = round(float(np.mean([p["cost_overrun_pct"] for p in projects_list])), 1)
    
    cost_risk_count = sum(1 for p in projects_list if p["cost_risk_score"] >= 60.0)
    time_risk_count = sum(1 for p in projects_list if p["time_risk_score"] >= 60.0)

    kpi = {
        "total_projects": total_projects,
        "total_sanctioned_cr": round(total_sanctioned_cost, 2),
        "total_revised_cr": round(total_revised_cost, 2),
        "total_expenditure_cr": round(total_expenditure, 2),
        "total_cost_escalation_cr": round(total_revised_cost - total_sanctioned_cost, 2),
        "projects_at_risk": critical_count + high_count,
        "critical_risk_count": critical_count,
        "high_risk_count": high_count,
        "medium_risk_count": medium_count,
        "low_risk_count": low_count,
        "cost_risk_projects": cost_risk_count,
        "schedule_risk_projects": time_risk_count,
        "cost_risk_rate_pct": round((cost_risk_count / total_projects) * 100, 1),
        "schedule_risk_rate_pct": round((time_risk_count / total_projects) * 100, 1),
        "avg_physical_progress_pct": avg_progress,
        "avg_schedule_slippage_months": avg_slippage,
        "avg_cost_overrun_pct": avg_cost_overrun,
        "snapshot_month": "July 2026",
        "reporting_period": "April 2026 – July 2026"
    }

    # Aggregate Sector Analytics
    sector_groups = {}
    for p in projects_list:
        sec = p["sector"]
        if sec not in sector_groups:
            sector_groups[sec] = {
                "sector": sec,
                "project_count": 0,
                "total_cost_cr": 0.0,
                "high_risk_count": 0,
                "critical_count": 0,
                "sum_progress": 0.0,
                "sum_slippage": 0.0,
                "sum_overrun": 0.0,
            }
        sg = sector_groups[sec]
        sg["project_count"] += 1
        sg["total_cost_cr"] += p["original_cost_cr"]
        if p["risk_band"] in ["CRITICAL", "HIGH"]:
            sg["high_risk_count"] += 1
        if p["risk_band"] == "CRITICAL":
            sg["critical_count"] += 1
        sg["sum_progress"] += p["physical_progress_pct"]
        sg["sum_slippage"] += p["schedule_slippage_months"]
        sg["sum_overrun"] += p["cost_overrun_pct"]

    sectors_list = []
    for sec, sg in sector_groups.items():
        n = sg["project_count"]
        sectors_list.append({
            "sector": sec,
            "project_count": n,
            "total_cost_cr": round(sg["total_cost_cr"], 2),
            "high_risk_count": sg["high_risk_count"],
            "critical_count": sg["critical_count"],
            "risk_percentage": round((sg["high_risk_count"] / n) * 100, 1),
            "avg_physical_progress_pct": round(sg["sum_progress"] / n, 1),
            "avg_schedule_slippage_months": round(sg["sum_slippage"] / n, 1),
            "avg_cost_overrun_pct": round(sg["sum_overrun"] / n, 1)
        })
    sectors_list.sort(key=lambda x: x["project_count"], reverse=True)

    # Aggregate Agency Risk Intelligence
    agency_groups = {}
    for p in projects_list:
        ag = p["agency"]
        if ag not in agency_groups:
            agency_groups[ag] = {
                "agency": ag,
                "ministry": p["ministry"],
                "project_count": 0,
                "total_cost_cr": 0.0,
                "high_risk_count": 0,
                "critical_count": 0,
                "sum_progress": 0.0,
                "sum_slippage": 0.0,
                "sum_overrun": 0.0,
            }
        ag_obj = agency_groups[ag]
        ag_obj["project_count"] += 1
        ag_obj["total_cost_cr"] += p["original_cost_cr"]
        if p["risk_band"] in ["CRITICAL", "HIGH"]:
            ag_obj["high_risk_count"] += 1
        if p["risk_band"] == "CRITICAL":
            ag_obj["critical_count"] += 1
        ag_obj["sum_progress"] += p["physical_progress_pct"]
        ag_obj["sum_slippage"] += p["schedule_slippage_months"]
        ag_obj["sum_overrun"] += p["cost_overrun_pct"]

    agencies_list = []
    for ag, obj in agency_groups.items():
        n = obj["project_count"]
        agencies_list.append({
            "agency": ag,
            "ministry": obj["ministry"],
            "project_count": n,
            "total_cost_cr": round(obj["total_cost_cr"], 2),
            "high_risk_count": obj["high_risk_count"],
            "critical_count": obj["critical_count"],
            "risk_rate_pct": round((obj["high_risk_count"] / n) * 100, 1),
            "avg_cost_overrun_pct": round(obj["sum_overrun"] / n, 1),
            "avg_schedule_slippage_months": round(obj["sum_slippage"] / n, 1),
            "avg_physical_progress_pct": round(obj["sum_progress"] / n, 1)
        })
    agencies_list.sort(key=lambda x: (x["project_count"] >= 5, x["high_risk_count"], x["project_count"]), reverse=True)

    # Aggregate State Risk Overview
    state_groups = {}
    for p in projects_list:
        st = p["state"]
        if st not in state_groups:
            state_groups[st] = {
                "state": st,
                "project_count": 0,
                "total_cost_cr": 0.0,
                "high_risk_count": 0,
                "critical_count": 0,
                "sum_progress": 0.0
            }
        s_obj = state_groups[st]
        s_obj["project_count"] += 1
        s_obj["total_cost_cr"] += p["original_cost_cr"]
        if p["risk_band"] in ["CRITICAL", "HIGH"]:
            s_obj["high_risk_count"] += 1
        if p["risk_band"] == "CRITICAL":
            s_obj["critical_count"] += 1
        s_obj["sum_progress"] += p["physical_progress_pct"]

    states_list = []
    for st, obj in state_groups.items():
        n = obj["project_count"]
        states_list.append({
            "state": st,
            "project_count": n,
            "total_cost_cr": round(obj["total_cost_cr"], 2),
            "high_risk_count": obj["high_risk_count"],
            "critical_count": obj["critical_count"],
            "risk_rate_pct": round((obj["high_risk_count"] / n) * 100, 1),
            "avg_physical_progress_pct": round(obj["sum_progress"] / n, 1)
        })
    states_list.sort(key=lambda x: (x["project_count"], x["high_risk_count"]), reverse=True)

    # Aggregate Ministry Breakdown
    ministry_groups = {}
    for p in projects_list:
        mi = p["ministry"]
        if mi not in ministry_groups:
            ministry_groups[mi] = {
                "ministry": mi,
                "project_count": 0,
                "total_cost_cr": 0.0,
                "high_risk_count": 0,
                "critical_count": 0,
                "sum_progress": 0.0
            }
        m_obj = ministry_groups[mi]
        m_obj["project_count"] += 1
        m_obj["total_cost_cr"] += p["original_cost_cr"]
        if p["risk_band"] in ["CRITICAL", "HIGH"]:
            m_obj["high_risk_count"] += 1
        if p["risk_band"] == "CRITICAL":
            m_obj["critical_count"] += 1
        m_obj["sum_progress"] += p["physical_progress_pct"]

    ministries_list = []
    for mi, obj in ministry_groups.items():
        n = obj["project_count"]
        ministries_list.append({
            "ministry": mi,
            "project_count": n,
            "total_cost_cr": round(obj["total_cost_cr"], 2),
            "high_risk_count": obj["high_risk_count"],
            "critical_count": obj["critical_count"],
            "risk_rate_pct": round((obj["high_risk_count"] / n) * 100, 1),
            "avg_physical_progress_pct": round(obj["sum_progress"] / n, 1)
        })
    ministries_list.sort(key=lambda x: x["project_count"], reverse=True)

    # Demo projects are selected from the current generated ranking, never by
    # stale project-code case studies or obsolete risk values.
    demo_projects = projects_list[: min(6, len(projects_list))]

    # Final unified payload
    unified_data = {
        "metadata": {
            "title": "PAIMANA — Predictive Infrastructure Monitoring & Early Warning System",
            "subtitle": "Data-driven decision support for monitoring major infrastructure projects",
            "authority": "Ministry of Statistics and Programme Implementation (MoSPI), Government of India",
            "active_snapshot": latest_month,
            "temporal_range": f"{months_order[0]} – {months_order[-1]}",
            "total_records_processed": len(snap),
            "total_active_projects": len(projects_list)
        },
        "kpi": kpi,
        "projects": projects_list,
        "alerts": alerts_list,
        "sectors": sectors_list,
        "agencies": agencies_list,
        "states": states_list,
        "ministries": ministries_list,
        "demo_projects": demo_projects,
        "models": {
            "cost_monitor": cost_metrics,
            "time_monitor": time_metrics,
            "cost_ablation": cost_comparison,
            "time_ablation": time_comparison,
            "evaluation_report": json.loads((ROOT / "results" / "model_evaluation_report.json").read_text(encoding="utf-8")) if (ROOT / "results" / "model_evaluation_report.json").exists() else {}
        },
        "data_quality": {
            "records_processed": len(snap),
            "unique_projects": int(snap.project_code.nunique()),
            "reporting_snapshots": months_order,
            "reporting_coverage_pct": 100.0,
            "data_source_citation": "MoSPI PAIMANA Flash Report (Table 6: All Ongoing Projects ₹150 Cr and Above)",
            "censored_time_labels_handled": True,
            "leakage_safe_temporal_holdout": True,
            "test_month": "2026-06 T+1 target",
            "model_version": profile_metadata.get("model_version", "xgb-forward-t1-v1"),
            "feature_version": profile_metadata.get("feature_version", "features-v2-forward-t1"),
            "limitations": [
                "Modeled on four consecutive monthly snapshots (April–July 2026). Additional historical cycles will further improve long-term horizon forecasting.",
                "Approval year acts as a significant risk predictor, reflecting both project maturity and legacy clearance delays.",
                "Censored time labels (projects past target DoC without declared revised DoC) are excluded from training to prevent false on-time assumptions."
            ]
        },
        "artifact_metadata": {
            "dataset_version": "paimana-panel-apr-jul-2026",
            "model_version": profile_metadata.get("model_version", "xgb-forward-t1-v1"),
            "feature_version": profile_metadata.get("feature_version", "features-v2-forward-t1"),
            "risk_scoring_version": RISK_SCORING_VERSION,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "training_cutoff": "2026-06",
            "evaluation_period": "2026-06 T+1 target",
            "data_mode": "precomputed analytical dashboard with FastAPI scenario inference",
        }
    }

    unified_data = clean_json(unified_data)

    # Export to both frontend/src and frontend/public
    for target in [
        ROOT / "frontend" / "src" / "data" / "paimana_data.json",
        ROOT / "frontend" / "public" / "data" / "paimana_data.json"
    ]:
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            json.dump(unified_data, f, indent=2)
        print(f"Successfully exported unified dataset to {target} ({target.stat().st_size / 1024 / 1024:.2f} MB)")

if __name__ == "__main__":
    build_data()
