import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FunctionsView } from './components/FunctionsView';
import { MeetingsView } from './components/MeetingsView';
import { AuditDocsView } from './components/AuditDocsView';
import { ProgressTasksView } from './components/ProgressTasksView';
import { RiskPredictionsView } from './components/RiskPredictionsView';
import { SettingsView } from './components/SettingsView';
import { ScheduleMeetingModal } from './components/modals/ScheduleMeetingModal';
import { NewFunctionModal } from './components/modals/NewFunctionModal';
import { UploadAuditDocModal } from './components/modals/UploadAuditDocModal';
import { FullLogModal } from './components/modals/FullLogModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import {
  AgentFunction,
  AuditDocument,
  MeetingItem,
  NavigationTab,
  RiskMatrixItem,
  TaskItem
} from './types';
import {
  INITIAL_AUDIT_DOCS,
  INITIAL_FUNCTIONS,
  INITIAL_MEETINGS,
  INITIAL_RISKS,
  INITIAL_TASKS,
  LIVE_SELECTED_SPRINT,
  SPRINT_DATA
} from '@/data/appData';

const ALL_OPEN_SPRINTS = 'All Open Sprints';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState('PMA Agent');
  const [selectedSprint, setSelectedSprint] = useState(LIVE_SELECTED_SPRINT);

  // Application Data States
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [functions, setFunctions] = useState<AgentFunction[]>(INITIAL_FUNCTIONS);
  const [meetings, setMeetings] = useState<MeetingItem[]>(INITIAL_MEETINGS);
  const [auditDocs, setAuditDocs] = useState<AuditDocument[]>(INITIAL_AUDIT_DOCS);
  const [risks] = useState<RiskMatrixItem[]>(INITIAL_RISKS);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isNewFunctionModalOpen, setIsNewFunctionModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false);
  const [selectedLogFunction, setSelectedLogFunction] = useState<AgentFunction | null>(null);

  // Task Toggle Status
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
          return {
            ...t,
            status: nextStatus,
            completed: nextStatus === 'Completed',
            progress: nextStatus === 'Completed' ? 100 : 50
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  // Add Meeting
  const handleAddMeeting = (newMeeting: MeetingItem) => {
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  // Add Agent Function
  const handleAddFunction = (newFn: AgentFunction) => {
    setFunctions((prev) => [newFn, ...prev]);
  };

  // Add Audit Document
  const handleAddAuditDoc = (newDoc: AuditDocument) => {
    setAuditDocs((prev) => [newDoc, ...prev]);
  };

  // Toggle Audit Document Status
  const handleToggleDocStatus = (docId: string, newStatus: AuditDocument['pmReviewStatus']) => {
    setAuditDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, pmReviewStatus: newStatus } : doc))
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex font-sans selection:bg-[#1877f2]/10 selection:text-[#1877f2]">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Layout Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-[72px]' : 'pl-[240px] lg:pl-[260px]'
        }`}
      >
        {/* Top Header Bar */}
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          selectedSprint={selectedSprint}
          onSelectSprint={setSelectedSprint}
          sprintOptions={[ALL_OPEN_SPRINTS, ...Object.keys(SPRINT_DATA)]}
        />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-page-in">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              tasks={tasks}
              risks={risks}
              auditDocs={auditDocs}
              selectedSprint={selectedSprint}
              onSelectSprint={setSelectedSprint}
              onOpenRiskModal={() => setCurrentTab('risk-predictions')}
              onToggleTaskComplete={handleToggleTask}
              onUpdateTask={handleUpdateTask}
              onToggleAuditDocStatus={handleToggleDocStatus}
            />
          )}

          {currentTab === 'functions' && (
            <FunctionsView
              functions={functions}
              onAddFunction={() => setIsNewFunctionModalOpen(true)}
              onViewLogs={(fn) => setSelectedLogFunction(fn)}
            />
          )}

          {currentTab === 'meetings-visits' && (
            <MeetingsView
              meetings={meetings}
              onScheduleMeeting={() => setIsScheduleModalOpen(true)}
            />
          )}

          {currentTab === 'audit-docs' && (
            <AuditDocsView
              documents={auditDocs}
              onUploadDoc={() => setIsUploadDocModalOpen(true)}
              onExportReport={() => setIsExportReportModalOpen(true)}
              onToggleStatus={handleToggleDocStatus}
            />
          )}

          {currentTab === 'progress-tasks' && (
            <ProgressTasksView
              tasks={tasks}
              risks={risks}
              selectedSprint={selectedSprint}
              onSelectSprint={setSelectedSprint}
              onToggleTask={handleToggleTask}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {currentTab === 'risk-predictions' && (
            <RiskPredictionsView
              risks={risks}
              tasks={tasks}
              selectedSprint={selectedSprint}
              onSelectSprint={setSelectedSprint}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* 3. Global Modals */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onAddMeeting={handleAddMeeting}
      />

      <NewFunctionModal
        isOpen={isNewFunctionModalOpen}
        onClose={() => setIsNewFunctionModalOpen(false)}
        onAddFunction={handleAddFunction}
      />

      <UploadAuditDocModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        onAddDoc={handleAddAuditDoc}
      />

      <FullLogModal
        isOpen={!!selectedLogFunction}
        onClose={() => setSelectedLogFunction(null)}
        func={selectedLogFunction}
      />

      <ExportReportModal
        isOpen={isExportReportModalOpen}
        onClose={() => setIsExportReportModalOpen(false)}
        documents={auditDocs}
      />
    </div>
  );
}

export default App;
