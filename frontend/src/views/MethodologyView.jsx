import React from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Layers,
  ShieldCheck,
  Code2,
  Table,
  Info
} from 'lucide-react';

export const MethodologyView = ({ models, dataQuality }) => {
  const costTest = models?.cost_monitor?.test || {};
  const timeTest = models?.time_monitor?.test || {};

  const pipelineSteps = [
    { title: "1. Official PAIMANA Source", desc: "Ingestion of MoSPI Flash Reports (Table 6: All Ongoing Projects ₹150 Cr and above) spanning April to July 2026." },
    { title: "2. Data Extraction & Cleaning", desc: "Automated table parsing, OCR text cleanup, dual-code harmonization, and date normalization into standard timestamps." },
    { title: "3. Feature Engineering", desc: "Planned duration calculation (Target DoC - Start Date), project age, groundwork lag, and multi-state flags." },
    { title: "4. Temporal Trend Modeling", desc: "Month-over-month velocity tracking for physical progress and cumulative expenditure without lookahead leakage." },
    { title: "5. Leakage-Safe Group Track Record", desc: "Historical agency/sector performance derived strictly from snapshots prior to current prediction month." },
    { title: "6. ML Risk Quantification", desc: "Uncalibrated XGBoost forward T+1 classifiers trained on earlier snapshots and evaluated on the latest month with a known target." },
    { title: "7. Evidence and Limitations", desc: "Global model feature importance and observable telemetry rules are shown; local SHAP values are not claimed in this prototype." },
    { title: "8. Early Warning & Decision Support", desc: "Multi-tiered anomaly detection triggering rule-based, actionable administrative recommendations." },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Methodology & Machine Learning Architecture
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Full academic and institutional transparency regarding data pipelines, leakage prevention, validated test metrics, and known limitations
        </p>
      </div>

      {/* End-to-End Pipeline Diagram */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider text-xs">
          End-to-End Predictive Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl relative flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-blue-700 font-mono mb-1">{step.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-3 text-[10px] text-slate-400 font-mono flex items-center justify-end">
                Step 0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Categories of Indicators */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider text-xs">
          Three Categories of Indicators (SIH Core Transparency Requirement)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Observed */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono uppercase">
              1. Observed Indicators
            </span>
            <h3 className="text-xs font-bold text-slate-900 mt-1">Direct PAIMANA Telemetry</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Official reported fields from the monthly flash report without transformation: Sanctioned Cost, Revised Cost, Cumulative Expenditure, Physical Progress %, Date of Approval, Start Date, Target DoC, and Revised DoC.
            </p>
          </div>

          {/* Derived */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono uppercase">
              2. Derived Indicators
            </span>
            <h3 className="text-xs font-bold text-slate-900 mt-1">Engineered Project Dynamics</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Calculated operational variables: Planned Duration (Target DoC − Start Date), Project Age (Months), Approval-to-Groundwork Lag, Progress-Expenditure Divergence, and Month-over-Month Velocity.
            </p>
          </div>

          {/* Predictive */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono uppercase">
              3. Predictive Indicators
            </span>
            <h3 className="text-xs font-bold text-slate-900 mt-1">ML Risk Probabilities</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Forward T+1 risk scores, Composite Priority Score, and observable telemetry explanations. Scores are uncalibrated model outputs, not official probabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Model Cards with Exact Validated Test Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Model Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono uppercase">
                Model Card 01
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Cost-Overrun Monitoring Classifier</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">XGBoost (n_estimators=300)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">ROC-AUC</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {costTest.roc_auc != null ? `${(costTest.roc_auc * 100).toFixed(1)}%` : 'Unavailable'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">PR-AUC</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {costTest.pr_auc != null ? `${(costTest.pr_auc * 100).toFixed(1)}%` : 'Unavailable'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">Precision</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {costTest.precision != null ? `${(costTest.precision * 100).toFixed(1)}%` : 'Unavailable'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">Brier Score</span>
              <span className="text-sm font-bold font-mono text-emerald-600">
                {costTest.brier_score != null ? costTest.brier_score.toFixed(3) : 'Unavailable'}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 text-[11px]">
            <div><strong>Validation Protocol:</strong> Chronological T+1 holdout on the latest month with known targets (n={costTest.sample_size || 'Unavailable'}); July is scored only as a current demonstration snapshot.</div>
            <div><strong>Features Used:</strong> 17 quantitative telemetry features + 4 categorical embeddings (agency, ministry, sector, state). Imputed median, standardized.</div>
          </div>
        </div>

        {/* Schedule Model Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-mono uppercase">
                Model Card 02
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Schedule-Overrun Monitoring Classifier</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">XGBoost (n_estimators=300)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">ROC-AUC</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {timeTest.roc_auc != null ? `${(timeTest.roc_auc * 100).toFixed(1)}%` : 'Unavailable'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">PR-AUC</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {timeTest.pr_auc != null ? `${(timeTest.pr_auc * 100).toFixed(1)}%` : 'Unavailable'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">Recall</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {timeTest.recall != null ? `${(timeTest.recall * 100).toFixed(1)}%` : 'Unavailable'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] text-slate-400 block font-semibold">Brier Score</span>
              <span className="text-sm font-bold font-mono text-emerald-600">
                {timeTest.brier_score != null ? timeTest.brier_score.toFixed(3) : 'Unavailable'}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 text-[11px]">
            <div><strong>Validation Protocol:</strong> Chronological T+1 holdout on the latest month with known targets (n={timeTest.sample_size || 'Unavailable'}). Unknown/censored future labels are excluded.</div>
            <div><strong>Features Used:</strong> 17 quantitative telemetry features including agency historical slippage rates and progress velocities.</div>
          </div>
        </div>
      </div>

      {/* Documented Assumptions and Known Limitations */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          Academic Rigor: Documented Assumptions & Known Limitations
        </h2>

        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <strong>1. Snapshot Availability:</strong> The current prototype is validated across four consecutive monthly cycles (April to July 2026, comprising 7,590 project-month records). While sufficient to demonstrate month-over-month telemetry and leakage-safe validation, additional multi-year historical snapshots will strengthen long-horizon macroeconomic forecasting.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <strong>2. Approval Year Artifact:</strong> Approval year is included as a model feature. Its association may reflect project maturity and gestation rather than causal risk; local SHAP attribution is not enabled.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <strong>3. Censored Time Labels:</strong> Projects whose original target date has passed but currently lack an officially declared revised date are treated as censored and excluded from time training to avoid misclassifying them as on-schedule.
          </div>
        </div>
      </div>
    </div>
  );
};
