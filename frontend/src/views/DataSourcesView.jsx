import React from 'react';
import {
  Database,
  CheckCircle2,
  FileCheck,
  Calendar,
  Layers,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const DataSourcesView = ({ dataQuality }) => {
  const fields = [
    { name: "project_code", type: "Integer (Primary Key)", source: "Official Table 6 Header", desc: "Unique numeric identifier for the central infrastructure project." },
    { name: "project_name", type: "Text String", source: "Official Table 6 Header", desc: "Sanctioned title of the infrastructure works / package." },
    { name: "agency", type: "Categorical", source: "Official Table 6 Header", desc: "Public Sector Undertaking (PSU) or central executing authority." },
    { name: "ministry", type: "Categorical", source: "Section Subheader", desc: "Nodal central ministry with administrative oversight." },
    { name: "sector", type: "Categorical", source: "Table 6 Sector Hierarchy", desc: "Infrastructure sector (Roads, Railways, Power, Water, etc.)." },
    { name: "state", type: "Categorical", source: "Official Table 6 Column", desc: "State jurisdiction or Multi-State designation." },
    { name: "date_of_approval", type: "Date (MM/YYYY)", source: "Column 2 (Top)", desc: "Original cabinet / empowered committee sanction date." },
    { name: "start_date", type: "Date (MM/YYYY)", source: "Column 2 (Bottom)", desc: "Formal groundwork commencement date." },
    { name: "target_doc", type: "Date (MM/YYYY)", source: "Column 3 (Top)", desc: "Sanctioned Date of Commissioning (Target DoC)." },
    { name: "revised_doc", type: "Date (MM/YYYY)", source: "Column 3 (Bottom)", desc: "Revised Date of Commissioning if formally amended." },
    { name: "original_cost_cr", type: "Numeric (₹ Cr)", source: "Column 4 (Top)", desc: "Initial sanctioned capital outlay." },
    { name: "revised_cost_cr", type: "Numeric (₹ Cr)", source: "Column 4 (Bottom)", desc: "Revised sanctioned outlay or latest estimate." },
    { name: "cumulative_expenditure_cr", type: "Numeric (₹ Cr)", source: "Column 5", desc: "Total disbursed expenditure reported to MoSPI to date." },
    { name: "physical_progress_pct", type: "Numeric (0–100%)", source: "Column 6", desc: "Certified physical execution percentage reported by project authority." },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Sources & Institutional Quality Indicators
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded directly in MoSPI official flash reports; zero synthetic or fabricated telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-mono font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Verified Telemetry Source
          </span>
        </div>
      </div>

      {/* Quality Indicators Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Telemetry Records</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {dataQuality.records_processed.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Monthly project snapshots</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Unique Central Projects</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {dataQuality.unique_projects.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">₹150 Cr and above threshold</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Reporting Snapshots</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">4 Months</span>
          <span className="text-[11px] text-slate-500 mt-1 block">April 2026 – July 2026</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Reporting Coverage</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">100.0%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Of active central projects</span>
        </div>
      </div>

      {/* Primary Data Source Documentation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          Primary Official Telemetry Source
        </h2>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>Official Publication:</strong> Government of India, Ministry of Statistics and Programme Implementation (MoSPI), Infrastructure and Project Monitoring Division (IPMD).
          </p>
          <p>
            <strong>Report Title:</strong> <em>Monthly Flash Report on Central Sector Projects Costing ₹150 Crore and Above</em>, Table 6: <em>All Ongoing Projects</em>.
          </p>
          <p>
            <strong>Statutory Mandate:</strong> In accordance with Cabinet Secretariat guidelines, all central executing agencies submit monthly project progress reports through the Online Computerized Monitoring System (OCMS / PAIMANA).
          </p>
          <p>
            <strong>Snapshot Range Processed:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>April 2026 (1,981 projects recorded)</li>
            <li>May 2026 (1,987 projects recorded)</li>
            <li>June 2026 (1,847 projects recorded)</li>
            <li>July 2026 (1,775 projects actively monitored)</li>
          </ul>
        </div>
      </div>

      {/* Schema Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          PAIMANA Flash Report Ingestion Schema (Table 6 Specifications)
        </h2>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Field Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Source Mapping</th>
                <th className="py-2.5 px-3">Field Description & Operational Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((f) => (
                <tr key={f.name} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{f.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{f.type}</td>
                  <td className="py-2.5 px-3 text-slate-700">{f.source}</td>
                  <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Governance & Quality Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Data Quality Controls & Censorship Handling
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 pt-2">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <strong className="text-slate-900 block font-semibold">1. Handling of Censored Schedule Labels</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              In standard PAIMANA reports, projects whose target completion date has lapsed without a newly approved revised DoC are sometimes left blank. If treated naively, models might categorize them as "on time." Our pipeline explicitly detects and isolates these censored records.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <strong className="text-slate-900 block font-semibold">2. Groundwork Commencement Distinction</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Planned duration is strictly evaluated as (Target DoC − Start Date), with the gestation delay (Approval to Groundwork) modeled separately as an independent risk driver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
