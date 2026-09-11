import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  PieChart as PieIcon,
  Layers,
  MapPin,
  TrendingUp,
  Clock,
  Coins,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { formatCr, formatPct } from '../services/riskService';

export const PortfolioAnalyticsView = ({ sectors = [], agencies = [], states = [], ministries = [] }) => {
  const [agencySortKey, setAgencySortKey] = useState('project_count');
  const [agencySortDir, setAgencySortDir] = useState('desc');

  // Sorted agencies (filter agencies with at least 2 projects for meaningful aggregation)
  const sortedAgencies = [...agencies]
    .filter((a) => a.project_count >= 2)
    .sort((a, b) => {
      const valA = a[agencySortKey] || 0;
      const valB = b[agencySortKey] || 0;
      return agencySortDir === 'desc' ? valB - valA : valA - valB;
    })
    .slice(0, 20);

  const handleAgencySort = (key) => {
    if (agencySortKey === key) {
      setAgencySortDir(agencySortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setAgencySortKey(key);
      setAgencySortDir('desc');
    }
  };

  // Top 10 Sectors by Outlay
  const sectorsByOutlay = [...sectors]
    .sort((a, b) => b.total_cost_cr - a.total_cost_cr)
    .slice(0, 8);

  // Top 8 Ministries
  const topMinistries = ministries.slice(0, 8);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Portfolio & Agency Risk Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance analytics across Implementing Agencies, Nodal Ministries, and Infrastructure Sectors
          </p>
        </div>
      </div>

      {/* Agency Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Agency Risk Intelligence & Track Record Ranking
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top 20 implementing agencies ranked by portfolio size and risk concentration (leakage-safe historical metrics)
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Agencies Monitored: {agencies.length}
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th
                  onClick={() => handleAgencySort('agency')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Implementing Agency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('project_count')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Projects</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('total_cost_cr')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Outlay (₹ Cr)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('high_risk_count')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>High/Critical Risk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('risk_rate_pct')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Risk Rate %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('avg_cost_overrun_pct')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Cost Overrun</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('avg_schedule_slippage_months')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Slippage</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleAgencySort('avg_physical_progress_pct')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Progress</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAgencies.map((ag) => (
                <tr key={ag.agency} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                    {ag.agency}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">
                    {ag.project_count}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                    {formatCr(ag.total_cost_cr)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    <span className={`font-semibold ${ag.high_risk_count > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {ag.high_risk_count} ({ag.critical_count} 🔴)
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    <span className={`font-semibold ${ag.risk_rate_pct >= 50 ? 'text-red-600' : 'text-slate-700'}`}>
                      {ag.risk_rate_pct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    <span className={ag.avg_cost_overrun_pct > 15 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                      {formatPct(ag.avg_cost_overrun_pct)}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    <span className={ag.avg_schedule_slippage_months > 12 ? 'text-orange-600 font-semibold' : 'text-slate-600'}>
                      +{ag.avg_schedule_slippage_months}m
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    {ag.avg_physical_progress_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Sector Outlay vs Ministry Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Outlay Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Coins className="w-4 h-4 text-amber-600" />
            Capital Outlay Concentration by Sector (₹ Cr)
          </h2>

          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorsByOutlay} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="sector" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(val) => [formatCr(val), 'Total Sanctioned Outlay']} />
                <Bar dataKey="total_cost_cr" fill="#1E3E62" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nodal Ministry Comparative Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            Nodal Ministry Oversight Volume & Risk
          </h2>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5 px-2">Ministry</th>
                  <th className="py-2.5 px-2 text-right">Projects</th>
                  <th className="py-2.5 px-2 text-right">Outlay</th>
                  <th className="py-2.5 px-2 text-right">At Risk</th>
                  <th className="py-2.5 px-2 text-right">Avg Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topMinistries.map((m) => (
                  <tr key={m.ministry} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium text-slate-900 truncate max-w-[150px]">
                      {m.ministry}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">{m.project_count}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">{formatCr(m.total_cost_cr)}</td>
                    <td className="py-2 px-2 text-right font-mono">
                      <span className={m.risk_rate_pct >= 40 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                        {m.high_risk_count} ({m.risk_rate_pct}%)
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">
                      {m.avg_physical_progress_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
