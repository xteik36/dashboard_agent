import React from 'react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'progress-tasks', label: 'Progress Task', icon: 'checklist' },
    { id: 'risk-predictions', label: 'Risk Predictions', icon: 'warning' },
    { id: 'audit-docs', label: 'Audit Docs', icon: 'verified_user' },
    { id: 'functions', label: 'Functions', icon: 'hub' },
    { id: 'meetings-visits', label: 'Meetings & Visits', icon: 'groups' }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white z-50 flex flex-col justify-between border-r border-[#eef2f6] shadow-[0_1px_8px_rgba(15,23,42,0.035)] transition-all duration-300 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-[240px] lg:w-[260px]'
      }`}
    >
      <div className="flex flex-col">
        {/* Logo lockup */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`h-16 flex items-center border-b border-[#f1f5f9] text-left ${isCollapsed ? 'justify-center px-2' : 'px-5 gap-3'}`}
          aria-label="Open dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1877f2] to-[#2563eb] flex items-center justify-center text-white font-bold text-base select-none shadow-sm shadow-blue-500/20 shrink-0">
            P
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-bold text-[14px] text-[#0f172a] tracking-tight truncate">
                PMA Agent
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#94a3b8] tracking-wider truncate">
                WORKSPACE
              </span>
            </div>
          )}
        </button>

        {/* Section label */}
        {!isCollapsed && (
          <div className="px-5 pt-4 pb-2">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
              WORKSPACE
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 px-3 mt-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#eff6ff] text-[#1877f2] font-semibold shadow-xs'
                    : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom controls */}
      <div className="p-3 border-t border-[#f1f5f9] flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            currentTab === 'settings'
              ? 'bg-[#eff6ff] text-[#1877f2] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">settings</span>
          {!isCollapsed && <span>Settings</span>}
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f8fafc] text-[12px] font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0">
            {isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
          </span>
          {!isCollapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
