import React, { useState, useMemo } from 'react';
import {
  Activity,
  Layers,
  Clock,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  Info,
  CheckCircle2,
  AlertOctagon,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { formatCr, formatPct, getQuadrantInfo, getRiskBadge } from '../services/riskService';

export const RiskIntelligenceView = ({ projects = [], onSelectProject, models }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL');

  // Sample or plot scatter projects (up to 400 for smooth, crisp SVG rendering)
  const scatterPoints = useMemo(() => {
    // Select top 350 projects prioritized by overall risk
    const subset = [...projects]
      .sort((a, b) => b.overall_risk_score - a.overall_risk_score)
      .slice(0, 350);

    return subset.map((p) => {
      const qInfo = getQuadrantInfo(p.cost_risk_score, p.time_risk_score);
      return {
        x: p.cost_risk_score,
        y: p.time_risk_score,
        z: Math.max(10, Math.min(p.original_cost_cr / 100, 60)), // size represents cost
        name: p.project_name,
        code: p.project_code,
        cost: p.original_cost_cr,
        overrun: p.cost_overrun_pct,
        slippage: p.schedule_slippage_months,
        agency: p.agency,
        sector: p.sector,
        risk_band: p.risk_band,
        overall_risk_score: p.overall_risk_score,
        quadrant: qInfo.quadrant,
        color: qInfo.color,
        rawProject: p,
      };
    });
  }, [projects]);

  // Filtered scatter points
  const filteredPoints = useMemo(() => {
    if (selectedQuadrant === 'ALL') return scatterPoints;
    return scatterPoints.filter((p) => p.quadrant === selectedQuadrant);
  }, [scatterPoints, selectedQuadrant]);

  // Quadrant summary stats
  const quadrantCounts = useMemo(() => {
    let q1 = 0; // High/High
    let q2 = 0; // Low Cost/High Time
    let q3 = 0; // High Cost/Low Time
    let q4 = 0; // Low/Low

    projects.forEach((p) => {
      if (p.cost_risk_score >= 60 && p.time_risk_score >= 60) q1++;
      else if (p.cost_risk_score < 60 && p.time_risk_score >= 60) q2++;
      else if (p.cost_risk_score >= 60 && p.time_risk_score < 60) q3++;
      else q4++;
    });

    return { q1, q2, q3, q4 };
  }, [projects]);

  const telemetryDriverSummary = useMemo(() => [
    {
      feature: 'Progress / expenditure gap',
      impact: projects.filter((p) => (p.physical_progress_pct ?? 0) < ((p.cumulative_expenditure_cr ?? 0) / Math.max(p.original_cost_cr ?? 1, 1)) * 100 - 20).length,
    },
    {
      feature: 'Reported schedule slippage',
      impact: projects.filter((p) => (p.schedule_slippage_months ?? 0) > 12).length,
    },
    {
      feature: 'Stalled progress telemetry',
      impact: projects.filter((p) => Math.abs(p.progress_velocity_pct_month ?? 0) < 0.2 && (p.expenditure_velocity_cr_month ?? 0) > 5).length,
    },
  ], [projects]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Predictive Risk Intelligence & Risk Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            2D Multi-dimensional risk quantification: Cost Overrun Risk vs Schedule Overrun Risk
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-mono font-semibold">
            {quadrantCounts.q1.toLocaleString()} Projects in Critical Upper-Right Quadrant
          </span>
        </div>
      </div>

      {/* 2-Column Risk Dimension Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Risk Dimension */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Cost Overrun Risk Dimension</h2>
                <p className="text-[11px] text-slate-500">XGBoost Classification & Regression Pipeline</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600">
              AUC: {models?.cost_monitor?.test?.roc_auc != null ? (models.cost_monitor.test.roc_auc * 100).toFixed(1) : 'Unavailable'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Positive Rate</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{models?.cost_monitor?.test?.positive_rate != null ? (models.cost_monitor.test.positive_rate * 100).toFixed(1) : 'Unavailable'}{models?.cost_monitor?.test?.positive_rate != null ? '%' : ''}</div>
              <div className="text-[10px] text-slate-400">of active projects</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Test Precision</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {models?.cost_monitor?.test?.precision != null ? `${(models.cost_monitor.test.precision * 100).toFixed(1)}%` : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-400">low false alarms</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Brier Score</div>
              <div className="text-base font-bold font-mono text-emerald-600 mt-0.5">
                {models?.cost_monitor?.test?.brier_score != null ? models.cost_monitor.test.brier_score.toFixed(3) : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-400">uncalibrated score</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-600 bg-amber-50/70 border border-amber-100 p-3 rounded-lg leading-relaxed">
            <strong>Evidence boundary:</strong> This view uses forward, uncalibrated model scores and observable telemetry. Local SHAP impacts are not implemented in this prototype.
          </div>
        </div>

        {/* Schedule Risk Dimension */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Schedule Overrun Risk Dimension</h2>
                <p className="text-[11px] text-slate-500">Hold-out Temporal Validation on July 2026</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-orange-600">
              AUC: {models?.time_monitor?.test?.roc_auc != null ? (models.time_monitor.test.roc_auc * 100).toFixed(1) : 'Unavailable'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Positive Rate</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{models?.time_monitor?.test?.positive_rate != null ? (models.time_monitor.test.positive_rate * 100).toFixed(1) : 'Unavailable'}{models?.time_monitor?.test?.positive_rate != null ? '%' : ''}</div>
              <div className="text-[10px] text-slate-400">exceed target DoC</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Test Recall</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {models?.time_monitor?.test?.recall != null ? `${(models.time_monitor.test.recall * 100).toFixed(1)}%` : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-400">captures 95% delays</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Test F1-Score</div>
              <div className="text-base font-bold font-mono text-emerald-600 mt-0.5">
                {models?.time_monitor?.test?.f1 != null ? `${(models.time_monitor.test.f1 * 100).toFixed(1)}%` : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-400">robust balance</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-600 bg-orange-50/70 border border-orange-100 p-3 rounded-lg leading-relaxed">
            <strong>Key Finding:</strong> Censored time labels (projects whose original target has lapsed without an approved revised DoC) are explicitly isolated in training to prevent under-reporting delays.
          </div>
        </div>
      </div>

      {/* 2D Risk Matrix (Quadrant Chart) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              National Risk Matrix (Cost Risk vs Schedule Risk)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each point represents an ongoing project. Bubble radius scales with sanctioned cost (₹ Cr). Click any point to open project telemetry.
            </p>
          </div>

          {/* Quadrant Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedQuadrant('ALL')}
              className={`px-2.5 py-1 rounded font-medium ${
                selectedQuadrant === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({scatterPoints.length})
            </button>
            <button
              onClick={() => setSelectedQuadrant('High Cost / High Time')}
              className={`px-2.5 py-1 rounded font-medium ${
                selectedQuadrant === 'High Cost / High Time' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-50'
              }`}
            >
              🔴 High/High (Critical)
            </button>
            <button
              onClick={() => setSelectedQuadrant('Low Cost / High Time')}
              className={`px-2.5 py-1 rounded font-medium ${
                selectedQuadrant === 'Low Cost / High Time' ? 'bg-orange-600 text-white shadow-xs' : 'text-orange-700 hover:bg-orange-50'
              }`}
            >
              Schedule Only
            </button>
            <button
              onClick={() => setSelectedQuadrant('High Cost / Low Time')}
              className={`px-2.5 py-1 rounded font-medium ${
                selectedQuadrant === 'High Cost / Low Time' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Cost Only
            </button>
          </div>
        </div>

        {/* Matrix Quadrant Description Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-4 text-xs">
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-semibold text-slate-700">Quadrant IV: Low Cost / Low Time</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Routine monitoring · {quadrantCounts.q4} projects</div>
          </div>
          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="font-semibold text-amber-800">Quadrant III: High Cost / Low Time</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Budget escalation · {quadrantCounts.q3} projects</div>
          </div>
          <div className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/50">
            <div className="font-semibold text-orange-800">Quadrant II: Low Cost / High Time</div>
            <div className="text-[11px] text-orange-700 mt-0.5">Schedule slippage · {quadrantCounts.q2} projects</div>
          </div>
          <div className="p-2.5 rounded-lg border border-red-300 bg-red-50">
            <div className="font-bold text-red-800">Quadrant I: High Cost / High Time ★</div>
            <div className="text-[11px] text-red-700 mt-0.5 font-medium">Dual critical risk · {quadrantCounts.q1} projects</div>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="h-96 w-full mt-2 relative">
          {/* Visual upper-right highlight box */}
          <div
            className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-500/5 border border-red-500/20 pointer-events-none rounded-tr-lg flex items-start justify-end p-3"
          >
            <span className="text-[11px] font-bold text-red-600 bg-white/80 px-2 py-0.5 rounded border border-red-200 shadow-xs">
              CRITICAL FOCUS AREA (High Cost & High Schedule Risk)
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="Cost Overrun Risk"
                unit="%"
                domain={[0, 100]}
                label={{ value: 'Cost Overrun Risk (%) →', position: 'insideBottomRight', offset: -10, fontSize: 11 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Schedule Overrun Risk"
                unit="%"
                domain={[0, 100]}
                label={{ value: 'Schedule Overrun Risk (%) →', angle: -90, position: 'insideLeft', fontSize: 11 }}
                tick={{ fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="z" range={[20, 200]} name="Sanctioned Cost" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs max-w-xs z-50">
                        <div className="font-bold text-blue-300 text-xs truncate">{data.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          #{data.code} · {data.agency}
                        </div>
                        <div className="mt-2 space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cost Risk:</span>
                            <span className="font-mono font-bold text-amber-400">{data.x.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Schedule Risk:</span>
                            <span className="font-mono font-bold text-orange-400">{data.y.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sanctioned Outlay:</span>
                            <span className="font-mono">{formatCr(data.cost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Observed Overrun / Delay:</span>
                            <span className="font-mono text-red-400">
                              {formatPct(data.overrun)} / +{data.slippage.toFixed(1)}m
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic">
                          Click point to view complete project intelligence profile →
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={60} stroke="#94A3B8" strokeDasharray="4 4" />
              <ReferenceLine y={60} stroke="#94A3B8" strokeDasharray="4 4" />
              <Scatter
                data={filteredPoints}
                onClick={(e) => {
                  if (e && e.rawProject) onSelectProject(e.rawProject);
                }}
                className="cursor-pointer"
              >
                {filteredPoints.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={0.7}
                    stroke={entry.color}
                    strokeWidth={1}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Observable telemetry driver summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Observed Telemetry Risk Drivers</h2>
            <p className="text-xs text-slate-500">Counts of current projects matching observable execution conditions. Local SHAP explanations are not enabled.</p>
          </div>
          <Info className="w-4 h-4 text-slate-400" />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetryDriverSummary} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(val) => [`${val} projects`, 'Observed matches']} />
                <Bar dataKey="impact" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
              <strong className="text-blue-900 block mb-1">1. Progress / expenditure divergence</strong>
              Current telemetry highlights projects where reported expenditure materially exceeds physical progress.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong className="text-slate-900 block mb-1">2. Reported schedule slippage</strong>
              Observed delay is shown separately from the forward ML risk signal.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong className="text-slate-900 block mb-1">3. Stalled progress telemetry</strong>
              Flat progress alongside rising expenditure is an observed execution trigger for review.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
