import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Download
} from 'lucide-react';
import {
  filterAndSortProjects,
  paginate,
  getFilterOptions,
} from '../services/projectService';
import { formatCr, formatPct, getRiskBadge } from '../services/riskService';

export const ProjectMonitoringView = ({ projects = [], onSelectProject }) => {
  // Filter states
  const [search, setSearch] = useState('');
  const [riskBand, setRiskBand] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [state, setState] = useState('ALL');
  const [agency, setAgency] = useState('ALL');
  const [minCostRisk, setMinCostRisk] = useState(0);
  const [minTimeRisk, setMinTimeRisk] = useState(0);

  // Sorting state
  const [sortKey, setSortKey] = useState('priority_score');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filterOptions = useMemo(() => getFilterOptions(projects), [projects]);

  // Apply filters and sorting
  const filteredProjects = useMemo(() => {
    return filterAndSortProjects(
      projects,
      {
        search,
        riskBand,
        sector,
        state,
        agency,
        minCostRisk: Number(minCostRisk),
        minTimeRisk: Number(minTimeRisk),
      },
      { key: sortKey, direction: sortDir }
    );
  }, [projects, search, riskBand, sector, state, agency, minCostRisk, minTimeRisk, sortKey, sortDir]);

  // Paginated records
  const pagination = useMemo(() => {
    return paginate(filteredProjects, page, pageSize);
  }, [filteredProjects, page, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setRiskBand('ALL');
    setSector('ALL');
    setState('ALL');
    setAgency('ALL');
    setMinCostRisk(0);
    setMinTimeRisk(0);
    setSortKey('priority_score');
    setSortDir('desc');
    setPage(1);
  };

  // Export filtered CSV
  const handleExportCSV = () => {
    if (!filteredProjects.length) return;
    const headers = [
      'Project Code',
      'Project Name',
      'Agency',
      'Ministry',
      'Sector',
      'State',
      'Original Cost (Cr)',
      'Revised Cost (Cr)',
      'Cost Overrun %',
      'Schedule Slippage (Months)',
      'Physical Progress %',
      'Cost Risk %',
      'Time Risk %',
      'Overall Risk %',
      'Risk Band',
      'Priority Score'
    ];
    const rows = filteredProjects.map((p) => [
      p.project_code,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      `"${(p.agency || '').replace(/"/g, '""')}"`,
      `"${(p.ministry || '').replace(/"/g, '""')}"`,
      `"${(p.sector || '').replace(/"/g, '""')}"`,
      `"${(p.state || '').replace(/"/g, '""')}"`,
      p.original_cost_cr,
      p.revised_cost_cr,
      p.cost_overrun_pct,
      p.schedule_slippage_months,
      p.physical_progress_pct,
      p.cost_risk_score,
      p.time_risk_score,
      p.overall_risk_score,
      p.risk_band,
      p.priority_score
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paimana_projects_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Central Infrastructure Project Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable registry of all {projects.length.toLocaleString()} ongoing central projects ₹150 Cr and above with validated predictive risk scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered ({filteredProjects.length})</span>
          </button>
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Row 1: Search & Primary Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, ID, agency, state, sector..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Risk Band */}
          <div>
            <select
              value={riskBand}
              onChange={(e) => {
                setRiskBand(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">🔴 Critical Risk Only</option>
              <option value="HIGH">🟠 High Risk</option>
              <option value="MEDIUM">🟡 Medium Risk</option>
              <option value="LOW">🟢 Low Risk</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Sectors ({filterOptions.sectors.length})</option>
              {filterOptions.sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All States / UTs ({filterOptions.states.length})</option>
              {filterOptions.states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Agency */}
          <div className="sm:col-span-2">
            <select
              value={agency}
              onChange={(e) => {
                setAgency(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Implementing Agencies ({filterOptions.agencies.length})</option>
              {filterOptions.agencies.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>

          {/* Min Cost Risk */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap text-[11px]">Min Cost Risk:</span>
            <select
              value={minCostRisk}
              onChange={(e) => {
                setMinCostRisk(Number(e.target.value));
                setPage(1);
              }}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 w-full"
            >
              <option value="0">Any</option>
              <option value="50">≥ 50%</option>
              <option value="75">≥ 75%</option>
              <option value="90">≥ 90%</option>
            </select>
          </div>

          {/* Min Schedule Risk */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap text-[11px]">Min Time Risk:</span>
            <select
              value={minTimeRisk}
              onChange={(e) => {
                setMinTimeRisk(Number(e.target.value));
                setPage(1);
              }}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 w-full"
            >
              <option value="0">Any</option>
              <option value="50">≥ 50%</option>
              <option value="75">≥ 75%</option>
              <option value="90">≥ 90%</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center justify-end gap-2 sm:col-span-2">
            <span className="text-slate-500 text-[11px]">Records per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
            >
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-semibold text-slate-900">{pagination.startIndex}</span> to{' '}
          <span className="font-semibold text-slate-900">{pagination.endIndex}</span> of{' '}
          <span className="font-semibold text-slate-900">{filteredProjects.length.toLocaleString()}</span> filtered projects
          {filteredProjects.length !== projects.length && (
            <span> (filtered from {projects.length.toLocaleString()} total)</span>
          )}
        </div>
        <div>
          Tip: Click on any project row to inspect its detailed risk profile, four-month telemetry history, and evidence-based drivers.
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th
                  onClick={() => handleSort('project_code')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('project_name')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 min-w-[240px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Project Name & Implementing Agency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('state')}
                  className="py-3 px-2 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>State</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sector')}
                  className="py-3 px-2 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Sector</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('original_cost_cr')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Sanctioned</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cost_overrun_pct')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost Overrun</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('schedule_slippage_months')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Slippage</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('physical_progress_pct')}
                  className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Progress</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('overall_risk_score')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Overall Risk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority_score')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.items.map((p) => {
                const badge = getRiskBadge(p.risk_band);

                return (
                  <tr
                    key={p.project_code}
                    onClick={() => onSelectProject(p)}
                    className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                  >
                    {/* Code */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 group-hover:text-blue-700 font-semibold whitespace-nowrap">
                      {p.project_code}
                    </td>

                    {/* Name & Agency */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-900 group-hover:text-blue-700 line-clamp-1">
                        {p.project_name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {p.agency}
                      </div>
                    </td>

                    {/* State */}
                    <td className="py-2.5 px-2 text-slate-700 max-w-[120px] truncate text-[11px]">
                      {p.state}
                    </td>

                    {/* Sector */}
                    <td className="py-2.5 px-2 text-slate-600 max-w-[120px] truncate text-[11px]">
                      {p.sector}
                    </td>

                    {/* Sanctioned Cost */}
                    <td className="py-2.5 px-2 text-right font-mono text-slate-800 whitespace-nowrap">
                      {formatCr(p.original_cost_cr)}
                    </td>

                    {/* Cost Overrun */}
                    <td className="py-2.5 px-2 text-right font-mono whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          p.cost_overrun_pct > 20
                            ? 'text-red-600'
                            : p.cost_overrun_pct > 0
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {formatPct(p.cost_overrun_pct)}
                      </span>
                    </td>

                    {/* Slippage */}
                    <td className="py-2.5 px-2 text-right font-mono whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          p.schedule_slippage_months > 12
                            ? 'text-red-600'
                            : p.schedule_slippage_months > 0
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {p.schedule_slippage_months > 0 ? `+${p.schedule_slippage_months.toFixed(1)}m` : '0m'}
                      </span>
                    </td>

                    {/* Physical Progress */}
                    <td className="py-2.5 px-2 text-right font-mono text-slate-800 whitespace-nowrap">
                      {p.physical_progress_pct != null ? `${p.physical_progress_pct.toFixed(0)}%` : '—'}
                    </td>

                    {/* Overall Risk */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        <span className="font-mono font-bold text-slate-900">
                          {p.overall_risk_score.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Priority Tier */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.shortLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {pagination.items.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    No projects found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Page <span className="font-semibold text-slate-900">{pagination.currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={pagination.currentPage === 1}
              className="px-2 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 font-medium"
            >
              First
            </button>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.currentPage === 1}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-semibold text-slate-800 bg-white border border-slate-300 rounded">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-2 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 font-medium"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
