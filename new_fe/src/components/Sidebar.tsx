import React from 'react';
import { NavScreen } from '../types';

interface SidebarProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavScreen,
      label: 'Dashboard',
      icon: 'grid_view',
    },
    {
      id: 'progress-task' as NavScreen,
      label: 'Progress Task',
      icon: 'checklist',
    },
    {
      id: 'risk-predictions' as NavScreen,
      label: 'Risk Predictions',
      icon: 'warning',
    },
    {
      id: 'audit-docs' as NavScreen,
      label: 'Audit Docs',
      icon: 'verified_user',
    },
    {
      id: 'functions' as NavScreen,
      label: 'Functions',
      icon: 'hub',
    },
    {
      id: 'meetings-visits' as NavScreen,
      label: 'Meetings & Visits',
      icon: 'groups',
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white z-50 flex flex-col justify-between border-r border-[#eef2f6] transition-all duration-300 select-none shadow-[0_1px_8px_rgba(0,0,0,0.03)] ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      <div className="flex flex-col">
        {/* Workspace Brand Logo */}
        <div
          className={`h-16 flex items-center border-b border-[#f1f5f9] cursor-pointer ${
            collapsed ? 'justify-center px-2' : 'px-5 gap-3'
          }`}
          onClick={() => onNavigate('dashboard')}
          title="PMA Agent Workspace"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1877f2] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-blue-500/25 shrink-0">
            P
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-[14px] text-[#0f172a] tracking-tight truncate">
                PMA Agent
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#94a3b8] tracking-wider truncate">
                WORKSPACE HUB
              </span>
            </div>
          )}
        </div>

        {/* Section Header */}
        {!collapsed && (
          <div className="px-5 pt-4 pb-2">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
              WORKSPACE
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-3 mt-2">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-[#eff6ff] text-[#1877f2] font-semibold shadow-xs'
                    : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 ${
                    isActive ? 'text-[#1877f2]' : 'text-[#64748b]'
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings & Collapse Toggle */}
      <div className="p-3 border-t border-[#f1f5f9] flex flex-col gap-1">
        <button
          onClick={() => onNavigate('settings')}
          title={collapsed ? 'Settings' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            collapsed ? 'justify-center' : ''
          } ${
            currentScreen === 'settings'
              ? 'bg-[#eff6ff] text-[#1877f2] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-[#64748b] shrink-0">
            settings
          </span>
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-[20px] text-[#94a3b8] shrink-0">
            {collapsed ? 'menu_open' : 'keyboard_double_arrow_left'}
          </span>
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
