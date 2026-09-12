import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Coins,
  CheckCircle2,
  Building2,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  BarChart2,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatCr, formatPct, getRiskBadge } from '../services/riskService';

export const OverviewView = ({ data, onSelectProject, onNavigateToMonitoring, onNavigateToAlerts }) => {
  const { kpi, sectors, states, alerts, projects } = data;

  // Portfolio Risk Distribution Data
  const riskDistData = [
    { name: 'Critical Risk', count: kpi.critical_risk_count, color: '#DC2626' },
    { name: 'High Risk', count: kpi.high_risk_count, color: '#EA580C' },
    { name: 'Medium Risk', count: kpi.medium_risk_count, color: '#D97706' },
    { name: 'Low Risk', count: kpi.low_risk_count, color: '#16A34A' },
  ];

  // Top 8 Sectors by Project Volume
  const topSectors = sectors.slice(0, 8);

  // Top 8 States by Project Volume
  const topStates = states.slice(0, 8);

  // Urgent Critical Alerts (Top 5)
  const urgentAlerts = alerts.filter((a) => a.severity === 'CRITICAL').slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Command Center Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Infrastructure Monitoring Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central Sector Projects (₹150 Cr and above) · MoSPI PAIMANA Flash Report Telemetry · {kpi.snapshot_month}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500">Sanctioned Portfolio: </span>
            <span className="font-semibold text-slate-800 font-mono">{formatCr(kpi.total_sanctioned_cr)}</span>
          </div>
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            <span className="text-red-600 font-medium">Cost Escalation: </span>
            <span className="font-bold font-mono">+{formatCr(kpi.total_cost_escalation_cr)}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{kpi.total_projects.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">ongoing</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Expenditure to Date:</span>
            <span className="font-mono font-medium">{formatCr(kpi.total_expenditure_cr)}</span>
          </div>
        </div>

        {/* Card 2: Projects at Risk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Projects at Risk</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600 font-mono">{kpi.projects_at_risk.toLocaleString()}</span>
            <span className="text-[11px] text-red-700 font-medium">
              ({((kpi.projects_at_risk / kpi.total_projects) * 100).toFixed(1)}% of portfolio)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Immediate Attention:</span>
            <span className="font-mono font-bold text-red-600">{kpi.critical_risk_count} Critical</span>
          </div>
        </div>

        {/* Card 3: Schedule Overrun Risk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule Overrun Risk</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600 font-mono">{kpi.schedule_risk_rate_pct}%</span>
            <span className="text-[11px] text-slate-500">threshold-exceedance rate</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Avg Schedule Slippage:</span>
            <span className="font-mono font-medium text-orange-600">+{kpi.avg_schedule_slippage_months} Months</span>
          </div>
        </div>

        {/* Card 4: Cost Overrun Risk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cost Overrun Risk</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono">{kpi.cost_risk_rate_pct}%</span>
            <span className="text-[11px] text-slate-500">threshold-exceedance rate</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Avg Cost Escalation:</span>
            <span className="font-mono font-medium text-amber-600">+{kpi.avg_cost_overrun_pct}%</span>
          </div>
        </div>
      </div>

      {/* Row 2: Portfolio Risk Distribution & Urgent Alerts Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">National Portfolio Risk Profile</h2>
              <p className="text-[11px] text-slate-500">Distribution across 4 validated risk tiers</p>
            </div>
            <span className="text-xs font-mono text-slate-400">1,775 Total</span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [
                    `${val.toLocaleString()} projects (${((val / kpi.total_projects) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
            {riskDistData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Urgent Alerts Callout */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold text-slate-900">Immediate Action Alerts (Critical Tier)</h2>
              </div>
              <button
                onClick={onNavigateToAlerts}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View all {alerts.length} alerts <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {urgentAlerts.map((alert) => (
                <div
                  key={alert.project_code}
                  className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                  onClick={() => {
                    const matched = projects.find((p) => p.project_code === alert.project_code);
                    if (matched) onSelectProject(matched);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase font-mono">
                        Critical Alert
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {alert.project_name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono text-blue-600">#{alert.project_code}</span>
                      <span>·</span>
                      <span>{alert.agency}</span>
                      <span>·</span>
                      <span>{alert.state}</span>
                    </div>
                    <p className="text-[11px] text-red-700 font-medium mt-1">
                      ⚠️ Trigger: {alert.primary_trigger}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-mono font-bold text-red-600">
                      {alert.overall_risk_score.toFixed(0)}% Risk
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Priority: {alert.priority_score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Early Warning Strategy:</span>
            <span>Deterministic triggers identify projects before catastrophic cost or time slippage lock-in.</span>
          </div>
        </div>
      </div>

      {/* Row 3: Sector Risk Breakdown & Ranked State Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Risk Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sector-Wise Project Volume & Risk</h2>
              <p className="text-[11px] text-slate-500">Major central infrastructure sectors ranked by project count</p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSectors} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="sector" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  formatter={(val, name) => [
                    val,
                    name === 'project_count' ? 'Total Projects' : 'High / Critical Risk Projects',
                  ]}
                />
                <Bar dataKey="project_count" name="Total Projects" fill="#94A3B8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="high_risk_count" name="High Risk Projects" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-400 inline-block" />
              <span>Total Sanctioned Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-600 inline-block" />
              <span>High / Critical Overrun Risk</span>
            </div>
          </div>
        </div>

        {/* State-wise Infrastructure Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">State-Wise Infrastructure Risk Ranking</h2>
              <p className="text-[11px] text-slate-500">Jurisdictional concentration of central ongoing projects</p>
            </div>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2 px-2">State / Region</th>
                  <th className="py-2 px-2 text-right">Projects</th>
                  <th className="py-2 px-2 text-right">Total Outlay</th>
                  <th className="py-2 px-2 text-right">At Risk</th>
                  <th className="py-2 px-2 text-right">Avg Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topStates.map((st) => (
                  <tr key={st.state} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium text-slate-900 truncate max-w-[140px]">
                      {st.state}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">{st.project_count}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">{formatCr(st.total_cost_cr)}</td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`font-mono font-semibold ${
                          st.risk_rate_pct >= 50 ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        {st.high_risk_count} ({st.risk_rate_pct}%)
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">
                      {st.avg_physical_progress_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onNavigateToMonitoring}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Open Full Monitoring Table <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
