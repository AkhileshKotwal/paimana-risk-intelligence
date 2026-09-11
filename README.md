# PAIMANA — Predictive Infrastructure Monitoring & Early Warning System
### Data-Driven Decision Support for Monitoring Major Infrastructure Projects
**Smart India Hackathon (SIH 2026) · Problem Statement 26103**  
*Grounded in Ministry of Statistics and Programme Implementation (MoSPI) Flash Report Telemetry*

---

## 1. Executive Overview

**PAIMANA** transforms the Government of India's infrastructure monitoring framework from a **retrospective reporting log** into an **actionable, predictive early-warning system**.

Traditional infrastructure monitoring tells authorities what has already gone wrong (cost escalations and schedule slippages after they have occurred). **PAIMANA** analyzes multi-month telemetry across central sector projects (₹150 Crore and above) to detect early indicators of execution distress, predict overrun probabilities before irreversible cost commitments occur, and recommend deterministic administrative interventions.

---

## 2. Core Architecture & Highlights

- **Institutional Design System**: Clean, serious, Government of India institutional interface tailored for senior administrators, project directors, and SIH evaluators.
- **Zero External LLM APIs**: In accordance with government data sovereignty and offline demonstration criteria, the system contains **no external AI chat boxes, zero third-party API dependencies, and no exposed API keys**. All decision support, SHAP attributions, and intervention recommendations are generated deterministically.
- **Full Real Dataset Ingestion**: Operates on **1,775 central projects** from the latest July 2026 snapshot (and 7,590 historical records across April–July 2026), with real sanctioned budgets, expenditures, physical progress, and milestone dates.
- **Leakage-Safe Temporal Validation**: Models are trained strictly on earlier snapshots (April–June 2026) and evaluated on hold-out July 2026 telemetry, preventing target leakage and lookahead bias.
- **Interactive 2D Risk Matrix**: Real-time quadrant mapping (Cost Overrun Risk vs. Schedule Overrun Risk) with immediate focus on the critical upper-right quadrant.
- **4-Month Temporal Evolution**: Direct tracking of Physical Progress %, Cumulative Expenditure, and Model Probability across April → May → June → July 2026.
- **SIH Judge Demo Walkthrough (3-Minute Tour)**: An interactive presentation mode walking judges through the national scale, the predictive paradigm shift, flagship case studies, and transparent methodology.

---

## 3. Quick Start & Execution

### Prerequisites
- Node.js (v18+ or v20+)
- Python 3.10+ (for data pipeline scripts)

### Installation & Launch

### Option 1: Standalone Python Launcher (Zero Dependencies, No `npx` needed)
The complete production prototype is already built and packaged into `frontend/dist`. You can serve and view the website immediately without `npx`:

```bash
# From paimana_prototype/
python serve.py
```
This starts the local web server and automatically opens `http://localhost:3000` in your default browser.

### Option 2: Standard npm Development Server (No `npx` needed)
If you prefer running Vite directly via npm:

```bash
cd paimana_prototype/frontend
npm run dev
```

Or to run the compiled production preview:
```bash
cd paimana_prototype/frontend
npm run preview
```

The application is immediately accessible at: **`http://localhost:3000/`**

---

## 4. Repository Structure

```
paimana_prototype/
├── backend/
│   ├── 01_extract_pdfs.py             # MoSPI Flash Report PDF parser (Table 6)
│   ├── 02_feature_engineering.py      # Leakage-safe temporal & velocity features
│   ├── 03_train_cost_overrun_model.py # Cost-overrun XGBoost classifier training
│   ├── 04_train_time_overrun_model.py # Schedule slippage XGBoost classifier training
│   ├── 05_comparable_project_lookup.py# Nearest-neighbor historical comparables
│   ├── 06_package_risk_profiles.py    # Risk score packaging
│   └── models/                        # Serialized .joblib model artifacts
├── data/
│   ├── paimana_projects_apr_jul_2026.csv # Extracted PAIMANA flash reports
│   ├── snapshot_features.csv             # 7,590 engineered snapshot records
│   └── model_data_april_features.csv     # Baseline cross-sectional dataset
├── results/
│   ├── cost_monitor_metrics.json      # Validated hold-out test metrics (Cost)
│   ├── time_monitor_metrics.json      # Validated hold-out test metrics (Schedule)
│   ├── cost_model_comparison.json     # Feature ablation comparison table
│   ├── time_model_comparison.json     # Feature ablation comparison table
│   ├── historical_comparables.csv     # Temporal comparable mappings
│   ├── project_risk_profiles_full.json# 1,968 risk profiles with SHAP drivers
│   └── risk_profiles.json             # 1,775 July snapshot risk profiles
├── scripts/
│   └── build_frontend_data.py         # Unified JSON compilation pipeline
└── frontend/
    ├── package.json                   # React, Vite, Tailwind, Recharts, Lucide
    ├── vite.config.js                 # Optimized vendor chunk splitting
    ├── tailwind.config.js             # Institutional color tokens & typography
    ├── src/
    │   ├── App.jsx                    # Root state & view orchestration
    │   ├── main.jsx                   # React 18 DOM mount
    │   ├── index.css                  # Tailwind styles & print media rules
    │   ├── components/
    │   │   ├── Header.jsx             # Institutional bar, global search, demo trigger
    │   │   ├── Sidebar.jsx            # 8 decision-support navigation tabs
    │   │   └── DemoModal.jsx          # 6-step guided walkthrough for SIH judges
    │   ├── views/
    │   │   ├── OverviewView.jsx       # Command Center KPIs, donut & sector charts
    │   │   ├── ProjectMonitoringView.jsx # Searchable registry across all 1,775 projects
    │   │   ├── RiskIntelligenceView.jsx  # 2D scatter matrix & SHAP feature impacts
    │   │   ├── EarlyWarningCenterView.jsx# 4-tier deterministic anomaly alerts
    │   │   ├── ProjectDetailView.jsx     # Telemetry, timelines, 4-month trends, SHAP
    │   │   ├── PortfolioAnalyticsView.jsx# Agency performance & sector concentration
    │   │   ├── MethodologyView.jsx       # Pipeline, 3 indicator classes, model cards
    │   │   └── DataSourcesView.jsx       # MoSPI Table 6 schema & audit metrics
    │   └── services/
    │       ├── dataService.js         # Unified data access layer
    │       ├── projectService.js      # Multi-field search, multi-filter, pagination
    │       └── riskService.js         # Quadrant mapping, semantic formatting
    └── public/
        └── data/
            └── paimana_data.json      # Complete pre-indexed dataset
```

---

## 5. Application Structure & Core Features

### 1. Overview / Command Center
- **Executive KPIs**: Total Projects (1,775), Sanctioned Outlay (₹31.2 Lakh Cr), Projects at Risk (450+), Cost Overrun Risk Rate (25.6%), Schedule Overrun Risk Rate (64.2%), Average Progress (83.4%).
- **Risk Distribution**: Interactive visual breakdown across Critical, High, Medium, and Low tiers.
- **Sector Risk Concentration**: Comparative bar chart of project volume vs. high-risk proportion.
- **State-wise Risk Analysis**: Ranked table of central projects by state jurisdiction.
- **Immediate Action Alerts**: Callout of top urgent critical projects.

### 2. Central Project Monitoring
- **Complete Registry**: Access to all 1,775 active central projects (no artificial 200-row limit).
- **Multi-Field Search**: Real-time filtering by project code, project name, agency, state, sector, or ministry.
- **Multi-Criteria Filter Toolbar**: Filter by Risk Band, Sector, State, Agency, Min Cost Risk, Min Schedule Risk.
- **Sorting & Pagination**: Full pagination (20/25/50/100 records) with column-header sorting on sanctioned cost, overruns, slippage, progress, and priority score.
- **Exporting**: One-click CSV export of filtered records for administrative reporting.

### 3. Predictive Risk Intelligence & 2D Risk Matrix
- **Cost Risk Intelligence**: XGBoost classification metrics, positive rates, and historical agency overrun factors.
- **Schedule Risk Intelligence**: Time classification metrics, precision, recall, and censored label handling.
- **2D Risk Matrix (Quadrant Scatter)**:
  - **X-axis**: Cost Overrun Risk (0–100%)
  - **Y-axis**: Schedule Overrun Risk (0–100%)
  - **4 Quadrants**: Low/Low (Routine), High Cost/Low Time (Budget Focus), Low Cost/High Time (Timeline Focus), **High/High (Critical Upper-Right Focus)**.
  - Interactive clickable points scaling with project outlay.
- **SHAP Feature Importance**: Real feature impact rankings demonstrating that agency historical overrun track records (+2.48) and planned durations (+2.15) dominate pure budget scale.

### 4. Early Warning Center (Deterministic Alerts)
- **4 Operational Tiers**:
  - 🔴 **Critical**: Immediate executive intervention recommended.
  - 🟠 **High**: Senior administrative monitoring required.
  - 🟡 **Medium**: Enhanced field milestone verification.
  - 🟢 **Low**: Routine quarterly tracking.
- **Deterministic Anomaly Triggers**: Explains *why* the alert fired (e.g., physical progress frozen across 4 cycles while funds were disbursed; schedule slippage >36 months).
- **Actionable Administrative Guidance**: Specific institutional recommendations (milestone audits, revised cost estimate submissions, inter-ministerial ROW committee convenings).
- **Attention-Priority Score**: Composite formula `(Overall Risk × 0.4) + (Cost Risk × 0.2) + (Time Risk × 0.2) + min(Cost/1000, 10) + (Uncompleted % × 0.1)`.

### 5. Detailed Project Risk Profile (Deep-Dive)
- **Header**: Project Name, Code, Executing Agency, Nodal Ministry, State, Risk Band, Risk Score.
- **Financial Breakdown**: Sanctioned Cost, Revised Cost, Net Escalation, Cumulative Expenditure, Expenditure vs. Sanctioned %.
- **Schedule Timeline**: Visual milestone track (Work Commenced → Sanctioned Target DoC → Revised / Current DoC).
- **Temporal Risk Evolution (April → May → June → July)**:
  - Line charts displaying 4-month evolution of Physical Progress %, Cumulative Expenditure (₹ Cr), and Risk Score %.
  - Trend Indicator (↑ Increasing, → Stable, ↓ Decreasing).
- **"Why is this project at risk?"**: Deterministic SHAP drivers with quantified impact bars.
- **Recommended Actions**: Context-specific operational guidance.
- **Nearest Comparable Project**: Historically valid precedent identified from earlier snapshots without target leakage.

### 6. Portfolio Analytics
- **Agency Risk Intelligence**: Ranked performance for major implementing agencies (NHAI, NTPC, Indian Railways, POWERGRID, State Water Resources departments) with average overrun, average slippage, and high-risk project counts.
- **Capital Outlay Concentration**: Sector investment distribution in ₹ Crore.
- **Ministry Oversight Breakdown**: Comparative project volume and risk concentration.

### 7. Transparent Methodology & Model Cards
- **Data Pipeline Flow**: Ingestion → Extraction → Feature Engineering → Temporal Analysis → Leakage-Safe Training → SHAP Attribution → Early Warning.
- **Three Indicator Classes**:
  1. *Observed Indicators*: Direct reported PAIMANA telemetry.
  2. *Derived Indicators*: Calculated operational rates and velocities.
  3. *Predictive Indicators*: ML-generated probabilities and risk attributions.
- **Model Cards & Exact Validated Test Metrics**:
  - Cost Monitor (XGBoost): ROC-AUC 0.952, PR-AUC 0.895, Precision 0.929, Recall 0.632, F1 0.752, Brier 0.079 (n=1,775).
  - Schedule Monitor (XGBoost): ROC-AUC 0.987, PR-AUC 0.993, Precision 0.967, Recall 0.952, F1 0.960, Brier 0.040 (n=1,725).
- **Documented Assumptions & Known Limitations**: Transparent discussion of 4-month snapshot availability, approval year vintage effects, and censored time label treatment.

### 8. Data Sources & Quality Indicators
- **Official Source Documentation**: MoSPI Monthly Flash Report on Central Sector Projects Costing ₹150 Cr and Above (Table 6).
- **Ingestion Schema**: Complete specification of all 14 official fields.
- **Quality Indicators**: 7,590 records processed across 4 monthly cycles with 100% active central reporting coverage.

### 9. SIH Judge Guided Demo Tour (3 Minutes)
- Modal providing a curated 6-step walkthrough for hackathon judges:
  1. Scale of the problem (₹31.2 Lakh Cr portfolio, 64.2% slippage).
  2. Paradigm shift (Predictive early warning vs. static retrospective logs).
  3. Flagship case study (Solan-Kaithlighat NH-5, Project #619003).
  4. 2D Risk Matrix navigation.
  5. Deterministic early warning center.
  6. Academic rigor and leakage-safe validation.

---

## 6. Model & Data Integration

The data integration pipeline bridges the Python machine learning backend and the React frontend:

1. `data/snapshot_features.csv` contains all 7,590 project-month records from official PAIMANA flash reports (April to July 2026).
2. `backend/03_train_cost_overrun_model.py` and `backend/04_train_time_overrun_model.py` train XGBoost classifiers on April–June data and evaluate strictly on hold-out July 2026 data.
3. `scripts/build_frontend_data.py` unifies project metadata, temporal histories, SHAP drivers, comparable project links, and exact evaluation metrics into `frontend/src/data/paimana_data.json` and `frontend/public/data/paimana_data.json`.
4. `frontend/src/services/` provides reactive filtering, searching, sorting, pagination, and quadrant categorization.

---

## 7. Flagship Demonstration Projects

For a 2–3 minute demonstration to SIH evaluators, inspect these representative projects:

| Project Code | Name | Agency | Key Demonstration Aspect |
|---|---|---|---|
| **619003** | Solan - Kaithlighat Section of NH-5 | NHAI | **Progress Stagnation**: Progress flat at 90.11% across 4 months while expenditure doubled (+106%); +66 months delay; 99.5% overall risk. |
| **602185** | Tapovan-Vishnugad HEP [4x130 MW] | NTPC | **Severe Capital Escalation**: +266.3% cost overrun, +193 months schedule slippage. |
| **702637** | Mumbai Metro Line 3 | MMRC | **Urban Transit Complexity**: High capital scale (₹23,136 Cr) with +61.1% cost escalation and +29 months slippage. |
| **705237** | Western Dedicated Freight Corridor | DFCCIL | **Mega Multi-State Project**: ₹51,101 Cr sanctioned outlay with +142.7% cost escalation across 5 states. |
| **701415** | Polavaram Irrigation Project | Water Resources-AP | **Gestation & Scope Expansion**: +447.2% cost escalation, extensive multi-decade execution timeline. |

---

## 8. Assumptions & Known Limitations

1. **Snapshot Duration**: The prototype is trained and validated across four consecutive monthly cycles (April to July 2026). In a full institutional deployment, ingesting 24–36 monthly cycles will enable seasonal and multi-year horizon modeling.
2. **Approval Year Vintage Effect**: Project approval year acts as a significant predictor in both models. This partly reflects project vintage and accumulated gestation rather than purely causal execution friction.
3. **Censored Schedule Labels**: Projects that have exceeded their original target date without declaring an approved revised completion date are treated as censored and excluded from time training to prevent misclassification as on-time.
4. **Local Data Packaging**: The prototype loads the compiled 1,775-project telemetry dataset locally via client-side service abstractions, ensuring instantaneous response times and full offline resilience without external server costs.

---

## 9. Security & Governance

- **No API Keys**: No Anthropic, OpenAI, Gemini, or third-party cloud credentials exist in frontend code or environment variables.
- **Air-Gapped Operation**: The entire system can run in air-gapped government environments without internet connectivity.
- **Privacy & Data Grounding**: All figures are strictly derived from published MoSPI flash reports.

---

## 9. FastAPI REST Backend & API Reference

PAIMANA includes a production-grade FastAPI REST server supporting real-time scenario simulation, programmatic telemetry access, and model inference.

### Launching the API Server
```bash
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger Documentation is immediately available at: **`http://localhost:8000/docs`**

### REST Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | API root metadata and active snapshot status |
| `/api/health` | `GET` | Health check, loaded models, and inventory count (1,775 projects) |
| `/api/portfolio` | `GET` | Aggregate capital outlay, sector concentration, and agency rankings |
| `/api/projects` | `GET` | Filtered, searchable, sorted, and paginated project registry |
| `/api/projects/{id}` | `GET` | Complete project dossier with 4-month telemetry, SHAP drivers, and Top-5 precedents |
| `/api/alerts` | `GET` | 4-tier early-warning alert feed with level filtering |
| `/api/models/evaluation` | `GET` | Walk-forward cross-validation benchmark and feature importances |
| `/api/predict` | `POST` | Live what-if scenario testing and deterministic recommendation generation |

---

## 10. Automated Testing & Verification Suite

PAIMANA includes a 20-point automated `pytest` test suite verifying data integrity, chronological isolation (leakage prevention), ML model pipelines, and REST API endpoints.

### Running the Test Suite
```bash
python -m pytest tests/ -v
```
**Test Coverage Breakdown**:
- `tests/test_data_pipeline.py`: Snapshot record counts (7,590 total, 1,775 July), non-negative financial constraints, progress boundaries (0–100%).
- `tests/test_leakage.py`: Strictly asserts that April 2026 historical track records are NaN, subsequent months use strictly prior snapshots, and July forward escalation targets are unobserved.
- `tests/test_models.py`: Production pipeline loading, probability bounds [0.0, 1.0], and discrimination benchmarks (ROC-AUC ≥ 0.85, Brier score < 0.15).
- `tests/test_api.py`: FastAPI endpoints (`/api/health`, `/api/portfolio`, `/api/projects`, `/api/alerts`, `POST /api/predict`).

---

## 11. SIH Pitch Scripts for Presentation

### A. 30-Second Elevator Pitch
> *"Hon'ble Judges, India monitors ₹31.2 Lakh Crore across 1,775 central infrastructure projects using MoSPI's monthly flash reports. But traditional monitoring is retrospective—it documents delays and cost overruns only after public capital has been committed. We built **PAIMANA**, an institutional predictive early-warning platform that shifts governance from reactive autopsy to proactive intervention. Using leakage-safe machine learning and multi-month velocity telemetry, PAIMANA identifies risk escalation months in advance, explains root drivers with calibrated SHAP attributions, and provides deterministic administrative action items—with zero external LLM dependencies, ensuring 100% data sovereignty."*

### B. 1-Minute Executive Pitch
> *"Distinguished Evaluators, when a ₹5,000 Crore highway or rail project slips by 36 months, the cost escalation rarely happens overnight. It begins with micro-signals: physical progress decelerating below 0.5% per month while contractor disbursements continue at ₹20 Crore monthly.
>
> Today, those warning signs are buried across 500-page PDF tables. **PAIMANA** changes that. We ingested 7,590 project-month records from MoSPI Table 6 across April to July 2026. Rather than relying on fragile AI chatbots, PAIMANA uses calibrated XGBoost models validated across sequential walk-forward temporal splits, achieving a 0.952 ROC-AUC for cost overrun and 0.987 for schedule slippage.
>
> Senior administrators get an interactive 2D Risk Matrix highlighting upper-right critical projects, 4-month physical-versus-financial velocity curves, Top-5 historical precedents, and deterministic operational action items. PAIMANA is production-ready, runs locally without cloud API costs, and delivers actionable governance for Viksit Bharat 2047."*

### C. 2-Minute Technical Pitch
> *"Judges, let us address the engineering rigor behind PAIMANA. Infrastructure monitoring models frequently suffer from target leakage and lookahead bias when trained on static cross-sections. We eliminated this through three strict architectural guardrails:
>
> First, **Temporal Walk-Forward Validation**: We benchmarked Logistic Regression, Random Forest, and XGBoost across chronological monthly folds—April predicting May, April-May predicting June, and April-June validating on our holdout July 2026 dataset of 1,775 active projects. XGBoost demonstrated superior discrimination, achieving 0.952 ROC-AUC on cost and 0.987 on schedule slippage, with Brier calibration scores below 0.08.
>
> Second, **Leakage-Safe Feature Engineering**: Agency, sector, and ministry historical performance indicators are computed strictly using expanding windows from snapshots prior to the observation month. For schedule modeling, censored projects—those exceeding target completion dates without declared revisions—are explicitly flagged and isolated to prevent false on-time assumptions.
>
> Third, **Deterministic Decision Support**: We replaced arbitrary LLM chat interfaces with mathematically grounded explainability: top SHAP feature impacts, rule-based operational triggers, and a Top-5 Nearest Neighbors historical precedent lookup that queries strictly earlier snapshots to surface analogous projects with verified outcomes.
>
> The system is backed by an automated 20-point pytest suite, a FastAPI REST backend, and a zero-dependency local web server. It is robust, auditable, and ready for immediate deployment in MoSPI."*

### D. 5-Minute Grand Finale Stage Demo Script
> **[0:00 - 1:00] The National Challenge & Scale**  
> *"Good morning, respected judges. On screen is the live PAIMANA Command Center. We are looking at 1,775 ongoing Central Sector projects costing ₹150 Crore and above, representing an approved outlay of ₹31.2 Lakh Crore. Of these, 64.2% face schedule slippages and over ₹5 Lakh Crore in cumulative cost escalations have accumulated. The current monitoring process through MoSPI's monthly flash reports is rigorous, but it is fundamentally retrospective. By the time a project appears on an exception table, contractual claims, scope variations, and utility disputes have already locked in cost overruns."*
>
> **[1:00 - 2:00] The Predictive Early Warning Solution**  
> *"PAIMANA transforms this telemetry into proactive governance. Notice our 4-tier early-warning alert feed: Critical, High, Medium, and Low. Let's filter for Critical alerts. PAIMANA has identified 167 projects in acute distress. But look at how: not through an unpredictable LLM prompt, but through multi-month temporal velocity dynamics. In the 2D Risk Matrix, we map Cost Overrun Probability on the X-axis against Schedule Slippage Probability on the Y-axis. The upper-right quadrant immediately isolates dual-risk projects requiring urgent Cabinet or Inter-Ministerial intervention."*
>
> **[2:00 - 3:15] Deep-Dive: Flagship Project Telemetry (Solan-Kaithlighat NH-5)**  
> *"Let us open a live project: Project #619003, the Solan to Kaithlighat 4-laning of NH-5 executed by NHAI. Look at the financial breakdown: Sanctioned at ₹598 Crore, revised to ₹1,234 Crore (+106% escalation), with a delay of +66 months.
>
> Now examine the 4-Month Temporal Evolution chart: from April to July 2026, physical progress remained frozen at exactly 90.11%, while cumulative expenditure surged. PAIMANA's deterministic engine flags this immediately: 'Progress Stagnation with High Capital Burn'. Below, our explainability module presents the exact SHAP attribution factors, and our Top-5 Historical Precedent table matches this project against analogous four-lane hill highway projects from earlier snapshots, showing how similar delays were resolved. Crucially, the administrator receives deterministic action items: convenings of the State Land Acquisition committee and forensic audit of milestone billings."*
>
> **[3:15 - 4:15] Technical Rigor, Benchmarking & Zero-Leakage Guarantee**  
> *"Moving to our Methodology view: We compared Logistic Regression, Random Forest, and XGBoost across 3 sequential walk-forward splits. XGBoost achieved 0.952 ROC-AUC on cost and 0.987 on schedule monitoring, with probability calibration verified via Brier scores. All agency and sector historical track records were calculated strictly on prior months—preventing target leakage. All censored schedule observations are systematically handled. Our automated test suite runs 20 continuous verification tests with 100% pass rates."*
>
> **[4:15 - 5:00] Conclusion & Institutional Value**  
> *"PAIMANA runs completely offline without external cloud dependencies, protecting sovereign infrastructure telemetry. It requires zero API keys, zero subscription costs, and serves both via a zero-dependency web interface and an open FastAPI REST backend. PAIMANA gives project directors and MoSPI leadership the predictive horizon needed to save thousands of crores in public funds. Thank you, and we welcome your questions."*

---

## 12. 25+ SIH Judge Questions & Authoritative Evidence-Grounded Answers

### Category 1: Machine Learning & Methodology
**Q1: How do you prevent data leakage in your time-series features?**  
*Answer:* We enforce strict chronological isolation. All historical track records—such as `agency_hist_cost_overrun_pct` and `sector_hist_time_overrun_rate`—are generated using expanding windows that only include monthly snapshots strictly prior to the current observation month ($M < T$). In our April 2026 baseline, these features are explicitly set to NaN and imputed, verified by our automated test `test_first_month_has_no_prior_history()`. Furthermore, our holdout test set is July 2026, while training is restricted to April, May, and June 2026.

**Q2: What machine learning algorithms did you evaluate, and why did you choose XGBoost?**  
*Answer:* We evaluated three candidate architectures across sequential walk-forward folds:
1. Standardized Logistic Regression with balanced class weights (Mean ROC-AUC: 0.8934 on cost, 0.9722 on time).
2. Random Forest with min-leaf regularization (Mean ROC-AUC: 0.9043 on cost, 0.9555 on time).
3. Gradient Boosted Decision Trees via XGBoost (Mean ROC-AUC: 0.9518 on cost, 0.9876 on time).
XGBoost demonstrated superior discrimination, handled nonlinear interactions between expenditure velocity and physical progress effectively, and achieved the lowest Brier calibration scores (0.0807 for cost, 0.0418 for schedule).

**Q3: How do you handle probability calibration?**  
*Answer:* Raw classification scores can be overconfident. We evaluated probability calibration using Brier score loss ($0.0807$ on cost and $0.0418$ on schedule) and verified that predicted risk percentages closely track empirical positive rates across probability deciles, ensuring probabilities serve as genuine decision-support confidence scores rather than uncalibrated rank metrics.

**Q4: How do you handle censored data where projects have passed their deadline without an updated completion date?**  
*Answer:* In MoSPI Table 6, numerous projects pass their original Target Date of Completion (DoC) but do not record a formal Revised DoC (`revised_doc = '-'`). Treating these as 'on-time' would cause severe label contamination. We calculate `is_censored = 1` for any project whose snapshot date exceeds original target DoC while revised DoC is missing. These records are systematically isolated during time-overrun model training to prevent false negative label corruption.

**Q5: With only four monthly snapshots (April–July 2026), can you forecast risk 12 months ahead?**  
*Answer:* We transparently document this as an academic limitation. A 4-month panel enables robust 1-month forward transition modeling ($T+1$) across 3 monthly intervals (Apr→May, May→Jun, Jun→Jul). Attempting to claim 12-month forward forecasting on a 4-month cross-section would represent statistical fabrication. Our model reliably detects *immediate trajectory deterioration* and *current risk status*, and is designed to ingest 24+ monthly cycles as MoSPI publishes further reports.

**Q6: What are your top predictive features according to SHAP and feature importance?**  
*Answer:* For cost overruns, the top predictive drivers are:
1. `expenditure_pct_of_original`: Ratio of spent funds to sanctioned budget.
2. `agency_hist_cost_overrun_pct`: Historical agency execution track record.
3. `progress_minus_expenditure_pct`: Physical-financial divergence gap.
4. `log_original_cost`: Project scale outlay tier.
For schedule slippage, planned project duration and approval-to-start gestation lag dominate.

**Q7: How did you calculate SHAP values without making the application slow?**  
*Answer:* We pre-computed tree-based SHAP attributions using TreeExplainer on the trained models during feature packaging. For each project, the top 3 positive and negative contributors are serialized directly into the project profile data. This delivers instant sub-millisecond rendering in the UI without runtime overhead or external dependencies.

---

### Category 2: Decision Support, Explainability & AI Architecture
**Q8: Why did you eliminate the AI/LLM chatbot from the prototype?**  
*Answer:* Infrastructure monitoring of sovereign capital projects requires auditable, deterministic, and verifiable evidence. Large Language Model chatbots hallucinate numbers, require external cloud API calls, expose confidential data to third-party endpoints, and introduce non-deterministic advice that no government project director could legally rely upon. We replaced the chat box with:
1. Quantified SHAP risk driver bars.
2. 4-month empirical velocity curves.
3. Top-5 nearest historical precedents with verified outcomes.
4. Rule-based administrative action items derived from Central Vigilance Commission (CVC) and NITI Aayog project guidelines.

**Q9: How do your rule-based recommendations work?**  
*Answer:* Recommendations are mapped to rigorous operational triggers:
- When slippage exceeds 36 months: Mandate convening of an Inter-Ministerial Empowered Committee to resolve right-of-way and statutory clearances.
- When cost escalation exceeds 50%: Mandate a Revised Cost Estimate (RCE) audit through the Department of Expenditure before further budget releases.
- When progress velocity is <0.5%/month while spend velocity is >₹10 Cr/month: Mandate on-site measurement certification by third-party independent engineers and freeze advance billings.
- When target DoC is within 6 months but progress is <60%: Order urgent critical-path review of contractor equipment mobilization.

**Q10: How does your Top-5 Historical Precedent matching work?**  
*Answer:* We utilize a `NearestNeighbors` model fitted strictly on historical project snapshots ($M < T$) over a standardized feature space including capital outlay, planned duration, physical progress, sector, and ministry. Precedents are re-ranked to prioritize identical sectors and ministries, and each match is displayed with its similarity percentage, distance, comparable cost overrun, and explicit match rationale.

**Q11: How is the Attention-Priority Score calculated?**  
*Answer:* The Priority Score (0–100) is a weighted multi-factor composite designed for executive filtering:
$$\text{Priority Score} = 0.35 \times \text{Cost Risk} + 0.30 \times \text{Schedule Risk} + 0.15 \times \text{Forward Escalation Risk} + 0.20 \times \text{Scale Factor}$$
where Scale Factor log-normalizes capital outlay up to ₹50,000 Crore. This ensures that a ₹20,000 Crore mega-project with moderate risk receives higher administrative attention than a ₹150 Crore project with similar risk percentage.

---

### Category 3: Institutional Relevance & Government Deployment
**Q12: How does PAIMANA integrate with existing MoSPI OCMS (Online Computerized Monitoring System)?**  
*Answer:* PAIMANA is designed as an analytical decision-support layer sitting directly on top of OCMS. While OCMS serves as the transactional data-entry portal where executing agencies input monthly milestone data, PAIMANA ingests the resulting Table 6 telemetry to compute automated risk scores, 2D quadrant positioning, and early warnings, feeding actionable dashboards to the Cabinet Secretariat, PMO, and Project Review Committees.

**Q13: Which central projects are included in this dataset?**  
*Answer:* In accordance with MoSPI guidelines, PAIMANA covers all Central Sector infrastructure projects costing **₹150 Crore and above**. In the active July 2026 cycle, this encompasses exactly 1,775 projects across 16 infrastructure sectors including Railways, Road Transport & Highways, Petroleum, Power, Coal, Urban Development, and Water Resources.

**Q14: How does PAIMANA handle multi-state projects?**  
*Answer:* Mega projects like the Western Dedicated Freight Corridor (Project #705237) or East Coast pipeline networks cross multiple states. We explicitly incorporate an `is_multi_state` indicator. In the UI, multi-state projects are clearly tagged and can be filtered independently or reviewed under overall nodal ministry allocations.

**Q15: What prevents executing agencies from reporting optimistic progress numbers?**  
*Answer:* This is precisely where PAIMANA's physical-financial divergence metric detects anomalies. An agency can report 85% physical progress, but if cumulative expenditure is only 40% or if progress remains unchanged across 4 consecutive monthly cycles while expenditure increases, PAIMANA triggers the 'Progress-Expenditure Divergence' and 'Stagnant Progress with High Expenditure' alerts, alerting inspectors to audit on-site physical measurements.

**Q16: How does PAIMANA align with PM Gati Shakti?**  
*Answer:* PM Gati Shakti provides the spatial GIS planning layer for infrastructure connectivity; PAIMANA provides the temporal-financial monitoring and risk-prediction engine. Together, they form a closed-loop infrastructure intelligence stack: plan spatially on Gati Shakti, execute and monitor predictively on PAIMANA.

---

### Category 4: System Architecture, Performance & Cybersecurity
**Q17: Does the frontend require internet connectivity or external CDN assets?**  
*Answer:* No. All CSS, icons, fonts, and JavaScript bundles are compiled into `frontend/dist`. The dataset is pre-indexed and bundled locally. The application can run entirely on an air-gapped machine, in a naval dockyard, or within an isolated government intranet using `python serve.py` with zero internet access.

**Q18: What is your response latency when filtering across 1,775 projects?**  
*Answer:* Under 16 milliseconds. By computing pre-indexed lookup maps, memoizing sector/ministry summaries, and utilizing client-side Web-Worker compatible state management in React 18, filtering, full-text searching, and sorting execute instantaneously on standard desktop hardware without network roundtrips.

**Q19: How do you support programmatic access for other government departments?**  
*Answer:* We built a complete FastAPI REST backend in `backend/app.py` with standardized Pydantic schemas. Ministries and oversight bodies can programmatically query `/api/projects`, retrieve risk profiles, or submit hypothetical project scenarios to `/api/predict` for instant what-if risk scoring.

**Q20: What automated test suite protects against regressions?**  
*Answer:* We maintain a 20-point automated `pytest` suite across 4 dedicated test modules: `test_data_pipeline.py`, `test_leakage.py`, `test_models.py`, and `test_api.py`. It verifies data integrity, zero temporal leakage, model probability bounds, and REST API contract compliance with a 100% pass rate.

**Q21: Why did you build a standalone Python launcher (`serve.py`)?**  
*Answer:* In high-security government enterprise environments and during live hackathon evaluation booths, Node.js or `npx` global permissions may be restricted or blocked by firewall policies. `serve.py` uses Python's built-in `http.server` and `socketserver` libraries to serve the SPA prototype on port 3000 with zero external package installations.

---

### Category 5: Edge Cases, Scalability & Roadmap
**Q22: How does PAIMANA handle projects with zero expenditure or early-stage projects?**  
*Answer:* Early-stage projects (e.g. project age < 6 months or 0% expenditure) are recognized as gestation-phase projects. Rather than flagging them falsely for low progress velocity, the model evaluates their `approval_to_start_months` gestation and planned duration against historical sector baselines, assigning appropriate confidence bands.

**Q23: How does the model adapt when a project receives a formal Revised Cost Sanction?**  
*Answer:* When a Revised Cost Estimate is approved by the Cabinet, `revised_cost_cr` is updated. PAIMANA's pipeline tracks both the original cost and revised cost, recording the net escalation percentage while resetting the expenditure-to-revised-budget ratio, thereby reflecting the newly authorized fiscal envelope.

**Q24: Can the system scale to 10,000+ state and district-level projects?**  
*Answer:* Absolutely. The current architecture processes 7,590 monthly records in under 8 seconds on a single CPU core. At 10,000 projects, monthly dataset volume remains under 100 MB, easily managed within PostgreSQL / DuckDB with sub-second analytical aggregations and horizontal FastAPI container scaling.

**Q25: What is the primary operational takeaway from your findings?**  
*Answer:* Our empirical analysis of July 2026 data shows that cost overruns are heavily concentrated in a small subset of sectors: Railways, Power, and Water Resources account for over 72% of total capital cost escalations, while Road Transport projects face extensive schedule slippages but lower percentage cost escalation due to standard EPC contract structures. PAIMANA enables the government to deploy focused, sector-tailored administrative interventions rather than one-size-fits-all monitoring.

---

*PAIMANA — Predictive Infrastructure Monitoring & Early Warning System*  
*Developed for Smart India Hackathon (SIH 2026) · Problem Statement 26103*
# paimana-risk-intelligence
