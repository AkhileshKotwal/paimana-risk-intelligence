import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  Clock,
  Coins,
  TrendingUp,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  GitCompare,
  TrendingDown,
  Minus
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  formatCr,
  formatPct,
  formatMonths,
  getRiskBadge,
  getRiskColor,
  getRiskBgColor
} from '../services/riskService';

export const ProjectDetailView = ({ project, onBack, onSelectProject }) => {
  if (!project) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
        <p className="text-slate-500">No project selected. Please select a project from the monitoring registry.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Monitoring Table
        </button>
      </div>
    );
  }

  const badge = getRiskBadge(project.risk_band);
  const costIncreaseCr = Math.max(0, project.revised_cost_cr - project.original_cost_cr);
  const expenditurePct = project.original_cost_cr > 0 ? (project.cumulative_expenditure_cr / project.original_cost_cr) * 100 : 0;

  // Monthly historical trend
  const history = project.monthly_history || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Registry</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Project ID: #{project.project_code}</span>
          {project.legacy_ocms_code && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              OCMS: {project.legacy_ocms_code}
            </span>
          )}
        </div>
      </div>

      {/* Primary Project Risk Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono border ${badge.bg} ${badge.text} ${badge.border} flex items-center gap-1.5`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                {badge.label} ({project.overall_risk_score.toFixed(1)}%)
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {project.sector}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {project.state}
              </span>
              {project.risk_trend === 'INCREASING' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  Risk Trend: Increasing
                </span>
              )}
              {project.risk_trend === 'STABLE' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                  Risk Trend: Stable
                </span>
              )}
              {project.risk_trend === 'DECREASING' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  Risk Trend: Decreasing
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-slate-900 leading-snug">
              {project.project_name}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 text-xs text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Implementing Agency</span>
                <span className="font-medium text-slate-800">{project.agency}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nodal Ministry</span>
                <span className="font-medium text-slate-800">{project.ministry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sanctioned Date</span>
                <span className="font-medium text-slate-800">{project.date_of_approval || 'Not Recorded'}</span>
              </div>
            </div>
          </div>

          {/* Risk Scores KPI Panel */}
          <div className="flex sm:flex-row lg:flex-col gap-3 min-w-[200px] flex-shrink-0">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Cost Overrun Risk</span>
              <span className="text-xl font-bold font-mono text-amber-600">
                {project.cost_risk_score.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block">Uncalibrated model score</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Schedule Slippage Risk</span>
              <span className="text-xl font-bold font-mono text-orange-600">
                {project.time_risk_score.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block">Uncalibrated model score</span>
            </div>
          </div>
        </div>

        {/* Financial & Schedule Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 text-center">
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Original Cost</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{formatCr(project.original_cost_cr)}</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Revised Cost</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{formatCr(project.revised_cost_cr)}</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Overrun</span>
            <span className={`text-sm font-bold font-mono mt-0.5 block ${project.cost_overrun_pct > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {formatPct(project.cost_overrun_pct)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expenditure to Date</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{formatCr(project.cumulative_expenditure_cr)}</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Schedule Slippage</span>
            <span className={`text-sm font-bold font-mono mt-0.5 block ${project.schedule_slippage_months > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {formatMonths(project.schedule_slippage_months)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Physical Progress</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
              {project.physical_progress_pct != null ? `${project.physical_progress_pct.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Timeline Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-blue-600" />
          Project Schedule & Commissioning Timeline
        </h2>

        <div className="mt-6 px-4">
          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2"></div>
            {project.schedule_slippage_months > 0 && (
              <div className="absolute top-1/2 left-1/2 right-0 h-1 bg-red-500 -translate-y-1/2"></div>
            )}

            <div className="relative flex justify-between items-center text-center">
              {/* Point 1: Start Date */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                  1
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-900">Work Commenced</div>
                <div className="text-[11px] font-mono text-slate-500">{project.start_date || 'N/A'}</div>
              </div>

              {/* Point 2: Original Target DoC */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-900">Sanctioned Target DoC</div>
                <div className="text-[11px] font-mono text-slate-500">{project.target_doc || 'N/A'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Duration: {project.planned_duration_months || 0} mo</div>
              </div>

              {/* Point 3: Revised DoC */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white ${
                    project.schedule_slippage_months > 0 ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                >
                  3
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-900">Revised / Current DoC</div>
                <div className="text-[11px] font-mono text-slate-500">{project.revised_doc || project.target_doc || 'N/A'}</div>
                {project.schedule_slippage_months > 0 && (
                  <div className="text-[10px] font-bold text-red-600 font-mono mt-0.5">
                    Delay: +{project.schedule_slippage_months.toFixed(1)} Months
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Risk Evolution (April -> May -> June -> July) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Temporal Evolution (April 2026 → July 2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-month trajectory of Physical Progress, Cumulative Expenditure, and Model Risk Score
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-200">
            4 Monthly Flash Report Snapshots
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Chart 1: Physical Progress vs Expenditure */}
          <div>
            <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>Physical Progress (%) vs Cumulative Expenditure (₹ Cr)</span>
              <span className="text-[11px] text-slate-400 font-normal">Monthly Snapshot Values</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="physical_progress_pct"
                    name="Physical Progress (%)"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative_expenditure_cr"
                    name="Expenditure (₹ Cr)"
                    stroke="#D97706"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Cost Risk vs Time Risk Trajectory */}
          <div>
            <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>Predictive Risk Score Trajectory (%)</span>
              <span className="text-[11px] text-slate-400 font-normal">Temporal Model Risk Score</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost_risk_score"
                    name="Cost Overrun Risk (%)"
                    stroke="#EA580C"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="time_risk_score"
                    name="Schedule Slippage Risk (%)"
                    stroke="#DC2626"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="overall_risk_score"
                    name="Composite Risk (%)"
                    stroke="#4338CA"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Decision Support: Why is this project at risk? (REPLACES CHAT BOX) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Explainable Decision Support: Why is this project at risk?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidence-grounded drivers from observable project telemetry and global model feature importance. Local SHAP values are not claimed.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Deterministic Engine · No External LLM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Cost Drivers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Primary Cost Escalation Drivers
            </h3>
            <div className="space-y-2">
              {project.cost_top_drivers?.map((d, i) => (
                <div key={i} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-semibold text-amber-900">
                    <span>{d.label}</span>
                      <span className="font-mono text-amber-700">+{d.impact} driver score</span>
                  </div>
                  <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(d.impact) * 40)}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!project.cost_top_drivers || project.cost_top_drivers.length === 0) && (
                <p className="text-xs text-slate-400 italic">No elevated cost escalation drivers triggered.</p>
              )}
            </div>
          </div>

          {/* Schedule Drivers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              Primary Schedule Slippage Drivers
            </h3>
            <div className="space-y-2">
              {project.time_top_drivers?.map((d, i) => (
                <div key={i} className="p-3 bg-orange-50/60 border border-orange-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-semibold text-orange-900">
                    <span>{d.label}</span>
                      <span className="font-mono text-orange-700">+{d.impact} driver score</span>
                  </div>
                  <div className="w-full bg-orange-200/60 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-orange-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(d.impact) * 40)}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!project.time_top_drivers || project.time_top_drivers.length === 0) && (
                <p className="text-xs text-slate-400 italic">No elevated schedule delay drivers triggered.</p>
              )}
            </div>
          </div>
        </div>

        {/* Deterministic Recommended Actions */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Deterministic Actionable Recommendations for Project Authorities
          </h3>

          <div className="space-y-2.5">
            {project.recommended_actions?.map((act, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="leading-relaxed">{act}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Precedent / Comparable Projects Lookup (Top-5 Nearest Neighbors) */}
      {(project.comparable || (project.top_comparables && project.top_comparables.length > 0)) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-600" />
                Top Historical Precedents & Analogous Case Analysis
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eligible historical projects from strictly earlier monthly reporting snapshots matching scale, duration, sector, and expenditure velocity
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 self-start sm:self-auto">
              Leakage-Safe Chronological Precedents
            </span>
          </div>

          {/* Primary #1 Match Highlight */}
          {project.comparable && (
            <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded uppercase tracking-wider">
                      Primary Match #{project.comparable.rank || '1'}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {project.comparable.project_name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Agency: <strong className="text-slate-700">{project.comparable.agency}</strong>
                    {project.comparable.match_rationale && (
                      <span className="text-slate-600 ml-2">· {project.comparable.match_rationale}</span>
                    )}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                    project.comparable.outcome_note?.includes('Completed') || project.comparable.schedule_slippage_months <= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Outcome: {project.comparable.outcome_note || 'Historical Precedent'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-indigo-100/70 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Comparable Cost Overrun</span>
                  <span className="font-mono font-bold text-slate-800">{formatPct(project.comparable.cost_overrun_pct)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Comparable Slippage</span>
                  <span className="font-mono font-bold text-slate-800">{formatMonths(project.comparable.schedule_slippage_months)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Precedent Snapshot</span>
                  <span className="text-indigo-700 font-medium font-mono">{project.comparable.comparable_month || 'Earlier Snapshot'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sector Proximity</span>
                  <span className="text-slate-700 font-medium">{project.sector}</span>
                </div>
              </div>
            </div>
          )}

          {/* Top-5 Precedents Table */}
          {project.top_comparables && project.top_comparables.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Top 5 Nearest Historical Case Precedents
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Precedent Project Name</th>
                      <th className="py-2 px-3">Snapshot</th>
                      <th className="py-2 px-3">Similarity Score</th>
                      <th className="py-2 px-3">Cost Overrun</th>
                      <th className="py-2 px-3">Schedule Slippage</th>
                      <th className="py-2 px-3">Match Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.top_comparables.slice(0, 5).map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800 block truncate max-w-xs" title={comp.comparable_project_name}>
                            {comp.comparable_project_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Code: {comp.comparable_project_code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{comp.comparable_month}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-indigo-700 font-mono">
                            {comp.similarity_score != null ? comp.similarity_score.toFixed(4) : 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className={comp.comparable_cost_overrun_pct > 20 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                            +{comp.comparable_cost_overrun_pct || 0}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className={comp.comparable_schedule_slippage_months > 12 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                            +{comp.comparable_schedule_slippage_months || 0} mos
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs text-[11px]">
                          {comp.match_rationale || (comp.same_sector ? 'Sector match & scale similarity' : 'Scale and outlay proximity')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
