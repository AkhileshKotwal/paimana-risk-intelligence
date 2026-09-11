import React, { useState } from 'react';
import {
  X,
  Play,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink,
  Target,
  Clock,
  Coins,
  Sparkles
} from 'lucide-react';
import { formatCr, formatPct } from '../services/riskService';

export const DemoModal = ({ isOpen, onClose, onSelectProject, onSelectTab, demoProjects = [] }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "The Problem & Scale: Central Infrastructure Portfolio",
      badge: "Command Center Overview",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            Across India, the central government monitors <strong>1,775 major infrastructure projects</strong> costing ₹150 Crore and above, representing over <strong>₹31 Lakh Crore</strong> in sanctioned capital investment.
          </p>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <span className="text-[10px] text-red-600 uppercase font-semibold block">Schedule Slippage Rate</span>
              <span className="text-xl font-bold font-mono text-red-700">64.2%</span>
              <span className="text-[10px] text-slate-500">of ongoing projects</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <span className="text-[10px] text-amber-600 uppercase font-semibold block">Cost Escalation Outlay</span>
              <span className="text-xl font-bold font-mono text-amber-700">+₹4.8 Lakh Cr</span>
              <span className="text-[10px] text-slate-500">cumulative overrun</span>
            </div>
          </div>
          <p>
            <strong>The Core Dilemma:</strong> Existing reporting systems like PAIMANA/OCMS operate as retrospective monitoring logs—they record overruns after they have already occurred.
          </p>
        </div>
      ),
      actionText: "View Command Center",
      onAction: () => onSelectTab('overview')
    },
    {
      step: 2,
      title: "The PAIMANA Paradigm Shift: Predictive Early Warning",
      badge: "Core SIH Differentiator",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 font-medium leading-normal">
            "PAIMANA should not only tell authorities what has already gone wrong. It must identify projects showing early signs of cost and schedule risk to prioritize timely intervention."
          </div>
          <p>
            By synthesizing month-over-month telemetry across four consecutive reporting snapshots (April–July 2026), our machine learning models detect structural anomalies:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[11px]">
            <li><strong>Progress Stagnation:</strong> Physical works freeze while contractor disbursements continue.</li>
            <li><strong>Agency Historical Friction:</strong> Implementing authorities with systemic past slippage.</li>
            <li><strong>Dual-Vector Risk:</strong> Projects drifting into upper-right quadrant of both cost and schedule vulnerability.</li>
          </ul>
        </div>
      ),
      actionText: "Inspect Risk Intelligence",
      onAction: () => onSelectTab('risk-matrix')
    },
    {
      step: 3,
      title: "Showcase Case Study: Solan-Kaithlighat NH-5 (#619003)",
      badge: "Flagship High-Risk Project",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-bold text-red-900 text-xs">Solan - Kaithlighat Section of NH-22 (Now NH-5)</div>
            <div className="text-[11px] text-red-700 mt-0.5">Agency: NHAI · State: Himachal Pradesh · Cost: ₹1,519.5 Cr</div>
          </div>
          <p>
            <strong>The Anomaly Discovered:</strong> Across the 4 monthly cycles (April to July 2026), physical execution remained frozen at <strong>90.11%</strong>, while cumulative expenditure climbed from ₹652.0 Cr to ₹1,347.8 Cr (a 106% jump in cash disbursement with 0% certified physical progress).
          </p>
          <p>
            <strong>Schedule Slippage:</strong> Delayed by <strong>+66.0 Months</strong> (5.5 years overdue). The predictive engine flagged this at <strong>99.5% overall risk</strong> with deterministic recommendations for an immediate joint on-site physical measurement audit.
          </p>
        </div>
      ),
      actionText: "Open Solan-Kaithlighat Risk Profile",
      onAction: () => {
        const p = demoProjects.find((x) => x.project_code === 619003);
        if (p) {
          onSelectProject(p);
          onClose();
        }
      }
    },
    {
      step: 4,
      title: "Predictive Risk Matrix (Cost vs Schedule Quadrants)",
      badge: "Decision Support Visualization",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            Instead of sorting thousands of rows in an Excel sheet, executive authorities can inspect projects on a 2D interactive matrix:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-800 block">Quadrant IV: Low / Low</span>
              <span className="text-slate-500">Aligned with parameters</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded">
              <span className="font-semibold text-amber-800 block">Quadrant III: High Cost</span>
              <span className="text-slate-500">Expenditure review needed</span>
            </div>
            <div className="p-2.5 bg-orange-50 border border-orange-200 rounded">
              <span className="font-semibold text-orange-800 block">Quadrant II: High Time</span>
              <span className="text-slate-500">Right-of-way bottleneck</span>
            </div>
            <div className="p-2.5 bg-red-50 border border-red-200 rounded">
              <span className="font-bold text-red-800 block">Quadrant I: High / High ★</span>
              <span className="text-red-700">Immediate cabinet review</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Every point is clickable and opens the full project risk breakdown, 4-month historical trend, and nearest comparable project.
          </p>
        </div>
      ),
      actionText: "Explore 2D Risk Matrix",
      onAction: () => onSelectTab('risk-matrix')
    },
    {
      step: 5,
      title: "Early Warning Center: Actionable Intervention",
      badge: "Automated Triggers",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            Projects requiring attention are automatically triaged into four operational categories:
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span><strong>🔴 Critical:</strong> Immediate executive intervention (Dual risk &gt;80% or severe stalling).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0"></span>
              <span><strong>🟠 High:</strong> Senior administrative monitoring (Slippage &gt;12 months).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span><strong>🟡 Medium:</strong> Enhanced field milestone tracking.</span>
            </div>
          </div>
          <p>
            Crucially, every alert comes with <strong>deterministic recommendations</strong> (e.g., Revised Cost Estimate audit, inter-ministerial ROW committee, progressive disbursement pause) rather than generic LLM chatbot text.
          </p>
        </div>
      ),
      actionText: "Open Early Warning Center",
      onAction: () => onSelectTab('alerts')
    },
    {
      step: 6,
      title: "Institutional Rigor & Leakage-Safe Validation",
      badge: "Methodology & Transparency",
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            Unlike hackathon prototypes that claim unrealistic 99% accuracy on leaked test data, PAIMANA adheres to strict academic and institutional methodology:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
            <li><strong>Leakage Prevention:</strong> Agency and sector track records are calculated strictly from snapshots prior to prediction month.</li>
            <li><strong>Hold-Out Test Month:</strong> Evaluated on July 2026 snapshot (1,775 projects) having trained on April, May, June.</li>
            <li><strong>Validated Metrics:</strong> Cost Model ROC-AUC 95.2%, Time Model ROC-AUC 98.7%, F1 96.0%, well-calibrated Brier score 0.040.</li>
            <li><strong>Zero External APIs:</strong> Runs 100% locally without exposure of paid AI keys or security vulnerabilities.</li>
          </ul>
        </div>
      ),
      actionText: "View Full Methodology",
      onAction: () => onSelectTab('methodology')
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 font-mono">
              SIH 26103 · Prototype Guided Walkthrough ({currentStep + 1}/{steps.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono uppercase">
              {current.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Step 0{current.step} of 0{steps.length}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {current.title}
          </h3>

          <div className="pt-1">{current.content}</div>

          {/* Quick Jump Showcase Projects (on Step 3) */}
          {current.step === 3 && (
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Other High-Profile Showcase Projects:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {demoProjects.slice(1, 5).map((dp) => (
                  <button
                    key={dp.project_code}
                    onClick={() => {
                      onSelectProject(dp);
                      onClose();
                    }}
                    className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-slate-800 transition-colors truncate"
                  >
                    <div className="font-semibold truncate">{dp.project_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">#{dp.project_code} · {dp.agency}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 font-medium disabled:opacity-40 hover:bg-slate-100 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
              disabled={currentStep === steps.length - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 font-medium disabled:opacity-40 hover:bg-slate-100 flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              if (current.onAction) current.onAction();
              onClose();
            }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>{current.actionText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
