import React from 'react';
import { NavScreen, UserProfile } from '../types';

interface HeaderProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  user: UserProfile;
  selectedProject: string;
  onChangeProject: (project: string) => void;
  selectedSprint: string;
  onChangeSprint: (sprint: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  user,
  selectedProject,
  onChangeProject,
  selectedSprint,
  onChangeSprint,
  searchQuery,
  onSearchChange,
  collapsed,
}) => {
  const getScreenTitle = (screen: NavScreen) => {
    switch (screen) {
      case 'dashboard':
        return 'Dashboard';
      case 'progress-task':
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
      default:
        return 'Dashboard';
    }
  };

  return (
    <header
      className={`h-16 border-b border-[#eef2f6] bg-white/95 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40 transition-all duration-300 ${
        collapsed ? 'pl-[96px]' : 'pl-[260px]'
      }`}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px]">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-[#64748b] hover:text-[#0f172a] transition-colors"
        >
          Workspace
        </button>
        <span className="material-symbols-outlined text-[15px] text-[#94a3b8]">
          chevron_right
        </span>
        <span className="text-[#0f172a] font-semibold">
          {getScreenTitle(currentScreen)}
        </span>
      </div>

      {/* Right Controls: Project & Sprint Scope Unified Controls + User Profile */}
      <div className="flex items-center gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] rounded-lg px-2.5 py-1 text-xs shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] pr-1 border-r border-[#e2e8f0]">
            PROJECT
          </span>
          <select
            value={selectedProject}
            onChange={(e) => onChangeProject(e.target.value)}
            className="bg-transparent font-semibold text-[#0f172a] text-xs focus:outline-none cursor-pointer"
          >
            <option value="PMA Agent">PMA Agent</option>
            <option value="SCDM">SCDM</option>
            <option value="Auto Test">Auto Test</option>
          </select>
        </div>

        {/* Sprint Scope Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] rounded-lg px-2.5 py-1 text-xs shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] pr-1 border-r border-[#e2e8f0]">
            SPRINT SCOPE
          </span>
          <select
            value={selectedSprint}
            onChange={(e) => onChangeSprint(e.target.value)}
            className="bg-transparent font-semibold text-[#1877f2] text-xs focus:outline-none cursor-pointer"
          >
            <option value="All open sprints">All open sprints</option>
            <option value="Sprint 35">Sprint 35</option>
            <option value="Sprint 36">Sprint 36</option>
            <option value="Sprint 37">Sprint 37</option>
          </select>
        </div>

        <div className="h-5 w-px bg-[#e2e8f0] mx-0.5"></div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-semibold text-xs select-none shadow-xs">
            {user.initials}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-semibold text-[13px] text-[#0f172a] leading-tight group-hover:text-[#1877f2] transition-colors">
              {user.name}
            </span>
            <span className="text-[11px] text-[#94a3b8] leading-tight">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
