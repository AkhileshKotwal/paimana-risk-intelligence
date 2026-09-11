import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  BookOpenCheck,
  Database,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, criticalAlertsCount, selectedProject }) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Command Center',
      sublabel: 'National Executive Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'monitoring',
      label: 'Project Monitoring',
      sublabel: 'Central Projects Database',
      icon: TableProperties,
    },
    {
      id: 'risk-matrix',
      label: 'Risk Intelligence',
      sublabel: 'Cost vs Schedule Matrix',
      icon: Activity,
    },
    {
      id: 'alerts',
      label: 'Early Warning Center',
      sublabel: 'Deterministic Intervention Alerts',
      icon: AlertTriangle,
      badge: criticalAlertsCount,
      badgeColor: 'bg-red-600 text-white',
    },
    {
      id: 'project-detail',
      label: 'Project Risk Profile',
      sublabel: selectedProject ? selectedProject.project_name.slice(0, 22) + '…' : 'Deep-Dive Project Telemetry',
      icon: FileSpreadsheet,
      highlight: !!selectedProject,
    },
    {
      id: 'analytics',
      label: 'Portfolio Analytics',
      sublabel: 'Sectors & Agency Performance',
      icon: BarChart3,
    },
    {
      id: 'methodology',
      label: 'Methodology & ML',
      sublabel: 'Leakage-Safe Validation',
      icon: BookOpenCheck,
    },
    {
      id: 'data-sources',
      label: 'Data Sources & Quality',
      sublabel: 'MoSPI Flash Reports & Audit',
      icon: Database,
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-85px)] shadow-md">
      <div className="py-4">
        {/* Navigation Category Label */}
        <div className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Decision Support Systems
        </div>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="leading-tight font-medium">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge != null && (
                  <span
                    className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Institutional footer */}
      <div className="p-4 border-t border-slate-800 bg-[#0A1120]/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Institutional Verification</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Predictive early-warning overlay built for Smart India Hackathon (SIH 26103). Official MoSPI data grounded.
        </p>
        <div className="pt-1 text-[9px] text-slate-400 font-mono flex items-center justify-between">
          <span>v2.4 Final Audit</span>
          <span className="text-emerald-400">Deterministic Engine</span>
        </div>
      </div>
    </aside>
  );
};
