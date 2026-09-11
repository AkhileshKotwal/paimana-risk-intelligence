import React, { useState } from 'react';
import { Search, PlayCircle, ShieldAlert, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export const Header = ({ onSearch, onSelectProject, onOpenDemo, activeSnapshot, totalProjects, allProjects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? allProjects
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            String(p.project_code).includes(q) ||
            p.project_name.toLowerCase().includes(q) ||
            p.agency.toLowerCase().includes(q) ||
            p.state.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSelect = (project) => {
    onSelectProject(project);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  return (
    <header className="bg-[#0B192C] text-white border-b border-slate-700 sticky top-0 z-40 shadow-sm">
      {/* Top institutional strip */}
      <div className="bg-[#07111F] px-4 py-1 text-xs text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Government of India
          </span>
          <span className="text-slate-600">|</span>
          <span>Ministry of Statistics & Programme Implementation (MoSPI)</span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-mono">SIH Problem Statement 26103</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 border border-slate-700">
            Active Snapshot: {activeSnapshot || 'July 2026'} ({totalProjects?.toLocaleString() || '1,775'} Projects)
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5 min-w-max">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-400/30 flex items-center justify-center shadow-inner">
            <span className="font-bold text-lg text-white font-mono tracking-tighter">पै</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                PAIMANA
              </span>
              <span className="bg-blue-900/60 text-blue-300 text-[10px] font-medium px-1.5 py-0.5 rounded border border-blue-500/30 tracking-wide uppercase">
                Early Warning System
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight max-w-sm">
              Predictive Infrastructure Monitoring & Decision Support Platform
            </p>
          </div>
        </div>

        {/* Global project search */}
        <div className="relative flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search by project name, ID (e.g. 619003), agency (NHAI, NTPC), or state..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quick search dropdown */}
          {dropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-md shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-1.5 bg-slate-800 text-[11px] font-medium text-slate-400 border-b border-slate-700">
                Matching Projects ({searchResults.length})
              </div>
              {searchResults.map((p) => (
                <button
                  key={p.project_code}
                  onClick={() => handleSelect(p)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800/80 border-b border-slate-800 last:border-none flex items-center justify-between transition-colors"
                >
                  <div className="pr-2 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{p.project_name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-blue-400">ID: {p.project_code}</span>
                      <span>·</span>
                      <span>{p.agency}</span>
                      <span>·</span>
                      <span>{p.state}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        p.risk_band === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : p.risk_band === 'HIGH'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800'
                          : p.risk_band === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {p.overall_risk_score.toFixed(0)}% Risk
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right action buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded text-xs font-semibold shadow-sm transition-all border border-blue-400/30"
          >
            <PlayCircle className="w-3.5 h-3.5 text-blue-200" />
            <span>SIH Judge Demo Tour (3 Min)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Print Executive Briefing"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Briefing</span>
          </button>
        </div>
      </div>
    </header>
  );
};
