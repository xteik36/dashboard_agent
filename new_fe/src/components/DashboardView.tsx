import React from 'react';
import { NavScreen, SprintInfo, TaskItem } from '../types';
import { SPRINT_LIST, ATTENTION_TASKS } from '../data/mockData';

interface DashboardViewProps {
  onNavigate: (screen: NavScreen) => void;
  onOpenCriticalRisk: () => void;
  onOpenAuditPending: () => void;
  onOpenSprintDetail: (sprint: SprintInfo) => void;
  onSelectTask: (taskId: string) => void;
  onOpenTaskDetail?: (taskId: string) => void;
  selectedProject?: string;
  onChangeProject?: (project: string) => void;
  selectedSprint?: string;
  onChangeSprint?: (sprint: string) => void;
  tasks?: TaskItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCriticalRisk,
  onOpenAuditPending,
  onOpenSprintDetail,
  onSelectTask,
  onOpenTaskDetail,
  tasks,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Good morning, John
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Here's what's happening across your portfolio today.
          </p>
        </div>
      </div>

      {/* 1. Top 3 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Sprint Health */}
        <div className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[22px]">vital_signs</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#475569]">
                  Sprint Health
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  On Track
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight">
              94.2%
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
            <span className="text-[#10b981] font-semibold flex items-center">
              ↑ +2.8%
            </span>
            <span>vs last sprint</span>
          </div>
        </div>

        {/* Card 2: Critical Risk (Modal Trigger) */}
        <div
          onClick={onOpenCriticalRisk}
          className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between cursor-pointer hover:border-red-200 hover:shadow-md transition-all group relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fff7ed] flex items-center justify-center text-[#f97316] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <span className="text-[13px] font-semibold text-[#475569]">
                Critical Risk
              </span>
            </div>
            <button
              aria-label="Open Critical Risk drill-down"
              className="w-7 h-7 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-red-50 flex items-center justify-center transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">north_east</span>
            </button>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight group-hover:text-[#ef4444] transition-colors">
              8
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#ef4444] font-semibold flex items-center">
              ↑ +2
            </span>
            <span className="text-[#64748b]">vs last sprint</span>
            <span className="ml-auto text-[11px] text-[#1877f2] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View details →
            </span>
          </div>
        </div>

        {/* Card 3: Audit Pending (Modal Trigger) */}
        <div
          onClick={onOpenAuditPending}
          className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between cursor-pointer hover:border-purple-200 hover:shadow-md transition-all group relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faf5ff] flex items-center justify-center text-[#9333ea] shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">description</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#475569]">
                  Audit Pending
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f3e8ff] text-[#7e22ce] w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></span>
                  Need PM Check
                </span>
              </div>
            </div>
            <button
              aria-label="Open Audit Pending drill-down"
              className="w-7 h-7 rounded-lg text-[#94a3b8] hover:text-[#9333ea] hover:bg-purple-50 flex items-center justify-center transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">north_east</span>
            </button>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight group-hover:text-[#9333ea] transition-colors">
              3
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#ef4444] font-semibold flex items-center">
              ↑ +1
            </span>
            <span className="text-[#64748b]">vs last sprint</span>
            <span className="ml-auto text-[11px] text-[#1877f2] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Review now →
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Sprint Delivery Trend & Risk Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sprint Delivery Trend */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#1877f2]">
                  trending_up
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">
                    Sprint Delivery Trend
                  </h2>
                  <p className="text-[12px] text-[#64748b]">
                    Task created vs. completed across sprints
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1877f2] bg-[#eff6ff] border border-blue-200 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2] animate-pulse"></span>
                <span>All open sprints</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-5 mt-3 mb-4 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#3b82f6]"></span>
                <span className="text-[#64748b]">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span>
                <span className="text-[#64748b]">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-[#64748b]">Completion Rate</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative w-full h-56 pt-2 pb-6">
              {/* Y-Axis Grid & Labels */}
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-right pr-2 text-[11px] text-[#94a3b8] select-none">
                <span>120</span>
                <span>90</span>
                <span>60</span>
                <span>30</span>
                <span>0</span>
              </div>
              <div className="absolute left-9 right-0 top-1 bottom-6 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-[#e2e8f0]"></div>
              </div>

              {/* SVG Line for Completion Rate across Open Sprints */}
              <svg
                className="absolute left-9 right-0 top-1 bottom-6 w-[calc(100%-36px)] h-[calc(100%-28px)] overflow-visible pointer-events-none z-10"
                preserveAspectRatio="none"
                viewBox="0 0 360 100"
              >
                <path
                  d="M 60 22 L 180 32 L 300 58"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                ></path>
                <circle cx="60" cy="22" fill="#8b5cf6" r="4.5" stroke="#ffffff" strokeWidth="2"></circle>
                <circle cx="180" cy="32" fill="#8b5cf6" r="4.5" stroke="#ffffff" strokeWidth="2"></circle>
                <circle cx="300" cy="58" fill="#8b5cf6" r="4.5" stroke="#ffffff" strokeWidth="2"></circle>
              </svg>

              {/* Bars container: All Open Sprints (Sprint 35, Sprint 36, Sprint 37) */}
              <div className="ml-9 w-full h-full flex items-end justify-around pb-6 pt-1">
                {/* Sprint 35 (Open - On Track) */}
                <div
                  className="flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                  title="Sprint 35: Created 86, Completed 67, Rate 78%"
                >
                  <span className="absolute top-[20px] text-[11px] font-bold text-[#8b5cf6] z-20 bg-white/90 px-1 rounded shadow-2xs">
                    78%
                  </span>
                  <div className="flex items-end gap-2 h-36">
                    <div
                      className="w-7 bg-[#3b82f6] rounded-t hover:brightness-105 transition-all relative group/bar"
                      style={{ height: '71.7%' }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-30 pointer-events-none">
                        Created: 86
                      </div>
                    </div>
                    <div
                      className="w-7 bg-[#10b981] rounded-t hover:brightness-105 transition-all relative group/bar"
                      style={{ height: '55.8%' }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-30 pointer-events-none">
                        Completed: 67
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center absolute -bottom-6">
                    <span className="text-[11px] font-semibold text-[#0f172a] whitespace-nowrap">
                      Sprint 35
                    </span>
                  </div>
                </div>

                {/* Sprint 36 (Open - At Risk) */}
                <div
                  className="flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                  title="Sprint 36: Created 102, Completed 69, Rate 68%"
                >
                  <span className="absolute top-[30px] text-[11px] font-bold text-[#8b5cf6] z-20 bg-white/90 px-1 rounded shadow-2xs">
                    68%
                  </span>
                  <div className="flex items-end gap-2 h-36">
                    <div
                      className="w-7 bg-[#3b82f6] rounded-t hover:brightness-105 transition-all relative group/bar"
                      style={{ height: '85%' }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-30 pointer-events-none">
                        Created: 102
                      </div>
                    </div>
                    <div
                      className="w-7 bg-[#10b981] rounded-t hover:brightness-105 transition-all relative group/bar"
                      style={{ height: '57.5%' }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-30 pointer-events-none">
                        Completed: 69
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center absolute -bottom-6">
                    <span className="text-[11px] font-semibold text-[#0f172a] whitespace-nowrap">
                      Sprint 36
                    </span>
                  </div>
                </div>

                {/* Sprint 37 (Open - Delay Risk) */}
                <div
                  className="flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                  title="Sprint 37: Created 74, Completed 31, Rate 42%"
                >
                  <span className="absolute top-[55px] text-[11px] font-bold text-[#8b5cf6] z-20 bg-white/90 px-1 rounded shadow-2xs">
                    42%
                  </span>
                  <div className="flex items-end gap-2 h-36">
                    <div
                      className="w-7 bg-[#3b82f6] rounded-t hover:brightness-105 transition-all relative group/bar"
                      style={{ height: '61.7%' }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-30 pointer-events-none">
                        Created: 74
                      </div>
                    </div>
                    <div
                      className="w-7 bg-[#10b981] rounded-t hover:brightness-105 transition-all relative group/bar"
                      style={{ height: '25.8%' }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-30 pointer-events-none">
                        Completed: 31
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center absolute -bottom-6">
                    <span className="text-[11px] font-semibold text-[#0f172a] whitespace-nowrap">
                      Sprint 37
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk Exposure Heatmap Matrix */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1877f2]">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a] leading-tight">
                    Risk Exposure
                  </h2>
                  <p className="text-[12px] text-[#64748b] mt-0.5">
                    Number of risks by impact and probability
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                  8 Critical Risks
                </span>
                <button
                  onClick={onOpenCriticalRisk}
                  className="text-[12px] text-[#1877f2] font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0"
                >
                  View all →
                </button>
              </div>
            </div>

            {/* Heatmap Matrix */}
            <div className="mt-6 pt-1 pb-2 flex flex-col items-center select-none">
              {/* Top Impact Header */}
              <div className="w-full flex items-center">
                <div className="w-20 shrink-0"></div>
                <div className="flex-1 text-center font-bold text-[10px] tracking-wider text-[#94a3b8] uppercase mb-2">
                  IMPACT
                </div>
              </div>
              {/* Column Subheaders */}
              <div className="w-full flex items-center mb-2">
                <div className="w-20 shrink-0"></div>
                <div className="flex-1 grid grid-cols-4 gap-2 text-center">
                  <span className="text-[11px] font-medium text-[#64748b]">Low</span>
                  <span className="text-[11px] font-medium text-[#64748b]">Medium</span>
                  <span className="text-[11px] font-medium text-[#64748b]">High</span>
                  <span className="text-[11px] font-medium text-[#64748b]">Critical</span>
                </div>
              </div>
              {/* Rows */}
              <div className="w-full flex">
                <div className="w-6 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase -rotate-90 whitespace-nowrap">
                    PROBABILITY
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {/* Row 1: High */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-right text-[11px] font-medium text-[#64748b] shrink-0 pr-1">
                      High
                    </span>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="h-11 rounded-xl bg-[#fef3c7] text-[#92400e] font-semibold text-sm flex items-center justify-center shadow-xs">
                        1
                      </div>
                      <div className="h-11 rounded-xl bg-[#fed7aa] text-[#9a3412] font-semibold text-sm flex items-center justify-center shadow-xs">
                        3
                      </div>
                      <div className="h-11 rounded-xl bg-[#fca5a5] text-[#991b1b] font-semibold text-sm flex items-center justify-center shadow-xs">
                        6
                      </div>
                      <div
                        onClick={onOpenCriticalRisk}
                        title="Click to view 8 Critical Risks"
                        className="h-11 rounded-xl bg-[#ef4444] text-white font-bold text-sm flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-red-400 hover:ring-offset-1 transition-all"
                      >
                        8
                      </div>
                    </div>
                  </div>
                  {/* Row 2: Medium */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-right text-[11px] font-medium text-[#64748b] shrink-0 pr-1">
                      Medium
                    </span>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="h-11 rounded-xl bg-[#fef9c3] text-[#854d0e] font-semibold text-sm flex items-center justify-center shadow-xs">
                        2
                      </div>
                      <div className="h-11 rounded-xl bg-[#fde68a] text-[#92400e] font-semibold text-sm flex items-center justify-center shadow-xs">
                        4
                      </div>
                      <div className="h-11 rounded-xl bg-[#fed7aa] text-[#9a3412] font-semibold text-sm flex items-center justify-center shadow-xs">
                        3
                      </div>
                      <div className="h-11 rounded-xl bg-[#fca5a5] text-[#991b1b] font-semibold text-sm flex items-center justify-center shadow-xs">
                        2
                      </div>
                    </div>
                  </div>
                  {/* Row 3: Low */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-right text-[11px] font-medium text-[#64748b] shrink-0 pr-1">
                      Low
                    </span>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="h-11 rounded-xl bg-[#eff6ff] text-[#64748b] font-medium text-sm flex items-center justify-center shadow-xs">
                        0
                      </div>
                      <div className="h-11 rounded-xl bg-[#fef9c3] text-[#854d0e] font-semibold text-sm flex items-center justify-center shadow-xs">
                        1
                      </div>
                      <div className="h-11 rounded-xl bg-[#fef9c3] text-[#854d0e] font-semibold text-sm flex items-center justify-center shadow-xs">
                        1
                      </div>
                      <div className="h-11 rounded-xl bg-[#eff6ff] text-[#64748b] font-medium text-sm flex items-center justify-center shadow-xs">
                        0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Open Sprints Overview & Audit Docs Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-7): Open Sprints — Execution Overview + Tasks cần chú ý */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-6">
          {/* Section 1: Open Sprints — Execution Overview */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1877f2]">
                  <span className="material-symbols-outlined text-[19px]">fact_check</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">
                    Open Sprints — Execution Overview
                  </h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1877f2]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
                3 Active Sprints
              </span>
            </div>

            {/* 3 Open Sprints Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPRINT_LIST.map((sprint) => (
                <div
                  key={sprint.id}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#cbd5e1] hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[13px] text-[#0f172a]">
                        {sprint.name}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sprint.badgeClass}`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sprint.badge === 'On Track'
                              ? 'bg-emerald-500'
                              : sprint.badge === 'At Risk'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        ></span>
                        {sprint.badge}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-[#64748b] mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-[#0f172a] text-[13px]">
                        {sprint.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full ${
                          sprint.badge === 'On Track'
                            ? 'bg-emerald-500'
                            : sprint.badge === 'At Risk'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${sprint.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#edf2f7]">
                      <span className="text-[#64748b]">
                        Tasks: <strong className="text-[#0f172a] font-semibold">{sprint.totalTasks}</strong>
                      </span>
                      <span
                        className={`font-semibold ${
                          sprint.overdueTasks > 5 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        Overdue: {sprint.overdueTasks}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 mt-1 border-t border-[#edf2f7]/60">
                    <button
                      onClick={() => onOpenSprintDetail(sprint)}
                      className="text-xs font-semibold text-[#1877f2] hover:text-[#004ac6] flex items-center justify-between w-full group cursor-pointer"
                    >
                      <span>View {sprint.name}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Tasks cần chú ý — Open Sprints */}
          <div className="pt-2 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-1.5 font-bold text-[13px] text-[#0f172a]">
                <span>⚠️ Tasks cần chú ý — Open Sprints</span>
              </div>
              <button
                onClick={() => onNavigate('progress-task')}
                className="text-[12px] text-[#1877f2] font-semibold hover:underline"
              >
                View all tasks →
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-[#94a3b8] font-semibold border-b border-[#f1f5f9]">
                    <th className="pb-2.5 font-medium w-16">Priority</th>
                    <th className="pb-2.5 font-medium">Task / Feature</th>
                    <th className="pb-2.5 font-medium w-14 text-center">Sprint</th>
                    <th className="pb-2.5 font-medium w-24">Progress</th>
                    <th className="pb-2.5 font-medium w-20">Due Date</th>
                    <th className="pb-2.5 font-medium w-28">Owner</th>
                    <th className="pb-2.5 font-medium w-16 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8fafc]">
                  {(tasks || ATTENTION_TASKS).slice(0, 5).map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-[#f8fafc]/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (onOpenTaskDetail) {
                          onOpenTaskDetail(task.id);
                        } else {
                          onNavigate('progress-task');
                          onSelectTask(task.id);
                        }
                      }}
                    >
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            task.priority === 'Critical'
                              ? 'bg-[#fee2e2] text-[#dc2626]'
                              : task.priority === 'High'
                              ? 'bg-[#ffedd5] text-[#ea580c]'
                              : 'bg-[#fef3c7] text-[#d97706]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-[#0f172a] truncate max-w-[190px]">
                        <span className="hover:text-[#1877f2] transition-colors">
                          {task.title}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1877f2] border border-blue-200">
                          {task.sprint.replace('Sprint ', 'S')}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-col gap-1 w-20">
                          <span className="text-[11px] font-semibold text-[#0f172a]">
                            {task.progress}%
                          </span>
                          <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#1877f2] h-full rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`py-2.5 font-semibold ${
                          task.dueDate === 'Today' ? 'text-[#ef4444]' : 'text-[#64748b]'
                        }`}
                      >
                        {task.dueDate}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full ${task.owner.avatarBg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                          >
                            {task.owner.initials}
                          </div>
                          <span className="text-[#475569] text-[11px] truncate">
                            {task.owner.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenTaskDetail) {
                              onOpenTaskDetail(task.id);
                            } else {
                              onNavigate('progress-task');
                              onSelectTask(task.id);
                            }
                          }}
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1877f2] hover:text-[#004ac6] bg-[#eff6ff] hover:bg-[#dbeafe] px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          View ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Audit Docs Status — Open Sprints */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#1877f2]">
                  verified_user
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">
                    Audit Docs Status
                  </h2>
                  <p className="text-[12px] text-[#64748b]">
                    Pass detail of audit documents across open sprints
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-[#1877f2] font-semibold bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-1 rounded-lg cursor-pointer hover:bg-[#dbeafe] transition-colors">
                <span>All Open Sprints</span>
                <span className="material-symbols-outlined text-[15px]">expand_more</span>
              </div>
            </div>

            {/* 5 Stat Counters */}
            <div className="grid grid-cols-5 gap-2 py-3 border-y border-[#f1f5f9]">
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#0f172a]">28</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">
                  Total Docs
                </span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#10b981]">21</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">
                  Agent Passed
                </span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#1877f2]">16</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">
                  PM Approved
                </span>
              </div>
              <div
                onClick={onOpenAuditPending}
                title="Click to view Pending Review Docs"
                className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 rounded-xl shadow-xs flex flex-col justify-between cursor-pointer hover:bg-amber-50/50 hover:border-amber-200 transition-colors"
              >
                <span className="text-[20px] font-bold text-[#f59e0b]">3</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">
                  Pending Check
                </span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#ef4444]">2</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">
                  Rejected
                </span>
              </div>
            </div>

            {/* PM Approval Progress */}
            <div className="py-3">
              <div className="flex items-center justify-between text-[12px] font-semibold mb-1.5">
                <span className="text-[#64748b]">PM Approval Progress</span>
                <span className="text-[#0f172a]">16 / 28 (57%)</span>
              </div>
              <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1877f2] h-full rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>

            {/* Mini Audit Documents Table */}
            <div className="pt-2">
              <div className="text-[13px] font-bold text-[#0f172a] mb-2.5">
                Audit Documents
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="text-[#94a3b8] font-semibold border-b border-[#f1f5f9]">
                      <th className="pb-2.5 font-medium pr-2">Document</th>
                      <th className="pb-2.5 font-medium px-1 text-center w-12">Sprint</th>
                      <th className="pb-2.5 font-medium px-1 text-center w-20">Agent Audit</th>
                      <th className="pb-2.5 font-medium px-1 text-center w-20">PM Check</th>
                      <th className="pb-2.5 font-medium pl-2 pr-1 text-right w-28 whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f8fafc]">
                    <tr className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-[#0f172a]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            description
                          </span>
                          <span className="truncate max-w-[130px]">Workflow Automation Spec</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1877f2]">
                          S36
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#10b981] font-semibold text-[11px]">
                        Passed
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#10b981] font-semibold text-[11px]">
                        Approved
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ecfdf5] text-[#059669]">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-[#0f172a]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            description
                          </span>
                          <span className="truncate max-w-[130px]">Security Assessment</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1877f2]">
                          S36
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#10b981] font-semibold text-[11px]">
                        Passed
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#10b981] font-semibold text-[11px]">
                        Approved
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ecfdf5] text-[#059669]">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-[#0f172a]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            description
                          </span>
                          <span className="truncate max-w-[130px]">Data Sync Report</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#059669]">
                          S35
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#10b981] font-semibold text-[11px]">
                        Passed
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#d97706] font-semibold text-[11px]">
                        Pending
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fef3c7] text-[#d97706]">
                          PM Review
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-[#0f172a]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            description
                          </span>
                          <span className="truncate max-w-[130px]">Cloud Ingestion Protocol</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#faf5ff] text-[#9333ea]">
                          S37
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#10b981] font-semibold text-[11px]">
                        Passed
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#d97706] font-semibold text-[11px]">
                        Pending
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fef3c7] text-[#d97706]">
                          PM Review
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-[#0f172a]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            description
                          </span>
                          <span className="truncate max-w-[130px]">API Integration Audit</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1877f2]">
                          S36
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#dc2626] font-semibold text-[11px]">
                        Rework
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#94a3b8]">—</td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] whitespace-nowrap">
                          Action Required
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-4 text-right border-t border-[#f1f5f9] mt-3">
            <button
              onClick={() => onNavigate('audit-docs')}
              className="text-[12px] text-[#1877f2] font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              View all Audit Docs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
