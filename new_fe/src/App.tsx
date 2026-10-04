/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavScreen, SprintInfo, TaskItem } from './types';
import { CURRENT_USER, getTaskItemById, INITIAL_ALL_TASKS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProgressTaskView } from './components/ProgressTaskView';
import { RiskPredictionsView } from './components/RiskPredictionsView';
import { AuditDocsView } from './components/AuditDocsView';
import { FunctionsView } from './components/FunctionsView';
import { MeetingsVisitsView } from './components/MeetingsVisitsView';
import { SettingsView } from './components/SettingsView';
import {
  CriticalRiskModal,
  AuditPendingModal,
  SprintDetailModal,
} from './components/Modals';
import { TaskDetailModal } from './components/TaskDetailModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>('PMA Agent');
  const [selectedSprint, setSelectedSprint] = useState<string>('All open sprints');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Centralized Tasks State shared across Progress Task and Dashboard Overview
  const [taskList, setTaskList] = useState<TaskItem[]>(INITIAL_ALL_TASKS);

  // Selected task for Progress Task drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string>('TSK-1048');

  // Modals state
  const [isCriticalRiskOpen, setIsCriticalRiskOpen] = useState<boolean>(false);
  const [isAuditPendingOpen, setIsAuditPendingOpen] = useState<boolean>(false);
  const [selectedSprintModal, setSelectedSprintModal] = useState<SprintInfo | null>(null);

  // Task Detail Modal state (for Critical Risk drill-down & Open Sprints Action View)
  const [selectedTaskItemForModal, setSelectedTaskItemForModal] = useState<TaskItem | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState<boolean>(false);
  const [openedFromCriticalRisks, setOpenedFromCriticalRisks] = useState<boolean>(false);

  const handleNavigate = (screen: NavScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTaskFromAnywhere = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCurrentScreen('progress-task');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTaskDetailModal = (taskId: string, fromCritical: boolean = false) => {
    const item = taskList.find((t) => t.id === taskId) || getTaskItemById(taskId);
    setSelectedTaskItemForModal(item);
    setOpenedFromCriticalRisks(fromCritical);
    if (fromCritical) {
      setIsCriticalRiskOpen(false);
    }
    setIsTaskDetailOpen(true);
  };

  const handleUpdateTaskItem = (updated: TaskItem) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    if (selectedTaskItemForModal?.id === updated.id) {
      setSelectedTaskItemForModal(updated);
    }
  };

  const handleOpenSprintDetail = (sprint: SprintInfo) => {
    setSelectedSprintModal(sprint);
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0f172a] flex flex-col font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'pl-[72px]' : 'pl-[240px]'
        }`}
      >
        {/* Top Header */}
        <Header
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          user={CURRENT_USER}
          selectedProject={selectedProject}
          onChangeProject={setSelectedProject}
          selectedSprint={selectedSprint}
          onChangeSprint={setSelectedSprint}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          collapsed={collapsed}
        />

        {/* Main Content Body */}
        <main className="p-6 lg:p-8 max-w-[1520px] w-full mx-auto flex-1">
          {currentScreen === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenCriticalRisk={() => setIsCriticalRiskOpen(true)}
              onOpenAuditPending={() => setIsAuditPendingOpen(true)}
              onOpenSprintDetail={handleOpenSprintDetail}
              onSelectTask={handleSelectTaskFromAnywhere}
              onOpenTaskDetail={(taskId) => handleOpenTaskDetailModal(taskId, false)}
              selectedProject={selectedProject}
              onChangeProject={setSelectedProject}
              selectedSprint={selectedSprint}
              onChangeSprint={setSelectedSprint}
              tasks={taskList}
            />
          )}

          {currentScreen === 'progress-task' && (
            <ProgressTaskView
              selectedTaskId={selectedTaskId}
              onSelectTask={(id) => setSelectedTaskId(id)}
              tasks={taskList}
              onUpdateTask={handleUpdateTaskItem}
            />
          )}

          {currentScreen === 'risk-predictions' && <RiskPredictionsView />}

          {currentScreen === 'audit-docs' && <AuditDocsView />}

          {currentScreen === 'functions' && <FunctionsView />}

          {currentScreen === 'meetings-visits' && <MeetingsVisitsView />}

          {currentScreen === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <CriticalRiskModal
        isOpen={isCriticalRiskOpen}
        onClose={() => setIsCriticalRiskOpen(false)}
        onSelectTask={handleSelectTaskFromAnywhere}
        onOpenTaskDetail={(taskId) => handleOpenTaskDetailModal(taskId, true)}
      />

      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        task={selectedTaskItemForModal}
        onClose={() => setIsTaskDetailOpen(false)}
        onBackToCriticalRisks={
          openedFromCriticalRisks
            ? () => {
                setIsTaskDetailOpen(false);
                setIsCriticalRiskOpen(true);
              }
            : undefined
        }
        onUpdateTask={(updated) => setSelectedTaskItemForModal(updated)}
      />

      <AuditPendingModal
        isOpen={isAuditPendingOpen}
        onClose={() => setIsAuditPendingOpen(false)}
        onNavigateAudit={() => handleNavigate('audit-docs')}
      />

      <SprintDetailModal
        sprint={selectedSprintModal}
        isOpen={!!selectedSprintModal}
        onClose={() => setSelectedSprintModal(null)}
        onOpenProgressTask={(sprintName) => {
          setSelectedSprint(sprintName);
          handleNavigate('progress-task');
        }}
      />
    </div>
  );
}
