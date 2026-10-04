import React, { useState } from 'react';
import { NavigationTab } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedProject?: string;
  onSelectProject?: (project: string) => void;
  selectedSprint?: string;
  onSelectSprint?: (sprint: string) => void;
  sprintOptions?: string[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedProject = 'PMA Agent',
  onSelectProject,
  selectedSprint = 'All Open Sprints',
  onSelectSprint,
  sprintOptions = []
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const projectOptions = ['PMA Agent', 'Core Cloud Platform', 'ERP Integration'];

  const getTabLabel = (tab: NavigationTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'progress-tasks':
        return 'Progress Task';
      case 'risk-predictions':
        return 'Risk Predictions';
      case 'audit-docs':
        return 'Audit Docs';
      case 'functions':
        return 'Functions';
      case 'meetings-visits':
        return 'Meetings & Visits';
      case 'settings':
        return 'Settings';
    }
  };

  return (
    <header className="h-16 border-b border-[#eef2f6] bg-white/90 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40 transition-all">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px]">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors"
        >
          Workspace
        </button>
        <span className="material-symbols-outlined text-[15px] text-[#94a3b8] select-none">
          chevron_right
        </span>
        <span className="text-[#0f172a] font-semibold">
          {getTabLabel(currentTab)}
        </span>
      </div>

      {/* Right: Shared workspace filters and user profile */}
      <div className="flex items-center gap-3">
        {/* Project Selector */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg shadow-xs px-3 py-1.5 hover:bg-[#f8fafc] transition-colors cursor-pointer text-left"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
              Project
            </span>
            <div className="h-3.5 w-px bg-[#e2e8f0]"></div>
            <span className="text-[13px] font-semibold text-[#0f172a]">
              {selectedProject}
            </span>
            <span className="material-symbols-outlined text-[17px] text-[#94a3b8] ml-0.5">
              expand_more
            </span>
          </button>
          {showProjectMenu && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#edf2f7] rounded-xl shadow-lg p-1.5 z-50">
              {projectOptions.map((project) => (
                <button
                  key={project}
                  type="button"
                  onClick={() => {
                    onSelectProject?.(project);
                    setShowProjectMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                    selectedProject === project
                      ? 'bg-[#eff6ff] text-[#0f172a]'
                      : 'text-[#475569] hover:bg-[#f8fafc]'
                  }`}
                >
                  {project}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sprint Selector */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setShowSprintMenu(!showSprintMenu)}
            className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg shadow-xs px-3 py-1.5 hover:bg-[#f8fafc] transition-colors cursor-pointer text-left"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
              Sprint Scope
            </span>
            <div className="h-3.5 w-px bg-[#e2e8f0]"></div>
            <span className="text-[13px] font-semibold text-[#0f172a]">
              {selectedSprint}
            </span>
            <span className="material-symbols-outlined text-[17px] text-[#94a3b8] ml-0.5">
              expand_more
            </span>
          </button>
          {showSprintMenu && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#edf2f7] rounded-xl shadow-lg p-1.5 z-50 max-h-80 overflow-auto">
              {sprintOptions.map((sprint) => (
                <button
                  key={sprint}
                  type="button"
                  onClick={() => {
                    onSelectSprint?.(sprint);
                    setShowSprintMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                    selectedSprint === sprint
                      ? 'bg-[#eff6ff] text-[#0f172a]'
                      : 'text-[#475569] hover:bg-[#f8fafc]'
                  }`}
                >
                  {sprint}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-[#f8fafc] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-semibold text-xs select-none shadow-xs">
              JD
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-[13px] text-[#0f172a] leading-tight flex items-center gap-1">
                John Doe
                <span className="material-symbols-outlined text-[14px] text-[#94a3b8]">
                  expand_more
                </span>
              </span>
              <span className="text-[11px] text-[#94a3b8] leading-tight">PM</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#edf2f7] p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#f1f5f9]">
                <div className="font-bold text-[#0f172a]">John Doe</div>
                <div className="text-[11px] text-[#64748b]">john.doe@enterprise.com</div>
                <div className="inline-block mt-1 text-[10px] font-semibold bg-[#eff6ff] text-[#1877f2] px-1.5 py-0.5 rounded">
                  Lead Program Manager
                </div>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-[#f8fafc] rounded-md font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  Workspace Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('dashboard');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-[#f8fafc] rounded-md font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Portfolio Overview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
