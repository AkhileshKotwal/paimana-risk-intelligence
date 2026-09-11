import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  BellRing,
  ExternalLink,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { getRiskBadge } from '../services/riskService';

export const EarlyWarningCenterView = ({ alerts = [], projects = [], onSelectProject }) => {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
      if (riskTypeFilter !== 'ALL' && a.risk_type !== riskTypeFilter) return false;
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        return (
          String(a.project_code).includes(q) ||
          a.project_name.toLowerCase().includes(q) ||
          a.agency.toLowerCase().includes(q) ||
          a.state.toLowerCase().includes(q) ||
          a.primary_trigger.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, severityFilter, riskTypeFilter, search]);

  const severityCounts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
      high: alerts.filter((a) => a.severity === 'HIGH').length,
      medium: alerts.filter((a) => a.severity === 'MEDIUM').length,
    };
  }, [alerts]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-600 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Early Warning & Intervention Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated deterministic anomaly detection and ML predictive early warnings for central infrastructure projects
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-red-100 text-red-800 border border-red-200 rounded-lg font-mono font-bold">
            {severityCounts.critical} Critical Alerts Requiring Immediate Action
          </span>
        </div>
      </div>

      {/* 4 Severity Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'CRITICAL'
              ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              🔴 Critical Severity
            </span>
            <span className="font-mono font-bold text-lg text-red-700">{severityCounts.critical}</span>
          </div>
          <p className="text-[11px] text-red-900 mt-2 font-medium">
            Immediate Executive Intervention
          </p>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Severe dual cost & time escalation, progress frozen &gt;3 reporting periods, or expenditure mismatch.
          </p>
        </div>

        <div
          onClick={() => setSeverityFilter('HIGH')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'HIGH'
              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              🟠 High Severity
            </span>
            <span className="font-mono font-bold text-lg text-orange-700">{severityCounts.high}</span>
          </div>
          <p className="text-[11px] text-orange-900 mt-2 font-medium">
            Senior Administrative Monitoring
          </p>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Slippage exceeds 12 months or cost revision &gt;25% without statutory milestone approval.
          </p>
        </div>

        <div
          onClick={() => setSeverityFilter('MEDIUM')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'MEDIUM'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              🟡 Medium Severity
            </span>
            <span className="font-mono font-bold text-lg text-amber-700">{severityCounts.medium}</span>
          </div>
          <p className="text-[11px] text-amber-900 mt-2 font-medium">
            Enhanced Field Monitoring
          </p>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Progress pace slower than historical average; early warning signs in monthly telemetry.
          </p>
        </div>

        <div
          onClick={() => setSeverityFilter('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'ALL'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" />
              All Monitored Alerts
            </span>
            <span className="font-mono font-bold text-lg text-slate-700">{severityCounts.all}</span>
          </div>
          <p className="text-[11px] text-slate-900 mt-2 font-medium">
            Complete Alert Portfolio
          </p>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Click to reset severity filter and view all active early-warning signals.
          </p>
        </div>
      </div>

      {/* Alert Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Filter alerts by project name, code, agency, or trigger description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Risk Type:</span>
          <select
            value={riskTypeFilter}
            onChange={(e) => setRiskTypeFilter(e.target.value)}
            className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="ALL">All Risk Types</option>
            <option value="Cost & Schedule Overrun">Cost & Schedule Overrun</option>
            <option value="Cost Escalation">Cost Escalation Only</option>
            <option value="Schedule Slippage">Schedule Slippage Only</option>
            <option value="Monitoring Required">General Monitoring</option>
          </select>
        </div>
      </div>

      {/* Priority Scoring Methodology Notice */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11px]">
          <strong className="text-blue-900">Prototype Attention-Priority Scoring Framework:</strong>{' '}
          Priority = (Overall Risk × 0.4) + (Cost Risk × 0.2) + (Time Risk × 0.2) + min(Sanctioned Cost / 1000, 10) + (Uncompleted Progress % × 0.1). Clearly labeled as a prototype decision-support formula to assist authorities in triaging interventions.
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const badge = getRiskBadge(alert.severity);

          return (
            <div
              key={alert.project_code}
              onClick={() => {
                const matched = projects.find((p) => p.project_code === alert.project_code);
                if (matched) onSelectProject(matched);
              }}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {alert.severity}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {alert.project_name}
                    </h2>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-blue-600 font-semibold">ID: #{alert.project_code}</span>
                      <span>·</span>
                      <span>{alert.agency}</span>
                      <span>·</span>
                      <span>{alert.sector}</span>
                      <span>·</span>
                      <span>{alert.state}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      Overall Risk: {alert.overall_risk_score.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Priority Rank: <span className="font-bold text-slate-800">{alert.priority_score}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              {/* Alert Details Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                  <div className="text-[10px] font-bold uppercase text-red-800 tracking-wider">
                    Deterministic Anomaly Trigger
                  </div>
                  <div className="text-slate-900 font-medium mt-1">
                    {alert.primary_trigger}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-1">
                    Telemetry: {alert.current_metric}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <div className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">
                    Recommended Decision-Support Action
                  </div>
                  <div className="text-slate-900 font-medium mt-1 leading-snug">
                    {alert.recommended_action}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Rule-based operational guidance · Last updated {alert.last_updated}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            No active early warning alerts match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
