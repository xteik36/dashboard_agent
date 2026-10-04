import React, { useState } from 'react';
import { ALL_RISKS_DATA, OWNER_EXPOSURES, INITIAL_ALL_TASKS } from '../data/mockData';
import { RiskItem, TaskItem } from '../types';
import { TaskActionModal, ActionModalType } from './TaskActionModal';

export const RiskPredictionsView: React.FC = () => {
  const [subView, setSubView] = useState<'overview' | 'owner-exposure' | 'all-matrix'>('overview');
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'due'>('score');
  const [ownerSort, setOwnerSort] = useState('score');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expandable KPI card state
  const [expandedKpiCard, setExpandedKpiCard] = useState<string | null>(null);

  // Expandable member rows in Owner Risk Exposure
  const [expandedMembers, setExpandedMembers] = useState<string[]>(['Alex Johnson']);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_ALL_TASKS);

  // Action Modal State for PM actions
  const [actionModalType, setActionModalType] = useState<ActionModalType>('none');
  const [actionTargetTask, setActionTargetTask] = useState<TaskItem | null>(null);

  const toggleExpandMember = (memberName: string) => {
    setExpandedMembers((prev) =>
      prev.includes(memberName) ? prev.filter((n) => n !== memberName) : [...prev, memberName]
    );
  };

  const toggleExpandKpi = (kpiKey: string) => {
    setExpandedKpiCard((prev) => (prev === kpiKey ? null : kpiKey));
  };

  const getKpiTasks = (kpiKey: string): TaskItem[] => {
    switch (kpiKey) {
      case 'critical':
        return tasks.filter((t) => t.priority === 'Critical' || t.status === 'At Risk').slice(0, 4);
      case 'increasing':
        return tasks.filter((t) => t.priority === 'High' || t.progress < 55).slice(0, 4);
      case 'overdue':
        return tasks.filter((t) => t.status === 'Overdue' || t.dueDate === 'Today').slice(0, 4);
      case 'due-soon':
        return tasks.filter((t) => t.dueDate === 'Today' || t.sprint === 'Sprint 36').slice(0, 4);
      default:
        return [];
    }
  };

  const getKpiTitle = (kpiKey: string): string => {
    switch (kpiKey) {
      case 'critical':
        return 'Critical Risks Tasks (Need Immediate Action)';
      case 'increasing':
        return 'Risks Increasing Tasks (Approaching Threshold)';
      case 'overdue':
        return 'Overdue Mitigations Tasks (Need Follow-up Check)';
      case 'due-soon':
        return 'Risks Due Soon Tasks (Next 14 Days Deadline)';
      default:
        return '';
    }
  };

  const handleSaveTaskAction = (updatedTask: TaskItem, toastMsg: string) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    showToast(toastMsg);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenReview = (risk: RiskItem) => {
    setSelectedRisk(risk);
    setIsReviewModalOpen(true);
  };

  const filteredRisks = ALL_RISKS_DATA.filter((risk) => {
    if (activeTab === 'overdue' && risk.status !== 'Overdue') return false;
    if (activeTab === 'completed' && risk.status !== 'On Track') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        risk.id.toLowerCase().includes(q) ||
        risk.name.toLowerCase().includes(q) ||
        risk.description.toLowerCase().includes(q) ||
        risk.owner.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Risk Predictions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            AI-powered risk forecasting, exposure analysis, and mitigation matrix.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setSubView('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              subView === 'overview'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Trends
          </button>
          <button
            onClick={() => setSubView('owner-exposure')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              subView === 'owner-exposure'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Owner Exposure
          </button>
          <button
            onClick={() => setSubView('all-matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              subView === 'all-matrix'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Risks Matrix
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: OVERVIEW & TRENDS */}
      {subView === 'overview' && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Critical Risks */}
            <div
              onClick={() => toggleExpandKpi('critical')}
              className={`bg-white rounded-xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-red-500 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                expandedKpiCard === 'critical' ? 'ring-2 ring-red-400/60 bg-red-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Critical Risks</span>
                </div>
                <button
                  type="button"
                  aria-label="Toggle Critical Risks Tasks"
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                      expandedKpiCard === 'critical' ? 'rotate-90 text-red-600' : 'text-slate-400'
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
              <div>
                <div className="text-[32px] font-bold text-red-600 leading-none mb-1">4</div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Need immediate action</span>
                  <span className="text-[11px] font-semibold text-red-600 hover:underline">
                    {expandedKpiCard === 'critical' ? 'Collapse' : 'View tasks →'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Risks Increasing */}
            <div
              onClick={() => toggleExpandKpi('increasing')}
              className={`bg-white rounded-xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-amber-500 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                expandedKpiCard === 'increasing' ? 'ring-2 ring-amber-400/60 bg-amber-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Risks Increasing</span>
                </div>
                <button
                  type="button"
                  aria-label="Toggle Risks Increasing Tasks"
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                      expandedKpiCard === 'increasing' ? 'rotate-90 text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
              <div>
                <div className="text-[32px] font-bold text-amber-600 leading-none mb-1">6</div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Approaching threshold</span>
                  <span className="text-[11px] font-semibold text-amber-600 hover:underline">
                    {expandedKpiCard === 'increasing' ? 'Collapse' : 'View tasks →'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Overdue Mitigations */}
            <div
              onClick={() => toggleExpandKpi('overdue')}
              className={`bg-white rounded-xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-blue-600 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                expandedKpiCard === 'overdue' ? 'ring-2 ring-blue-400/60 bg-blue-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Overdue Mitigations</span>
                </div>
                <button
                  type="button"
                  aria-label="Toggle Overdue Mitigations Tasks"
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                      expandedKpiCard === 'overdue' ? 'rotate-90 text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
              <div>
                <div className="text-[32px] font-bold text-blue-600 leading-none mb-1">3</div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Need follow-up check</span>
                  <span className="text-[11px] font-semibold text-blue-600 hover:underline">
                    {expandedKpiCard === 'overdue' ? 'Collapse' : 'View tasks →'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Risks Due Soon */}
            <div
              onClick={() => toggleExpandKpi('due-soon')}
              className={`bg-white rounded-xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-emerald-500 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                expandedKpiCard === 'due-soon' ? 'ring-2 ring-emerald-400/60 bg-emerald-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Risks Due Soon</span>
                </div>
                <button
                  type="button"
                  aria-label="Toggle Risks Due Soon Tasks"
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                      expandedKpiCard === 'due-soon' ? 'rotate-90 text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
              <div>
                <div className="text-[32px] font-bold text-emerald-700 leading-none mb-1">5</div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Next 14 days deadline</span>
                  <span className="text-[11px] font-semibold text-emerald-600 hover:underline">
                    {expandedKpiCard === 'due-soon' ? 'Collapse' : 'View tasks →'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Risky Tasks Panel for Selected KPI Card */}
          {expandedKpiCard && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {getKpiTitle(expandedKpiCard)}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                    {getKpiTasks(expandedKpiCard).length} tasks
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedKpiCard(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <span>Close</span>
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="space-y-3">
                {getKpiTasks(expandedKpiCard).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            task.priority === 'Critical'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="font-bold text-xs text-slate-900">
                          {task.id} — {task.title}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-500">
                        <span>Sprint: <strong className="text-slate-700">{task.sprint}</strong></span>
                        <span>Due: <strong className="text-rose-600">{task.dueDate}</strong></span>
                        <span>Status: <strong className="text-blue-600">{task.status}</strong></span>
                        <span>Progress: <strong className="text-slate-800">{task.progress}%</strong></span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full ${task.owner.avatarBg} text-white text-[9px] font-bold flex items-center justify-center`}>
                            {task.owner.initials}
                          </div>
                          <span>{task.owner.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4 PM Recommended Actions */}
                    <div className="flex items-center flex-wrap gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActionTargetTask(task);
                          setActionModalType('reassign');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] text-blue-500">
                          person_add
                        </span>
                        Reassign Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionTargetTask(task);
                          setActionModalType('dueDate');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] text-blue-500">
                          edit_calendar
                        </span>
                        Update Due Date
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionTargetTask(task);
                          setActionModalType('comment');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] text-blue-500">
                          chat_bubble
                        </span>
                        Add Comment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionTargetTask(task);
                          setActionModalType('blocked');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:border-rose-300 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] text-rose-500">
                          block
                        </span>
                        Mark as Blocked
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Trend by Sprint Bar Chart */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    insights
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">
                    Risk Trend by Sprint
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track total identified risks and critical risk evolution across sprints
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>Critical / High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Low</span>
                </div>
              </div>
            </div>

            {/* Bars */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[640px] h-60 relative flex flex-col justify-between pt-4 pb-2 select-none">
                <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none pl-10 pr-4">
                  {[12, 9, 6, 3, 0].map((val) => (
                    <div key={val} className="flex items-center w-full">
                      <span className="text-[10px] font-medium text-slate-400 w-6 text-right mr-3">
                        {val}
                      </span>
                      <div className="flex-1 border-b border-dashed border-slate-100"></div>
                    </div>
                  ))}
                </div>

                <div className="relative h-full flex items-end justify-around pl-16 pr-6 pb-6 z-10">
                  {/* Sprint 32 */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-40">
                      <div className="w-5 bg-red-500 rounded-t-xs" style={{ height: '58%' }}></div>
                      <div className="w-5 bg-amber-500 rounded-t-xs" style={{ height: '67%' }}></div>
                      <div className="w-5 bg-emerald-500 rounded-t-xs" style={{ height: '33%' }}></div>
                    </div>
                    <span className="text-xs text-slate-600 mt-2">Sprint 32</span>
                  </div>

                  {/* Sprint 33 */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-40">
                      <div className="w-5 bg-red-500 rounded-t-xs" style={{ height: '67%' }}></div>
                      <div className="w-5 bg-amber-500 rounded-t-xs" style={{ height: '75%' }}></div>
                      <div className="w-5 bg-emerald-500 rounded-t-xs" style={{ height: '33%' }}></div>
                    </div>
                    <span className="text-xs text-slate-600 mt-2">Sprint 33</span>
                  </div>

                  {/* Sprint 34 */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-40">
                      <div className="w-5 bg-red-500 rounded-t-xs" style={{ height: '50%' }}></div>
                      <div className="w-5 bg-amber-500 rounded-t-xs" style={{ height: '58%' }}></div>
                      <div className="w-5 bg-emerald-500 rounded-t-xs" style={{ height: '42%' }}></div>
                    </div>
                    <span className="text-xs text-slate-600 mt-2">Sprint 34</span>
                  </div>

                  {/* Sprint 35 */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-40">
                      <div className="w-5 bg-red-500 rounded-t-xs" style={{ height: '42%' }}></div>
                      <div className="w-5 bg-amber-500 rounded-t-xs" style={{ height: '75%' }}></div>
                      <div className="w-5 bg-emerald-500 rounded-t-xs" style={{ height: '50%' }}></div>
                    </div>
                    <span className="text-xs text-slate-600 mt-2">Sprint 35</span>
                  </div>

                  {/* Sprint 36 (Current) */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-40">
                      <div className="w-5 bg-red-500 rounded-t-xs" style={{ height: '33%' }}></div>
                      <div className="w-5 bg-amber-500 rounded-t-xs" style={{ height: '67%' }}></div>
                      <div className="w-5 bg-emerald-500 rounded-t-xs" style={{ height: '42%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 mt-2">
                      Sprint 36 (Current)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <section className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            {/* Table Tabs & Search Bar */}
            <div className="border-b border-slate-100 flex flex-col gap-3 p-4">
              <div className="flex items-center gap-4 flex-wrap border-b border-slate-100 pb-2">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex items-center gap-2 py-1 px-2.5 font-semibold text-xs transition-colors ${
                    activeTab === 'today'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Today's Tasks (09/09/2026)</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold">
                    4
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`flex items-center gap-2 py-1 px-2.5 font-semibold text-xs transition-colors ${
                    activeTab === 'overdue'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Overdue Tasks</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                    2
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center gap-2 py-1 px-2.5 font-semibold text-xs transition-colors ${
                    activeTab === 'completed'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Completed Tasks</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                    1
                  </span>
                </button>
              </div>

              {/* Search & Sort controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search risks by ID, summary, or project..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortBy((prev) => (prev === 'score' ? 'due' : 'score'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                  >
                    <span className="text-slate-400">Sort:</span>
                    <span className="font-semibold">
                      {sortBy === 'score' ? 'Score High-Low' : 'Due Date'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4 font-semibold">RISK ID</th>
                    <th className="py-3 px-4 font-semibold">RISK</th>
                    <th className="py-3 px-4 font-semibold">PROBABILITY</th>
                    <th className="py-3 px-4 font-semibold">IMPACT</th>
                    <th className="py-3 px-4 font-semibold text-center">SCORE</th>
                    <th className="py-3 px-4 font-semibold">OWNER</th>
                    <th className="py-3 px-4 font-semibold">DUE DATE</th>
                    <th className="py-3 px-4 font-semibold">STATUS</th>
                    <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRisks.map((risk) => (
                    <tr key={risk.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-xs tracking-tight">
                        {risk.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{risk.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {risk.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                              risk.probability === 'High'
                                ? 'bg-rose-50 text-rose-600'
                                : risk.probability === 'Medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {risk.probability}
                          </span>
                          <span className="text-[11px] text-slate-400 pl-1">
                            {risk.probabilityPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                              risk.impact === 'Critical' || risk.impact === 'High'
                                ? 'bg-rose-50 text-rose-600'
                                : risk.impact === 'Medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {risk.impact}
                          </span>
                          <span className="text-[11px] text-slate-400 pl-1">
                            {risk.impactScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-base font-bold ${
                            risk.score >= 15
                              ? 'text-red-600'
                              : risk.score >= 10
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {risk.score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full ${risk.owner.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}
                          >
                            {risk.owner.initials}
                          </div>
                          <span className="font-medium text-slate-800 text-xs">
                            {risk.owner.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 text-xs">{risk.dueDate}</div>
                        {risk.dueNotice && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{risk.dueNotice}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            risk.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : risk.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : risk.status === 'Planned'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {risk.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReview(risk)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setSubView('all-matrix')}
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
              >
                <span>View all risks</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <span className="text-slate-400">
                Showing {filteredRisks.length} of {ALL_RISKS_DATA.length} risks
              </span>
            </div>
          </section>
        </>
      )}

      {/* SUBVIEW 2: OWNER RISK EXPOSURE & WORKLOAD VULNERABILITY */}
      {subView === 'owner-exposure' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[22px]">person_alert</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Owner Risk Exposure & Workload Vulnerability
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate risk weight assigned per team lead
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filter by:</span>
              <select
                value={ownerSort}
                onChange={(e) => setOwnerSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="score">Total Risk Score (High to Low)</option>
                <option value="count">Highest Risk Count</option>
                <option value="critical">Critical Risks Count</option>
                <option value="overdue">Overdue Mitigations</option>
              </select>
            </div>
          </div>

          {/* Ranked Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Rank & Team Member</th>
                  <th className="py-2.5 px-3">Total Risks & Composition (Crit / High / Med)</th>
                  <th className="py-2.5 px-3 text-center">Risk Score</th>
                  <th className="py-2.5 px-3">Overdue Action</th>
                  <th className="py-2.5 px-3">Top Threat Risk</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {OWNER_EXPOSURES.map((member) => {
                  const isExpanded = expandedMembers.includes(member.name);
                  const memberTasks = tasks.filter(
                    (t) =>
                      t.owner.name.toLowerCase() === member.name.toLowerCase() ||
                      t.owner.initials.toLowerCase() === member.initials.toLowerCase()
                  );

                  const totalTasks = memberTasks.length;
                  const critCount = memberTasks.filter((t) => t.priority === 'Critical').length;
                  const highCount = memberTasks.filter((t) => t.priority === 'High').length;
                  const medCount = memberTasks.filter((t) => t.priority === 'Medium').length;
                  const lowCount = memberTasks.filter((t) => t.priority === 'Low' || !t.priority).length;
                  const riskTasksCount = memberTasks.filter(
                    (t) =>
                      t.status === 'Overdue' ||
                      t.status === 'At Risk' ||
                      t.priority === 'Critical' ||
                      t.priority === 'High'
                  ).length;
                  const overdueCount = memberTasks.filter((t) => t.status === 'Overdue').length;

                  return (
                    <React.Fragment key={member.rank}>
                      <tr className={`hover:bg-slate-50/60 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleExpandMember(member.name)}
                              className="w-6 h-6 rounded-md hover:bg-slate-200/70 text-slate-500 flex items-center justify-center transition-transform cursor-pointer"
                              title={isExpanded ? 'Collapse tasks' : 'Expand member tasks'}
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90 text-blue-600' : 'text-slate-400'
                                }`}
                              >
                                chevron_right
                              </span>
                            </button>
                            <span
                              className={`text-sm font-bold w-4 text-center ${
                                member.rank === 1
                                  ? 'text-red-600'
                                  : member.rank === 2
                                  ? 'text-amber-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {member.rank}
                            </span>
                            <div
                              className={`w-9 h-9 rounded-full ${member.avatarBg} flex items-center justify-center font-bold text-xs text-white shrink-0`}
                            >
                              {member.initials}
                            </div>
                            <div
                              className="flex flex-col min-w-0 cursor-pointer"
                              onClick={() => toggleExpandMember(member.name)}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 text-xs hover:text-blue-600 transition-colors truncate">
                                  {member.name}
                                </span>
                                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {totalTasks} total tasks
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 truncate">
                                {member.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 min-w-[260px]">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-1 text-[11px]">
                              <span className="font-bold text-slate-900">
                                {riskTasksCount} Risks
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                                {critCount} Crit
                              </span>
                              <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100">
                                {highCount} High
                              </span>
                              <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                {medCount} Med
                              </span>
                              {lowCount > 0 && (
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                  {lowCount} Low
                                </span>
                              )}
                            </div>
                            <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                              {totalTasks > 0 ? (
                                <>
                                  <div
                                    className="bg-red-500"
                                    style={{
                                      width: `${(critCount / totalTasks) * 100}%`,
                                    }}
                                    title={`${critCount} Critical`}
                                  />
                                  <div
                                    className="bg-amber-500"
                                    style={{
                                      width: `${(highCount / totalTasks) * 100}%`,
                                    }}
                                    title={`${highCount} High`}
                                  />
                                  <div
                                    className="bg-blue-400"
                                    style={{
                                      width: `${(medCount / totalTasks) * 100}%`,
                                    }}
                                    title={`${medCount} Medium`}
                                  />
                                  <div
                                    className="bg-emerald-400"
                                    style={{
                                      width: `${(lowCount / totalTasks) * 100}%`,
                                    }}
                                    title={`${lowCount} Low`}
                                  />
                                </>
                              ) : (
                                <div className="bg-slate-200 w-full" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-baseline justify-center gap-1">
                            <span
                              className={`text-lg font-bold ${
                                member.riskScore >= 15
                                  ? 'text-red-600'
                                  : member.riskScore >= 10
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {member.riskScore}
                            </span>
                            <span className="text-[11px] text-slate-400">/25</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          {overdueCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                              <span className="material-symbols-outlined text-[15px]">warning</span>
                              {overdueCount} Overdue
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold">
                              Clear
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                            {member.topThreatId}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => toggleExpandMember(member.name)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'Hide Tasks' : `View Tasks (${totalTasks})`}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Section: Member Risky Tasks and Recommended Actions */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200 animate-in fade-in duration-150">
                          <td colSpan={6} className="p-4 pl-12">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-amber-500">
                                    assignment_late
                                  </span>
                                  <span className="text-xs font-bold text-slate-900">
                                    Assigned Risks & Tasks for {member.name}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Select an action to execute immediate mitigation
                                </span>
                              </div>

                              {memberTasks.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                  No critical tasks currently pending for this member.
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {memberTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                              task.priority === 'Critical'
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}
                                          >
                                            {task.priority}
                                          </span>
                                          <span className="font-bold text-xs text-slate-900">
                                            {task.id} — {task.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                          <span>Sprint: <strong className="text-slate-700">{task.sprint}</strong></span>
                                          <span>Due: <strong className="text-rose-600">{task.dueDate}</strong></span>
                                          <span>Status: <strong className="text-blue-600">{task.status}</strong></span>
                                          <span>Progress: <strong className="text-slate-800">{task.progress}%</strong></span>
                                        </div>
                                      </div>

                                      {/* 4 PM Recommended Actions */}
                                      <div className="flex items-center flex-wrap gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActionTargetTask(task);
                                            setActionModalType('reassign');
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-[14px] text-blue-500">
                                            person_add
                                          </span>
                                          Reassign Owner
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActionTargetTask(task);
                                            setActionModalType('dueDate');
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-[14px] text-blue-500">
                                            edit_calendar
                                          </span>
                                          Update Due Date
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActionTargetTask(task);
                                            setActionModalType('comment');
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-[14px] text-blue-500">
                                            chat_bubble
                                          </span>
                                          Add Comment
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActionTargetTask(task);
                                            setActionModalType('blocked');
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:border-rose-300 font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-[14px] text-rose-500">
                                            block
                                          </span>
                                          Mark as Blocked
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: ALL RISKS MATRIX FULL TABLE */}
      {subView === 'all-matrix' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search risks by ID, risk name, or owner..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Exported Risk Matrix to CSV')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Matrix</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  <th className="py-3.5 pl-6 pr-4">Risk ID</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Risk Name</th>
                  <th className="py-3.5 px-4">Probability</th>
                  <th className="py-3.5 px-4">Impact</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-6 pr-4 font-bold text-slate-800 text-xs">
                      {risk.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-xs">{risk.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {risk.description}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          risk.probability === 'High'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : risk.probability === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {risk.probability} ({risk.probabilityPercent}%)
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          risk.impact === 'Critical' || risk.impact === 'High'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {risk.impact} ({risk.impactScore})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-base font-bold ${
                          risk.score >= 15
                            ? 'text-red-600'
                            : risk.score >= 10
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {risk.score}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${risk.owner.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}
                        >
                          {risk.owner.initials}
                        </div>
                        <span className="font-medium text-slate-800 text-xs">
                          {risk.owner.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 text-xs">{risk.dueDate}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{risk.dueNotice}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          risk.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : risk.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {risk.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(risk)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Risk Modal */}
      {isReviewModalOpen && selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">policy</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Review {selectedRisk.id} — {selectedRisk.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">{selectedRisk.sprint}</span>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Risk Score:</span>
                  <span className="text-base font-bold text-red-600">
                    {selectedRisk.score} / 25
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Probability / Impact:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRisk.probability} ({selectedRisk.probabilityPercent}%) /{' '}
                    {selectedRisk.impact} ({selectedRisk.impactScore})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Owner:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRisk.owner.name}
                  </span>
                </div>
              </div>

              {/* Recommended PM Actions */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-900 text-xs mb-2">
                  Recommended Actions for PM:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const matchedTask: TaskItem =
                        tasks.find(
                          (t) =>
                            t.id === selectedRisk.id ||
                            t.title.toLowerCase().includes(selectedRisk.name.toLowerCase())
                        ) || {
                          id: selectedRisk.id,
                          title: selectedRisk.name,
                          project: 'PMA Agent',
                          sprint: selectedRisk.sprint,
                          priority: selectedRisk.impact === 'Critical' ? 'Critical' : 'High',
                          status: selectedRisk.status === 'Overdue' ? 'Overdue' : 'At Risk',
                          progress: 60,
                          dueDate: selectedRisk.dueDate,
                          owner: selectedRisk.owner,
                          subtasks: [],
                        };
                      setIsReviewModalOpen(false);
                      setActionTargetTask(matchedTask);
                      setActionModalType('reassign');
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-blue-600">
                      person_add
                    </span>
                    <span>Reassign Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const matchedTask: TaskItem =
                        tasks.find(
                          (t) =>
                            t.id === selectedRisk.id ||
                            t.title.toLowerCase().includes(selectedRisk.name.toLowerCase())
                        ) || {
                          id: selectedRisk.id,
                          title: selectedRisk.name,
                          project: 'PMA Agent',
                          sprint: selectedRisk.sprint,
                          priority: selectedRisk.impact === 'Critical' ? 'Critical' : 'High',
                          status: selectedRisk.status === 'Overdue' ? 'Overdue' : 'At Risk',
                          progress: 60,
                          dueDate: selectedRisk.dueDate,
                          owner: selectedRisk.owner,
                          subtasks: [],
                        };
                      setIsReviewModalOpen(false);
                      setActionTargetTask(matchedTask);
                      setActionModalType('dueDate');
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-blue-600">
                      edit_calendar
                    </span>
                    <span>Update Due Date</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const matchedTask: TaskItem =
                        tasks.find(
                          (t) =>
                            t.id === selectedRisk.id ||
                            t.title.toLowerCase().includes(selectedRisk.name.toLowerCase())
                        ) || {
                          id: selectedRisk.id,
                          title: selectedRisk.name,
                          project: 'PMA Agent',
                          sprint: selectedRisk.sprint,
                          priority: selectedRisk.impact === 'Critical' ? 'Critical' : 'High',
                          status: selectedRisk.status === 'Overdue' ? 'Overdue' : 'At Risk',
                          progress: 60,
                          dueDate: selectedRisk.dueDate,
                          owner: selectedRisk.owner,
                          subtasks: [],
                        };
                      setIsReviewModalOpen(false);
                      setActionTargetTask(matchedTask);
                      setActionModalType('comment');
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-blue-600">
                      chat_bubble
                    </span>
                    <span>Add Comment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const matchedTask: TaskItem =
                        tasks.find(
                          (t) =>
                            t.id === selectedRisk.id ||
                            t.title.toLowerCase().includes(selectedRisk.name.toLowerCase())
                        ) || {
                          id: selectedRisk.id,
                          title: selectedRisk.name,
                          project: 'PMA Agent',
                          sprint: selectedRisk.sprint,
                          priority: selectedRisk.impact === 'Critical' ? 'Critical' : 'High',
                          status: selectedRisk.status === 'Overdue' ? 'Overdue' : 'At Risk',
                          progress: 60,
                          dueDate: selectedRisk.dueDate,
                          owner: selectedRisk.owner,
                          subtasks: [],
                        };
                      setIsReviewModalOpen(false);
                      setActionTargetTask(matchedTask);
                      setActionModalType('blocked');
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-rose-600">
                      block
                    </span>
                    <span>Mark as Blocked</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* PM Task Action Modal */}
      <TaskActionModal
        isOpen={actionModalType !== 'none'}
        type={actionModalType}
        task={actionTargetTask}
        onClose={() => {
          setActionModalType('none');
          setActionTargetTask(null);
        }}
        onSave={handleSaveTaskAction}
      />
    </div>
  );
};
