import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DemoModal } from './components/DemoModal';
import { OverviewView } from './views/OverviewView';
import { ProjectMonitoringView } from './views/ProjectMonitoringView';
import { RiskIntelligenceView } from './views/RiskIntelligenceView';
import { EarlyWarningCenterView } from './views/EarlyWarningCenterView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { PortfolioAnalyticsView } from './views/PortfolioAnalyticsView';
import { MethodologyView } from './views/MethodologyView';
import { DataSourcesView } from './views/DataSourcesView';
import { getData } from './services/dataService';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const dataset = await getData();
        setData(dataset);
        // Default selected project to first flagship showcase project (e.g. Solan-Kaithlighat)
        if (dataset?.demo_projects?.length > 0) {
          setSelectedProject(dataset.demo_projects[0]);
        } else if (dataset?.projects?.length > 0) {
          setSelectedProject(dataset.projects[0]);
        }
      } catch (err) {
        console.error('Failed to initialize PAIMANA dataset:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('project-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 border border-blue-400 flex items-center justify-center font-mono text-xl font-bold animate-pulse">
          पै
        </div>
        <div className="text-center space-y-1">
          <div className="text-base font-bold tracking-tight">PAIMANA Early-Warning Prototype</div>
          <div className="text-xs text-slate-400 font-mono">
            Loading Central Infrastructure Registry & Telemetry Data...
          </div>
        </div>
      </div>
    );
  }

  const criticalAlertsCount = data.alerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      {/* Global Institutional Header */}
      <Header
        activeSnapshot={data.metadata.active_snapshot}
        totalProjects={data.kpi.total_projects}
        allProjects={data.projects}
        onSelectProject={handleSelectProject}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Workspace: Sidebar + Content View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          criticalAlertsCount={criticalAlertsCount}
          selectedProject={selectedProject}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewView
              data={data}
              onSelectProject={handleSelectProject}
              onNavigateToMonitoring={() => handleSelectTab('monitoring')}
              onNavigateToAlerts={() => handleSelectTab('alerts')}
            />
          )}

          {activeTab === 'monitoring' && (
            <ProjectMonitoringView
              projects={data.projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === 'risk-matrix' && (
            <RiskIntelligenceView
              projects={data.projects}
              onSelectProject={handleSelectProject}
              models={data.models}
            />
          )}

          {activeTab === 'alerts' && (
            <EarlyWarningCenterView
              alerts={data.alerts}
              projects={data.projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === 'project-detail' && (
            <ProjectDetailView
              project={selectedProject}
              onBack={() => handleSelectTab('monitoring')}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === 'analytics' && (
            <PortfolioAnalyticsView
              sectors={data.sectors}
              agencies={data.agencies}
              states={data.states}
              ministries={data.ministries}
            />
          )}

          {activeTab === 'methodology' && (
            <MethodologyView
              models={data.models}
              dataQuality={data.data_quality}
            />
          )}

          {activeTab === 'data-sources' && (
            <DataSourcesView
              dataQuality={data.data_quality}
            />
          )}
        </main>
      </div>

      {/* SIH Judge Guided Demo Walkthrough Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onSelectProject={handleSelectProject}
        onSelectTab={handleSelectTab}
        demoProjects={data.demo_projects}
      />
    </div>
  );
}
