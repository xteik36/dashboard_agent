import React, { useState } from 'react';
import { TaskItem } from '../types';
import { INITIAL_ALL_TASKS, SPRINT_LIST } from '../data/mockData';
import { TaskActionModal, ActionModalType } from './TaskActionModal';

interface ProgressTaskViewProps {
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  tasks?: TaskItem[];
  onUpdateTask?: (updatedTask: TaskItem) => void;
}

export const ProgressTaskView: React.FC<ProgressTaskViewProps> = ({
  selectedTaskId,
  onSelectTask,
  tasks: propTasks,
  onUpdateTask,
}) => {
  const [localTasks, setLocalTasks] = useState<TaskItem[]>(INITIAL_ALL_TASKS);
  const tasks = propTasks || localTasks;

  const [currentSprintFilter, setCurrentSprintFilter] = useState<string>('All open sprints');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Action Modal State
  const [actionModalType, setActionModalType] = useState<ActionModalType>('none');
  const [actionTargetTask, setActionTargetTask] = useState<TaskItem | null>(null);

  // Review Modal for KPI cards (supports all tasks in category)
  const [kpiReviewGroup, setKpiReviewGroup] = useState<{
    category: 'Overdue' | 'At Risk' | 'Today';
    title: string;
    subtitle: string;
    badgeClass: string;
    icon: string;
    iconColor: string;
  } | null>(null);

  // Active task for drawer
  const activeTask =
    tasks.find((t) => t.id === selectedTaskId) ||
    tasks.find((t) => t.id === 'TSK-1048') ||
    tasks[0];

  const overdueTasks = tasks.filter((t) => t.status === 'Overdue');
  const atRiskTasks = tasks.filter((t) => t.status === 'At Risk');
  const todayDueTasks = tasks.filter((t) => t.dueDate === 'Today');

  const currentGroupTasks = kpiReviewGroup
    ? kpiReviewGroup.category === 'Overdue'
      ? overdueTasks
      : kpiReviewGroup.category === 'At Risk'
      ? atRiskTasks
      : todayDueTasks
    : [];

  const handleSaveAction = (updatedTask: TaskItem, toastMsg: string) => {
    if (onUpdateTask) {
      onUpdateTask(updatedTask);
    } else {
      setLocalTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    }
    setToastMessage(toastMsg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReviewOverdue = () => {
    setKpiReviewGroup({
      category: 'Overdue',
      title: 'Overdue Tasks',
      subtitle: `Displaying all ${overdueTasks.length} overdue tasks across open sprints requiring immediate action`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: 'warning',
      iconColor: 'text-rose-500 bg-rose-50',
    });
  };

  const handleReviewRisks = () => {
    setKpiReviewGroup({
      category: 'At Risk',
      title: 'At Risk Tasks',
      subtitle: `Displaying all ${atRiskTasks.length} tasks flagged as high or critical risk`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'schedule',
      iconColor: 'text-amber-500 bg-amber-50',
    });
  };

  const handleReviewToday = () => {
    setKpiReviewGroup({
      category: 'Today',
      title: "Today's Due Tasks",
      subtitle: `Displaying all ${todayDueTasks.length} tasks scheduled for completion today`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'calendar_today',
      iconColor: 'text-blue-500 bg-blue-50',
    });
  };

  // Filter tasks based on sprint tab and search query
  const filteredTasks = tasks.filter((task) => {
    if (currentSprintFilter !== 'All open sprints') {
      if (!task.sprint.toLowerCase().includes(currentSprintFilter.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.id.toLowerCase().includes(q) ||
        task.project.toLowerCase().includes(q) ||
        task.owner.name.toLowerCase().includes(q) ||
        (task.subtitle && task.subtitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Task Action Modal Dialog */}
      <TaskActionModal
        isOpen={actionModalType !== 'none'}
        type={actionModalType}
        task={actionTargetTask || activeTask}
        onClose={() => {
          setActionModalType('none');
          setActionTargetTask(null);
        }}
        onSave={handleSaveAction}
      />

      {/* KPI Review Tasks Modal with ALL Tasks and PM Recommended Actions */}
      {kpiReviewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpiReviewGroup.iconColor}`}>
                  <span className="material-symbols-outlined text-[18px]">{kpiReviewGroup.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{kpiReviewGroup.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${kpiReviewGroup.badgeClass}`}>
                      {currentGroupTasks.length} tasks
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{kpiReviewGroup.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setKpiReviewGroup(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Task List (All tasks displayed in scrollable view) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100/80">
              {currentGroupTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1">task_alt</span>
                  <p className="text-xs font-medium">No tasks found in this category.</p>
                </div>
              ) : (
                currentGroupTasks.map((task, idx) => (
                  <div key={task.id} className={idx > 0 ? 'pt-3.5' : ''}>
                    <div className="p-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all space-y-3 shadow-2xs">
                      {/* Top Row: Meta Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              task.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : task.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{task.id}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {task.project} • {task.sprint}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.status === 'Overdue'
                                ? 'bg-rose-100/70 text-rose-700'
                                : task.status === 'At Risk'
                                ? 'bg-amber-100/70 text-amber-700'
                                : 'bg-blue-100/70 text-blue-700'
                            }`}
                          >
                            {task.status}
                          </span>
                          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded border border-rose-100">
                            Due: {task.dueDate}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Title & Owner & Progress */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                        {task.subtitle && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{task.subtitle}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        {/* Owner */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full ${task.owner.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                          >
                            {task.owner.initials}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{task.owner.name}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 min-w-[130px]">
                          <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                task.progress >= 70
                                  ? 'bg-emerald-500'
                                  : task.progress >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{task.progress}%</span>
                        </div>
                      </div>

                      {/* Bottom Row: 4 Recommended Actions for PM */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                          Recommended Actions for PM:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActionTargetTask(task);
                              setActionModalType('reassign');
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px] text-blue-600">person_add</span>
                            <span className="truncate">Reassign</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionTargetTask(task);
                              setActionModalType('dueDate');
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px] text-blue-600">edit_calendar</span>
                            <span className="truncate">Due Date</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionTargetTask(task);
                              setActionModalType('comment');
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px] text-blue-600">chat_bubble</span>
                            <span className="truncate">Comment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionTargetTask(task);
                              setActionModalType('blocked');
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px] text-rose-600">block</span>
                            <span className="truncate">Mark Blocked</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Total: <strong className="text-slate-800">{currentGroupTasks.length}</strong> tasks in category
              </span>
              <button
                onClick={() => setKpiReviewGroup(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Header (Project and Sprint scope selector pills removed as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-display text-slate-900">Progress Task</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
              WORKSPACE FEED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage and track your assigned work across all open sprints.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overdue Tasks */}
        <div
          onClick={handleReviewOverdue}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <span className="text-xs font-bold text-slate-700">Overdue Tasks</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-display text-slate-900 leading-none">
              {overdueTasks.length}
            </div>
            <div className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
              <span>↑ 2</span>
              <span className="text-slate-400 font-normal">vs last sprint</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReviewOverdue();
            }}
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/70 group-hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Review Tasks ({overdueTasks.length})</span>
            <span className="ml-1">→</span>
          </button>
        </div>

        {/* Card 2: At Risk Tasks */}
        <div
          onClick={handleReviewRisks}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
            <span className="text-xs font-bold text-slate-700">At Risk Tasks</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-display text-slate-900 leading-none">
              {atRiskTasks.length}
            </div>
            <div className="text-[11px] font-semibold text-amber-500 mt-1 flex items-center gap-1">
              <span>↑ 1</span>
              <span className="text-slate-400 font-normal">vs last sprint</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReviewRisks();
            }}
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/70 group-hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Review Risks ({atRiskTasks.length})</span>
            <span className="ml-1">→</span>
          </button>
        </div>

        {/* Card 3: Sprint Velocity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
            <span className="text-xs font-bold text-slate-700">Sprint Velocity</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-display text-slate-900 leading-none">82%</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 6%</span>
              <span className="text-slate-400 font-normal">vs last sprint</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium pt-1">
            Velocity stable across 3 sprints
          </div>
        </div>

        {/* Card 4: Today's Due */}
        <div
          onClick={handleReviewToday}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
            <span className="text-xs font-bold text-slate-700">Today's Due</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-display text-slate-900 leading-none">
              {todayDueTasks.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <span>→ 0</span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReviewToday();
            }}
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/70 group-hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Review Tasks ({todayDueTasks.length})</span>
            <span className="ml-1">→</span>
          </button>
        </div>
      </section>

      {/* Sprint Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Open Sprint Progress Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-500">
                  insights
                </span>
                Open Sprint Progress
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                • {tasks.length} total tasks across open sprints • {tasks.filter((t) => t.status === 'Overdue').length} overdue
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Overdue
              </span>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="relative w-full h-56 pt-2">
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none pb-7">
              <div className="flex items-center border-b border-slate-100 pb-0.5 w-full">
                <span className="w-6 text-right pr-2">20</span>
                <div className="w-full border-b border-slate-100"></div>
              </div>
              <div className="flex items-center border-b border-slate-100 pb-0.5 w-full">
                <span className="w-6 text-right pr-2">15</span>
                <div className="w-full border-b border-slate-100"></div>
              </div>
              <div className="flex items-center border-b border-slate-100 pb-0.5 w-full">
                <span className="w-6 text-right pr-2">10</span>
                <div className="w-full border-b border-slate-100"></div>
              </div>
              <div className="flex items-center border-b border-slate-100 pb-0.5 w-full">
                <span className="w-6 text-right pr-2">5</span>
                <div className="w-full border-b border-slate-100"></div>
              </div>
              <div className="flex items-center border-b border-slate-200 pb-0.5 w-full">
                <span className="w-6 text-right pr-2">0</span>
                <div className="w-full border-b border-slate-200"></div>
              </div>
            </div>

            <div className="relative h-[calc(100%-28px)] ml-7 flex justify-around items-end pt-4">
              {/* Sprint 35 */}
              <div
                onClick={() => setCurrentSprintFilter('Sprint 35')}
                className="flex flex-col items-center cursor-pointer group"
                title="Sprint 35: Click to filter"
              >
                <div className="flex items-end gap-1.5 h-44">
                  <div className="w-4 bg-emerald-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '80%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">16</span>
                  </div>
                  <div className="w-4 bg-blue-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '60%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">12</span>
                  </div>
                  <div className="w-4 bg-rose-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '10%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">2</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold mt-2 transition-colors ${currentSprintFilter === 'Sprint 35' ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>
                  Sprint 35
                </span>
              </div>

              {/* Sprint 36 */}
              <div
                onClick={() => setCurrentSprintFilter('Sprint 36')}
                className="flex flex-col items-center cursor-pointer group"
                title="Sprint 36: Click to filter"
              >
                <div className="flex items-end gap-1.5 h-44">
                  <div className="w-4 bg-emerald-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '70%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">14</span>
                  </div>
                  <div className="w-4 bg-blue-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '55%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">11</span>
                  </div>
                  <div className="w-4 bg-rose-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '35%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">7</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold mt-2 transition-colors ${currentSprintFilter === 'Sprint 36' ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>
                  Sprint 36
                </span>
              </div>

              {/* Sprint 37 */}
              <div
                onClick={() => setCurrentSprintFilter('Sprint 37')}
                className="flex flex-col items-center cursor-pointer group"
                title="Sprint 37: Click to filter"
              >
                <div className="flex items-end gap-1.5 h-44">
                  <div className="w-4 bg-emerald-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '50%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">10</span>
                  </div>
                  <div className="w-4 bg-blue-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '45%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">9</span>
                  </div>
                  <div className="w-4 bg-rose-500 rounded-t-xs flex flex-col justify-start items-center hover:opacity-90" style={{ height: '15%' }}>
                    <span className="text-[9px] text-slate-600 font-bold -mt-4">3</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold mt-2 transition-colors ${currentSprintFilter === 'Sprint 37' ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>
                  Sprint 37
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Open Sprints Health */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Open Sprints Health</h3>
            <span className="material-symbols-outlined text-[18px] text-slate-400">
              trending_up
            </span>
          </div>
          <div className="space-y-4">
            {SPRINT_LIST.map((sprint) => (
              <div key={sprint.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{sprint.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        sprint.badge === 'On Track'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : sprint.badge === 'At Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sprint.badge === 'On Track'
                            ? 'bg-emerald-500'
                            : sprint.badge === 'At Risk'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      ></span>
                      {sprint.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{sprint.progress}%</span>
                    <button
                      onClick={() => setCurrentSprintFilter(sprint.name)}
                      className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Filter <span>→</span>
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      sprint.badge === 'On Track'
                        ? 'bg-emerald-500'
                        : sprint.badge === 'At Risk'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sprint.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>
                    {sprint.completedTasks}/{sprint.totalTasks} tasks completed
                  </span>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-rose-500">⚠️ {sprint.overdueTasks} overdue</span>
                    <span className="text-amber-500">⚡ {sprint.atRiskTasks} at risk</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Management Section With Right Detail Drawer */}
      <section className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Main Table Container */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Sprint Filter Tabs: "All open sprints", "Sprint 35", "Sprint 36", "Sprint 37" */}
          <div className="flex items-center border-b border-slate-200 px-5 pt-3 gap-6 text-xs font-semibold">
            {['All open sprints', 'Sprint 35', 'Sprint 36', 'Sprint 37'].map((sp) => (
              <button
                key={sp}
                onClick={() => setCurrentSprintFilter(sp)}
                className={`pb-3 transition-colors cursor-pointer ${
                  currentSprintFilter === sp
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by ID, summary, or project..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-blue-500">
                  calendar_today
                </span>
                <span>Due date (Nearest)</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">
                  expand_more
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-slate-500">tune</span>
                <span>Filters</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        selectedTaskIds.length === filteredTasks.length &&
                        filteredTasks.length > 0
                      }
                      onChange={(e) =>
                        setSelectedTaskIds(
                          e.target.checked ? filteredTasks.map((t) => t.id) : []
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2">Sprint</th>
                  <th className="py-3 px-3">Task Name</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 w-28">Progress</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const isSelected = activeTask.id === task.id;
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/50 hover:bg-blue-50/70'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td
                        className="py-3 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskIds((prev) =>
                            prev.includes(task.id)
                              ? prev.filter((id) => id !== task.id)
                              : [...prev, task.id]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            task.sprint === 'Sprint 35'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : task.sprint === 'Sprint 36'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}
                        >
                          {task.sprint}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div className="hover:text-blue-600 transition-colors font-bold text-slate-900">
                          {task.title}
                        </div>
                        {task.subtitle && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            {task.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {task.project}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full ${task.owner.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                          >
                            {task.owner.initials}
                          </div>
                          <span className="text-slate-700 text-xs truncate">
                            {task.owner.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'Critical'
                              ? 'bg-rose-50 text-rose-600'
                              : task.priority === 'High'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            task.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : task.status === 'At Risk'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : task.status === 'Blocked'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {task.progress}%
                          </span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-3 font-semibold ${
                          task.dueDate === 'Today' ? 'text-rose-500' : 'text-slate-600'
                        }`}
                      >
                        {task.dueDate}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          Resolve{' '}
                          <span className="material-symbols-outlined text-[14px]">
                            north_east
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 text-slate-400"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button className="w-6 h-6 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </button>
              <button className="w-6 h-6 rounded hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                2
              </button>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-600">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Task Detail Drawer */}
        <aside
          id="task-detail-drawer"
          aria-label="Task Detail Drawer"
          className="w-full xl:w-96 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between shrink-0 sticky top-20"
        >
          <div>
            {/* Header with Badges */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    activeTask.priority === 'Critical'
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}
                >
                  {activeTask.priority}
                </span>
                <span className="text-xs font-bold text-slate-700">{activeTask.id}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{activeTask.sprint}</span>
            </div>

            {/* Title */}
            <div className="mt-3">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {activeTask.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTask.project} • {activeTask.sprint}
              </p>
            </div>

            {/* Metadata Properties */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">person</span>
                  Owner
                </span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full ${activeTask.owner.avatarBg} text-white font-bold text-[8px] flex items-center justify-center`}
                  >
                    {activeTask.owner.initials}
                  </div>
                  <span className="text-slate-800 font-medium">
                    {activeTask.owner.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">flag</span>
                  Priority
                </span>
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{' '}
                  {activeTask.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Status
                </span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    activeTask.status === 'Overdue'
                      ? 'text-rose-600'
                      : activeTask.status === 'Blocked'
                      ? 'text-red-700'
                      : 'text-blue-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeTask.status === 'Overdue'
                        ? 'bg-rose-500'
                        : activeTask.status === 'Blocked'
                        ? 'bg-red-600'
                        : 'bg-blue-500'
                    }`}
                  ></span>{' '}
                  {activeTask.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">trending_up</span>
                  Progress
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold text-xs">
                    {activeTask.progress}%
                  </span>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${activeTask.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                  Due Date
                </span>
                <span className="text-rose-500 font-medium">{activeTask.dueDate}</span>
              </div>
            </div>

            {/* Recommended Actions Section */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-2.5">
                Recommended Actions
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActionModalType('reassign')}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-[11px] justify-start shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-blue-500">
                    person_add
                  </span>
                  Reassign Owner
                </button>
                <button
                  type="button"
                  onClick={() => setActionModalType('dueDate')}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-[11px] justify-start shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-blue-500">
                    edit_calendar
                  </span>
                  Update Due Date
                </button>
                <button
                  type="button"
                  onClick={() => setActionModalType('comment')}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-[11px] justify-start shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-blue-500">
                    chat_bubble
                  </span>
                  Add Comment
                </button>
                <button
                  type="button"
                  onClick={() => setActionModalType('blocked')}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300 font-medium text-[11px] justify-start shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-rose-500">
                    block
                  </span>
                  Mark as Blocked
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActionModalType('status')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Update Status</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};
