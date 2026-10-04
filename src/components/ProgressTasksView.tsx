import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { SPRINT_DATA } from '@/data/appData';
import { RiskMatrixItem, TaskItem } from '../types';
import { parseFlexibleDate } from '../utils/dateFormat';
import { TaskActionModal, TaskActionType } from './TaskActionModal';

const ALL_OPEN_SPRINTS = 'All Open Sprints';

interface ProgressTasksViewProps {
  tasks: TaskItem[];
  risks: RiskMatrixItem[];
  selectedSprint: string;
  onSelectSprint: (sprint: string) => void;
  onToggleTask?: (id: string) => void;
  onUpdateTask?: (task: TaskItem) => void;
}

export const ProgressTasksView: React.FC<ProgressTasksViewProps> = ({
  tasks,
  risks,
  selectedSprint,
  onSelectSprint,
  onToggleTask,
  onUpdateTask
}) => {
  // Navigation state: 'overview' (Left Screen) vs 'all-tasks' (Right Screen)
  const [viewMode, setViewMode] = useState<'overview' | 'all-tasks'>('overview');

  // Shared Filters
  const currentSprint = selectedSprint;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('due-nearest');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sprintProgressRange, setSprintProgressRange] = useState<'Last 4 sprints' | 'Last 6 sprints'>('Last 4 sprints');

  // Overview screen active tab: 'in-progress' | 'overdue' | 'completed'
  const [overviewTab, setOverviewTab] = useState<'in-progress' | 'overdue' | 'completed'>('in-progress');

  // Rows per page & pagination
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAllOverviewTasks, setShowAllOverviewTasks] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [resolveTaskDetail, setResolveTaskDetail] = useState<TaskItem | null>(null);
  const [tableSprintFilter, setTableSprintFilter] = useState<string>('All open sprints');

  // Dropdown toggles
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStatusCardDropdown, setShowStatusCardDropdown] = useState(false);
  const [showSprintProgressRangeDropdown, setShowSprintProgressRangeDropdown] = useState(false);
  const [showOverdueReview, setShowOverdueReview] = useState(false);
  const [showAtRiskReview, setShowAtRiskReview] = useState(false);
  const [showTodayDueReview, setShowTodayDueReview] = useState(false);
  const [taskAction, setTaskAction] = useState<{ type: TaskActionType; task: TaskItem } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sprint Progress Chart interactive hover
  const [hoveredSprint, setHoveredSprint] = useState<string | null>(null);
  const todayLabel = new Intl.DateTimeFormat('en-GB').format(new Date());
  const baseSprintOptions = Object.keys(SPRINT_DATA);
  const openSprintOptions = baseSprintOptions.filter((sprint) =>
    tasks.some((task) => task.sprint === sprint && (task.status !== 'Completed' || task.status === 'Overdue'))
  );
  const isAllOpenSprints = currentSprint === ALL_OPEN_SPRINTS;
  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const parseTaskDueDate = (dueDate: string) => parseFlexibleDate(dueDate);
  const sprintTasks = useMemo(
    () => tasks.filter((task) => (isAllOpenSprints ? task.sprint && openSprintOptions.includes(task.sprint) : task.sprint === currentSprint)),
    [tasks, currentSprint, isAllOpenSprints, openSprintOptions]
  );
  const currentSprintRiskCount = risks.filter((risk) =>
    isAllOpenSprints ? risk.sprint && openSprintOptions.includes(risk.sprint) : risk.sprint === currentSprint
  ).length;
  const formatRate = (count: number, total: number) => `${total ? Math.round((count / total) * 100) : 0}%`;
  const buildTaskStats = (taskList: TaskItem[]) => {
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter((task) => task.status === 'Completed').length;
    const inProgressTasks = taskList.filter((task) => task.status === 'In Progress').length;
    const pendingTasks = taskList.filter((task) => task.status === 'Pending' || task.status === 'To Do').length;
    const overdueTasks = taskList.filter((task) => task.status === 'Overdue').length;

    return {
      totalTasks,
      completedTasks,
      completedRate: formatRate(completedTasks, totalTasks),
      inProgressTasks,
      inProgressRate: formatRate(inProgressTasks, totalTasks),
      pendingTasks,
      pendingRate: formatRate(pendingTasks, totalTasks),
      overdueTasks,
      overdueRate: formatRate(overdueTasks, totalTasks)
    };
  };
  const currentSprintStats = buildTaskStats(sprintTasks);

  // Filtered tasks logic
  const filteredTasks = useMemo(() => {
    return sprintTasks.filter((t) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesOwner = t.owner.name.toLowerCase().includes(q);
        const matchesProject = t.project?.toLowerCase().includes(q) ?? false;
        const matchesId = t.id.toLowerCase().includes(q) || (t.st ? `st ${t.st}`.includes(q) : false);
        if (!matchesTitle && !matchesOwner && !matchesProject && !matchesId) {
          return false;
        }
      }

      // Status filter
      if (filterStatus === 'not-completed' && t.status === 'Completed') return false;
      if (filterStatus !== 'all' && filterStatus !== 'not-completed' && t.status !== filterStatus) return false;

      // Priority filter
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

      return true;
    });
  }, [sprintTasks, searchQuery, filterStatus, filterPriority]);

  // Specific tasks for overview tab
  const overviewTabTasks = useMemo(() => {
    if (overviewTab === 'in-progress') {
      const statusOrder: Record<string, number> = {
        'In Progress': 0,
        Overdue: 1,
        'To Do': 2
      };

      return sprintTasks
        .filter((t) => t.status !== 'Completed')
        .sort((a, b) => {
          const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
          if (statusDiff !== 0) return statusDiff;
          return (a.st ?? 0) - (b.st ?? 0);
        });
    } else if (overviewTab === 'overdue') {
      return sprintTasks.filter((t) => t.status === 'Overdue');
    } else {
      return sprintTasks.filter((t) => t.status === 'Completed');
    }
  }, [sprintTasks, overviewTab]);

  const inProgressTaskCount = sprintTasks.filter((t) => t.status !== 'Completed').length;
  const overdueTaskCount = sprintTasks.filter((t) => t.status === 'Overdue').length;
  const overdueTasks = sprintTasks.filter((t) => t.status === 'Overdue');
  const tableSprintOptions = ['All open sprints', ...openSprintOptions];
  const scopedRisks = risks.filter((risk) =>
    isAllOpenSprints ? risk.sprint && openSprintOptions.includes(risk.sprint) : risk.sprint === currentSprint
  );
  const atRiskTasks = Array.from(
    new Map(
      scopedRisks
        .filter((risk) => !['Mitigated', 'Completed'].includes(risk.status))
        .map((risk) => {
          const matchedTask =
            sprintTasks.find(
              (task) =>
                (!risk.sprint || task.sprint === risk.sprint) &&
                task.status !== 'Completed' &&
                task.owner.name === risk.owner &&
                (task.project === risk.affectedFunction || task.status === risk.status)
            ) ||
            sprintTasks.find(
              (task) =>
                (!risk.sprint || task.sprint === risk.sprint) &&
                task.status !== 'Completed' &&
                (task.project === risk.affectedFunction || task.owner.name === risk.owner)
            );

          return matchedTask ? [matchedTask.id, matchedTask] : undefined;
        })
        .filter((item): item is [string, TaskItem] => Boolean(item))
    ).values()
  );
  const atRiskTaskCount = atRiskTasks.length;
  const completedTaskCount = sprintTasks.filter((t) => t.status === 'Completed').length;
  const tableOverviewTasks =
    isAllOpenSprints && tableSprintFilter !== 'All open sprints'
      ? overviewTabTasks.filter((task) => task.sprint === tableSprintFilter)
      : overviewTabTasks;
  const overviewTotalPages = Math.max(1, Math.ceil(tableOverviewTasks.length / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const visibleAllTasks = filteredTasks;
  const displayedOverviewTasks = showAllOverviewTasks
    ? tableOverviewTasks
    : tableOverviewTasks.slice(pageStart, pageStart + rowsPerPage);
  const visibleAllTasksCount = visibleAllTasks.length;
  const visibleOverviewTasksCount = displayedOverviewTasks.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, rowsPerPage, searchQuery, filterStatus, filterPriority, overviewTab]);

  useEffect(() => {
    setShowAllOverviewTasks(false);
  }, [currentSprint, overviewTab]);

  useEffect(() => {
    setTableSprintFilter('All open sprints');
  }, [currentSprint, isAllOpenSprints]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, overviewTotalPages));
  }, [overviewTotalPages]);

  const handleViewAllTasks = () => {
    setShowAllOverviewTasks((value) => !value);
  };

  const handleReviewOverdueTasks = () => {
    setShowOverdueReview(true);
  };

  const handleReviewAtRiskTasks = () => {
    setShowAtRiskReview(true);
  };
  const getSprintOwnerOptions = (task?: TaskItem) => {
    if (!task?.sprint) return [];

    const ownersByName = new Map<string, TaskItem['owner']>();
    tasks
      .filter((item) => item.sprint === task.sprint)
      .forEach((item) => {
        if (!ownersByName.has(item.owner.name)) {
          ownersByName.set(item.owner.name, item.owner);
        }
      });

    return Array.from(ownersByName.values());
  };
  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2400);
  };
  const handleSaveTaskAction = (updatedTask: TaskItem, message: string) => {
    onUpdateTask?.(updatedTask);
    setResolveTaskDetail((current) => (current?.id === updatedTask.id ? updatedTask : current));
    showToast(message);
  };

  const handleReviewTodayDueTasks = () => {
    setShowTodayDueReview(true);
  };

  // Export handler
  const handleExport = () => {
    const header = 'ST,Task ID,Task Name,Project,Owner,Priority,Status,Progress,Due Date\n';
    const rows = sprintTasks
      .map(
        (t) =>
          `"${t.st || ''}","${t.id}","${t.title}","${t.project || ''}","${t.owner.name}","${t.priority}","${t.status}","${t.progress}%","${t.dueDate}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PMA_Tasks_Export_${currentSprint.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sprintChartData = baseSprintOptions.map((sprint) => {
    const stats = buildTaskStats(tasks.filter((task) => task.sprint === sprint));

    return {
      sprint,
      completed: stats.completedTasks,
      inProgress: stats.inProgressTasks,
      toDo: stats.pendingTasks,
      overdue: stats.overdueTasks,
      isCurrent: sprint === currentSprint
    };
  });
  const currentSprintIndex = baseSprintOptions.indexOf(currentSprint);
  const sprintProgressOptions = isAllOpenSprints
    ? openSprintOptions
    : sprintChartData
        .slice(
          Math.max(
            0,
            currentSprintIndex -
              (sprintProgressRange === 'Last 4 sprints' ? 3 : 5)
          ),
          currentSprintIndex + 1
        )
        .map((item) => item.sprint);
  const visibleSprintChartData = sprintChartData.filter((item) => sprintProgressOptions.includes(item.sprint));

  const maxVal = Math.max(
    1,
    ...visibleSprintChartData.flatMap((item) => [item.completed, item.inProgress, item.overdue])
  );
  const chartMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
  const chartTicks = Array.from({ length: 5 }, (_, index) => Math.round(chartMax - (chartMax / 4) * index));
  const openSprintTaskCount = visibleSprintChartData.reduce(
    (total, item) => total + item.completed + item.inProgress + item.toDo + item.overdue,
    0
  );
  const openSprintOverdueCount = visibleSprintChartData.reduce((total, item) => total + item.overdue, 0);
  const currentTotalTasks = currentSprintStats.totalTasks || 0;
  const completedRate = currentSprintStats.completedRate || formatRate(currentSprintStats.completedTasks, currentTotalTasks);
  const inProgressRate =
    currentSprintStats.inProgressRate || formatRate(currentSprintStats.inProgressTasks, currentTotalTasks);
  const pendingRate = currentSprintStats.pendingRate || formatRate(currentSprintStats.pendingTasks, currentTotalTasks);
  const overdueRate = currentSprintStats.overdueRate || formatRate(currentSprintStats.overdueTasks, currentTotalTasks);
  const openSprintStatusRows = openSprintOptions.map((sprint) => {
    const sprintTaskList = tasks.filter((task) => task.sprint === sprint);
    const sprintStats = buildTaskStats(sprintTaskList);
    const progress = sprintStats.totalTasks
      ? Math.round((sprintStats.completedTasks / sprintStats.totalTasks) * 100)
      : 0;
    const sprintRiskCount = risks.filter(
      (risk) => risk.sprint === sprint && !['Mitigated', 'Completed'].includes(risk.status)
    ).length;
    const badge = sprintStats.overdueTasks > 0 ? 'At Risk' : progress >= 70 ? 'On Track' : 'Delay Risk';

    return {
      sprint,
      progress,
      badge,
      completedTasks: sprintStats.completedTasks,
      totalTasks: sprintStats.totalTasks,
      overdueTasks: sprintStats.overdueTasks,
      atRiskTasks: sprintRiskCount
    };
  });
  const previousSprint = !isAllOpenSprints && currentSprintIndex > 0 ? baseSprintOptions[currentSprintIndex - 1] : undefined;
  const previousSprintStats = previousSprint
    ? buildTaskStats(tasks.filter((task) => task.sprint === previousSprint))
    : undefined;
  const previousSprintRiskCount = previousSprint
    ? risks.filter((risk) => risk.sprint === previousSprint).length
    : 0;
  const atRiskDelta = currentSprintRiskCount - previousSprintRiskCount;
  const sprintVelocity = currentTotalTasks
    ? Math.round((currentSprintStats.completedTasks / currentTotalTasks) * 10000) / 100
    : 0;
  const previousSprintVelocity =
    previousSprintStats && previousSprintStats.totalTasks
      ? Math.round((previousSprintStats.completedTasks / previousSprintStats.totalTasks) * 10000) / 100
      : 0;
  const sprintVelocityDelta = sprintVelocity - previousSprintVelocity;
  const formattedSprintVelocity = sprintVelocity.toFixed(2);
  const formattedSprintVelocityDelta = Math.abs(sprintVelocityDelta).toFixed(2);
  const todayDateKey = getDateKey(new Date());
  const todayDueTasks = sprintTasks.filter((task) => {
    const dueDate = parseTaskDueDate(task.dueDate);
    return dueDate ? getDateKey(dueDate) === todayDateKey : false;
  });
  const todayDueTaskCount = todayDueTasks.length;

  // Helper for project dot colors
  const getProjectDotColor = (proj?: string) => {
    if (!proj) return 'bg-slate-400';
    if (proj.includes('Cloud')) return 'bg-cyan-500';
    if (proj.includes('Core')) return 'bg-blue-600';
    if (proj.includes('Security') || proj.includes('Audit')) return 'bg-indigo-500';
    if (proj.includes('Operational')) return 'bg-amber-500';
    return 'bg-purple-500';
  };

  // =========================================================================
  // SCREEN 2: ALL TASKS FULL DASHBOARD (MÀN HÌNH BÊN TAY PHẢI)
  // =========================================================================
  if (viewMode === 'all-tasks') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-200">
        {toastMessage && (
          <div className="fixed top-20 right-6 z-70 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            {toastMessage}
          </div>
        )}

        <TaskActionModal
          action={taskAction}
          ownerOptions={getSprintOwnerOptions(taskAction?.task)}
          onClose={() => setTaskAction(null)}
          onSave={handleSaveTaskAction}
        />

        {/* Top Header Breadcrumb & Context Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span className="hover:text-[#0f172a] cursor-pointer">Workspace</span>
            <span className="text-[#94a3b8]">&gt;</span>
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className="hover:text-[#1877f2] font-medium cursor-pointer transition-colors"
            >
              Progress Task
            </button>
            <span className="text-[#94a3b8]">&gt;</span>
            <span className="text-[#0f172a] font-semibold">All Tasks Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#0f172a]">John Doe</div>
                <div className="text-[10px] text-[#64748b]">PM</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1877f2] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                JD
              </div>
            </div>
          </div>
        </div>

        {/* Back Button Navigation */}
        <div>
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1877f2] hover:text-[#166fe5] hover:underline transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">
              arrow_back
            </span>
            Back to Progress Task
          </button>
        </div>

        {/* Title Bar & Filter / Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">All Tasks</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1877f2] border border-[#bfdbfe]">
              {currentSprint}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold shadow-2xs transition-colors ${
                  filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'border-[#1877f2] text-[#1877f2]'
                    : 'border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#64748b]">tune</span>
                <span>Filter</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 p-3 text-xs space-y-3">
                  <div>
                    <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-1">Status</span>
                    <div className="grid grid-cols-2 gap-1">
                      {['all', 'Completed', 'In Progress', 'Overdue', 'To Do'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFilterStatus(st)}
                          className={`px-2 py-1 rounded text-left font-medium ${
                            filterStatus === st ? 'bg-[#1877f2] text-white' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#edf2f7]'
                          }`}
                        >
                          {st === 'all' ? 'All' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-1">Priority</span>
                    <div className="grid grid-cols-2 gap-1">
                      {['all', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFilterPriority(p)}
                          className={`px-2 py-1 rounded text-left font-medium ${
                            filterPriority === p ? 'bg-[#1877f2] text-white' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#edf2f7]'
                          }`}
                        >
                          {p === 'all' ? 'All' : p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(filterStatus !== 'all' || filterPriority !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterPriority('all');
                      }}
                      className="w-full text-center py-1 text-[11px] text-red-600 font-semibold hover:underline"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors"
              >
                <span>Sort: Due Date (Nearest)</span>
                <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">expand_more</span>
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {[
                    { label: 'Due Date (Nearest)', val: 'due-nearest' },
                    { label: 'Priority (High to Low)', val: 'priority-desc' },
                    { label: 'Progress (% Complete)', val: 'progress-desc' },
                    { label: 'Task ST Number', val: 'st-asc' }
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => {
                        setSortOption(s.val);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#f8fafc] font-medium ${
                        sortOption === s.val ? 'text-[#1877f2] font-semibold bg-[#eff6ff]' : 'text-[#0f172a]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Sub-toolbar: All Tasks Tab & Search with ⌘K */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#edf2f7] shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] transition-colors"
            >
              All Tasks ({filteredTasks.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by ID, name, project..."
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:bg-white focus:outline-none focus:border-[#1877f2] transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#e2e8f0] text-[#64748b]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Full All Tasks Table */}
        <div className="bg-white rounded-xl border border-[#edf2f7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-[#edf2f7] tracking-wider uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">ST</th>
                  <th className="py-3 px-3">TASK NAME</th>
                  <th className="py-3 px-3">PROJECT</th>
                  <th className="py-3 px-3">OWNER</th>
                  <th className="py-3 px-3">PRIORITY</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-4 w-44">PROGRESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {visibleAllTasks.map((t, idx) => {
                  const isCompleted = t.status === 'Completed';
                  const stNumber = t.st || idx + 1;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[#f8fafc]/90 transition-colors group cursor-pointer"
                      onClick={() => onToggleTask && onToggleTask(t.id)}
                    >
                      {/* Checkbox & ST Number */}
                      <td className="py-3.5 px-4 text-center">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask && onToggleTask(t.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => onToggleTask && onToggleTask(t.id)}
                            className="w-4 h-4 rounded text-[#1877f2] border-slate-300 focus:ring-[#1877f2] cursor-pointer"
                          />
                          <span className="font-mono text-xs font-semibold text-[#64748b]">
                            {stNumber}
                          </span>
                        </div>
                      </td>

                      {/* Task Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold transition-all ${
                              isCompleted
                                ? 'line-through text-[#94a3b8]'
                                : 'text-[#0f172a] group-hover:text-[#1877f2]'
                            }`}
                          >
                            {t.title}
                          </span>
                          {t.agentValidation && (
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              {t.agentValidation}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f8fafc] text-[#334155] border border-[#e2e8f0]">
                          <span className={`w-1.5 h-1.5 rounded-full ${getProjectDotColor(t.project)}`}></span>
                          {t.project || 'PMA Core Engine'}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full ${t.owner.avatarColor} text-white text-[10px] font-bold flex items-center justify-center shadow-2xs`}
                          >
                            {t.owner.initials}
                          </div>
                          <span className="font-medium text-[#0f172a]">{t.owner.name}</span>
                        </div>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            t.priority === 'Critical'
                              ? 'bg-[#fee2e2] text-[#dc2626]'
                              : t.priority === 'High'
                              ? 'bg-[#ffedd5] text-[#ea580c]'
                              : t.priority === 'Medium'
                              ? 'bg-[#e0f2fe] text-[#0284c7]'
                              : 'bg-[#f1f5f9] text-[#64748b]'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            t.status === 'Completed'
                              ? 'text-emerald-600'
                              : t.status === 'Overdue'
                              ? 'text-red-600'
                              : t.status === 'To Do'
                              ? 'text-slate-500'
                              : 'text-[#1877f2]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'Completed'
                                ? 'bg-emerald-500'
                                : t.status === 'Overdue'
                                ? 'bg-red-500'
                                : t.status === 'To Do'
                                ? 'bg-slate-400'
                                : 'bg-[#1877f2]'
                            }`}
                          ></span>
                          {t.status}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                t.status === 'Completed'
                                  ? 'bg-emerald-500'
                                  : t.status === 'Overdue'
                                  ? 'bg-red-500'
                                  : t.status === 'To Do'
                                  ? 'bg-slate-300'
                                  : 'bg-[#1877f2]'
                              }`}
                              style={{ width: `${t.progress}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-[#0f172a] w-8 text-right">
                            {t.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-4 bg-white border-t border-[#edf2f7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748b]">
            <div>
              Hiển thị <span className="font-bold text-[#0f172a]">{visibleAllTasksCount}</span> trên{' '}
              <span className="font-bold text-[#0f172a]">{filteredTasks.length}</span> tasks
            </div>

            <span className="font-semibold text-[#0f172a]">Đang hiển thị tất cả</span>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: PROGRESS TASK OVERVIEW - WITH VIEW ALL (MÀN HÌNH BÊN TAY TRÁI)
  // =========================================================================
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-70 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      <TaskActionModal
        action={taskAction}
        ownerOptions={getSprintOwnerOptions(taskAction?.task)}
        onClose={() => setTaskAction(null)}
        onSave={handleSaveTaskAction}
      />

      {/* 1. Top Header with Breadcrumbs, Badges, and Selectors */}
      <div className="flex flex-col gap-3 pb-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span>Workspace</span>
            <span className="text-[#94a3b8]">&gt;</span>
            <span className="text-[#0f172a] font-semibold">Overview</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Export button */}
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors cursor-pointer font-display"
            >
              <span className="material-symbols-outlined text-[16px] text-[#64748b]">download</span>
              Export
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Progress Task</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase bg-[#eff6ff] text-[#1877f2] border border-[#bfdbfe]">
              WORKSPACE FEED
            </span>
          </div>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Manage and track your assigned work across all projects.
          </p>
        </div>
      </div>

      {(showOverdueReview || showAtRiskReview || showTodayDueReview) && (() => {
        const isAtRiskReview = showAtRiskReview;
        const isTodayDueReview = showTodayDueReview;
        const reviewTasks = isTodayDueReview ? todayDueTasks : isAtRiskReview ? atRiskTasks : overdueTasks;
        const reviewTitle = isTodayDueReview ? "Today's Due Tasks" : isAtRiskReview ? 'At Risk Tasks' : 'Overdue Tasks';
        const reviewSubtitle = isTodayDueReview
          ? `Displaying all ${reviewTasks.length} tasks scheduled for completion today in ${currentSprint}`
          : isAtRiskReview
          ? `Displaying all ${reviewTasks.length} tasks linked to active risks in ${currentSprint}`
          : `Displaying all ${reviewTasks.length} overdue tasks in ${currentSprint}`;
        const reviewIcon = isTodayDueReview ? 'calendar_today' : isAtRiskReview ? 'bolt' : 'warning';
        const reviewIconClass = isTodayDueReview
          ? 'text-blue-500 bg-blue-50'
          : isAtRiskReview
          ? 'text-amber-500 bg-amber-50'
          : 'text-rose-500 bg-rose-50';
        const reviewBadgeClass = isAtRiskReview
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : isTodayDueReview
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-rose-50 text-rose-700 border-rose-200';
        const closeReview = () => {
          setShowOverdueReview(false);
          setShowAtRiskReview(false);
          setShowTodayDueReview(false);
        };

        return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reviewIconClass}`}>
                  <span className="material-symbols-outlined text-[18px]">{reviewIcon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{reviewTitle}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${reviewBadgeClass}`}>
                      {reviewTasks.length} tasks
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {reviewSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeReview}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close task review"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100/80">
              {reviewTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1">task_alt</span>
                  <p className="text-xs font-medium">No tasks found in this category.</p>
                </div>
              ) : (
                reviewTasks.map((task, index) => (
                  <div key={task.id} className={index > 0 ? 'pt-3.5' : ''}>
                    <div className="p-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all space-y-3 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
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
                          <span className="text-[11px] text-slate-500 font-medium truncate">
                            {task.project || 'PMA Agent'} - {task.sprint || currentSprint}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100/70 text-rose-700">
                            {task.status}
                          </span>
                          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded border border-rose-100">
                            Due: {task.dueDate}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full ${task.owner.avatarColor} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                            {task.owner.initials}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{task.owner.name}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-[130px]">
                          <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                task.progress >= 70 ? 'bg-emerald-500' : task.progress >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{task.progress}%</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                          Recommended Actions for PM:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {[
                            ['person_add', 'Reassign', 'reassign'],
                            ['edit_calendar', 'Due Date', 'dueDate'],
                            ['chat_bubble', 'Comment', 'comment'],
                            ['block', 'Mark Blocked', 'blocked']
                          ].map(([icon, label, actionType]) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                closeReview();
                                setTaskAction({ type: actionType as TaskActionType, task });
                              }}
                              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs ${
                                icon === 'block' ? 'hover:bg-rose-50 hover:border-rose-300' : 'hover:bg-blue-50 hover:border-blue-300'
                              }`}
                            >
                              <span className={`material-symbols-outlined text-[14px] ${icon === 'block' ? 'text-rose-600' : 'text-blue-600'}`}>
                                {icon}
                              </span>
                              <span className="truncate">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Total: <strong className="text-slate-800">{reviewTasks.length}</strong> tasks in category
              </span>
              <button
                type="button"
                onClick={closeReview}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
        );
      })()}

      {/* 2. Four KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overdue Tasks */}
        <div className="p-4 rounded-xl bg-white border border-[#edf2f7] shadow-xs flex flex-col justify-between gap-3 hover:border-rose-200 hover:shadow-sm transition-all group">
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b]">Overdue Tasks</div>
            <div className="text-2xl font-extrabold text-[#0f172a] mt-1">{overdueTaskCount}</div>
            <div className="text-[11px] font-semibold text-red-500 flex items-center gap-0.5 mt-1">
              <span>↑</span> +2 vs last sprint
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          </div>
          <button
            type="button"
            onClick={handleReviewOverdueTasks}
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/70 group-hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Review Tasks ({overdueTaskCount})</span>
            <span className="material-symbols-outlined text-[15px] ml-1">arrow_forward</span>
          </button>
        </div>

        {/* Card 2: At Risk Tasks */}
        <div className="p-4 rounded-xl bg-white border border-[#edf2f7] shadow-xs flex flex-col justify-between gap-3 hover:border-amber-200 hover:shadow-sm transition-all group">
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b]">At Risk Tasks</div>
            <div className="text-2xl font-extrabold text-[#0f172a] mt-1">{atRiskTaskCount}</div>
            <div
              className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${
                atRiskDelta > 0 ? 'text-red-500' : atRiskDelta < 0 ? 'text-emerald-600' : 'text-[#64748b]'
              }`}
            >
              <span>{atRiskDelta > 0 ? '↑' : atRiskDelta < 0 ? '↓' : '→'}</span>
              {atRiskDelta > 0 ? '+' : ''}
              {atRiskDelta} vs last sprint
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
          </div>
          <button
            type="button"
            onClick={handleReviewAtRiskTasks}
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/70 group-hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Review Tasks ({atRiskTaskCount})</span>
            <span className="material-symbols-outlined text-[15px] ml-1">arrow_forward</span>
          </button>
        </div>

        {/* Card 3: Sprint Velocity */}
        <div className="p-4 rounded-xl bg-white border border-[#edf2f7] shadow-xs flex flex-col justify-between gap-3 hover:border-blue-200 hover:shadow-sm transition-all group">
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b]">Sprint Velocity</div>
            <div className="text-2xl font-extrabold text-[#0f172a] mt-1">{formattedSprintVelocity}%</div>
            <div
              className={`${isAllOpenSprints ? 'hidden' : 'flex'} text-[11px] font-semibold items-center gap-0.5 mt-1 ${
                sprintVelocityDelta >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              <span>{sprintVelocityDelta >= 0 ? '↑' : '↓'}</span>
              {sprintVelocityDelta >= 0 ? '+' : ''}
              {formattedSprintVelocityDelta}% vs last sprint
            </div>
            {isAllOpenSprints && (
              <div className="text-[11px] font-semibold text-[#64748b] flex items-center gap-0.5 mt-1">
                Aggregate scope
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </div>
        </div>
        </div>

        {/* Card 4: Today's Due */}
        <div className="p-4 rounded-xl bg-white border border-[#edf2f7] shadow-xs flex flex-col justify-between gap-4 hover:border-blue-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <div className="text-xs font-bold text-slate-700">Today's Due</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0f172a] leading-none">{todayDueTaskCount}</div>
            <div className="text-[11px] font-semibold text-[#64748b] flex items-center gap-1 mt-1">
              <span>→</span> 0 vs yesterday
            </div>
          </div>
          <button
            type="button"
            onClick={handleReviewTodayDueTasks}
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/70 group-hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Review Tasks ({todayDueTaskCount})</span>
            <span className="text-[13px] ml-1">-&gt;</span>
          </button>
        </div>

      </div>

      {/* 3. Sprint analytics from the approved design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Card: Open Sprint Progress grouped bar chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-500">insights</span>
                  Open Sprint Progress
                </h3>
                <p className="hidden">
                  • {openSprintTaskCount} total tasks across open sprints • {openSprintOverdueCount} overdue
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {openSprintTaskCount} total tasks across {isAllOpenSprints ? 'open sprints' : sprintProgressRange.toLowerCase()} - {openSprintOverdueCount} overdue
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
                {!isAllOpenSprints && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSprintProgressRangeDropdown(!showSprintProgressRangeDropdown)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{sprintProgressRange}</span>
                      <span className="material-symbols-outlined text-[15px] text-slate-400">expand_more</span>
                    </button>
                    {showSprintProgressRangeDropdown && (
                      <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30">
                        {(['Last 4 sprints', 'Last 6 sprints'] as const).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSprintProgressRange(option);
                              setShowSprintProgressRangeDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                              sprintProgressRange === option
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue
                </span>
              </div>
            </div>

            {/* Custom Bar Chart */}
            <div className="relative h-56 w-full pt-2">
              {/* Y Axis Gridlines */}
              <div className="absolute inset-x-8 top-0 bottom-9 flex flex-col justify-between pointer-events-none">
                {chartTicks.map((tick) => (
                  <div key={tick} className="flex items-center w-full">
                    <span className="text-[10px] font-mono text-[#94a3b8] w-5 text-right mr-2">
                      {tick}
                    </span>
                    <div className="flex-1 border-b border-[#f1f5f9]"></div>
                  </div>
                ))}
              </div>

              {/* Grouped Bars Container */}
              <div className="absolute left-8 right-2 top-4 bottom-9 flex justify-around items-end px-2">
                {visibleSprintChartData.map((item) => (
                  <div
                    key={item.sprint}
                    role="button"
                    tabIndex={0}
                    title={`Select ${item.sprint}`}
                    onClick={() => onSelectSprint(item.sprint)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectSprint(item.sprint);
                      }
                    }}
                    onMouseEnter={() => setHoveredSprint(item.sprint)}
                    onMouseLeave={() => setHoveredSprint(null)}
                    className="flex flex-col items-center group relative h-full justify-end cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877f2]/40"
                  >
                    {/* Tooltip on hover */}
                    {hoveredSprint === item.sprint && (
                      <div className="absolute -top-12 z-20 bg-[#0f172a] text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                        <div className="font-bold">{item.sprint}</div>
                        <div>
                          Completed: {item.completed} · In Progress: {item.inProgress} · Overdue: {item.overdue}
                        </div>
                      </div>
                    )}

                    {/* Bars Group */}
                    <div className="flex items-end gap-1 px-1 h-full">
                      {[
                        { value: item.completed, color: 'bg-emerald-500', label: 'Completed' },
                        { value: item.inProgress, color: 'bg-blue-500', label: 'In Progress' },
                        { value: item.overdue, color: 'bg-rose-500', label: 'Overdue' }
                      ].map((bar) => (
                        <div key={bar.label} className="flex h-full flex-col items-center justify-end gap-1">
                          <span className="text-[10px] font-bold text-[#334155] leading-none">{bar.value}</span>
                          <div
                            className={`w-4 ${bar.color} rounded-t-xs transition-all hover:opacity-90 min-h-[2px]`}
                            title={`${bar.label}: ${bar.value}`}
                            style={{ height: `${(bar.value / chartMax) * 100}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* X Axis Labels */}
              <div className="absolute left-8 right-2 bottom-0 flex justify-around text-[10px] font-medium text-[#64748b]">
                {visibleSprintChartData.map((item) => (
                  <div key={item.sprint} className="text-center font-semibold">
                    {item.sprint}
                    {item.isCurrent && (
                      <span className="block text-[9px] text-[#1877f2] font-bold">(Current)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Task Status */}
        <div className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#0f172a]">{currentSprint} — Task Status</h3>
              <button
                type="button"
                onClick={() => setShowStatusCardDropdown(!showStatusCardDropdown)}
                className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>

            {isAllOpenSprints ? (
              <div className="space-y-4">
                {openSprintStatusRows.map((sprint) => (
                  <div key={sprint.sprint} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{sprint.sprint}</span>
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
                          type="button"
                          onClick={() => {
                            setTableSprintFilter(sprint.sprint);
                            setCurrentPage(1);
                            setShowAllOverviewTasks(false);
                          }}
                          className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          Filter <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
                        <span className="text-rose-500">{sprint.overdueTasks} overdue</span>
                        <span className="text-amber-500">{sprint.atRiskTasks} at risk</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Segmented Progress Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 my-4 shadow-inner">
                  <div className="bg-[#10b981] h-full" style={{ width: completedRate }} title={`Completed ${completedRate}`}></div>
                  <div className="bg-[#1877f2] h-full" style={{ width: inProgressRate }} title={`In Progress ${inProgressRate}`}></div>
                  <div className="bg-[#f59e0b] h-full" style={{ width: pendingRate }} title={`To Do ${pendingRate}`}></div>
                  <div className="bg-[#ef4444] h-full" style={{ width: overdueRate }} title={`Overdue ${overdueRate}`}></div>
                </div>

                {/* 4 Columns Breakdown */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#64748b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                      Compl...
                    </span>
                    <span className="text-base font-extrabold text-[#0f172a] mt-1">{currentSprintStats.completedTasks}</span>
                    <span className="text-[10px] text-[#64748b]">{completedRate}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#64748b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
                      In Progr...
                    </span>
                    <span className="text-base font-extrabold text-[#0f172a] mt-1">{currentSprintStats.inProgressTasks}</span>
                    <span className="text-[10px] text-[#64748b]">{inProgressRate}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#64748b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                      To Do
                    </span>
                    <span className="text-base font-extrabold text-[#0f172a] mt-1">{currentSprintStats.pendingTasks}</span>
                    <span className="text-[10px] text-[#64748b]">{pendingRate}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#64748b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                      Overdue
                    </span>
                    <span className="text-base font-extrabold text-[#0f172a] mt-1">{currentSprintStats.overdueTasks}</span>
                    <span className="text-[10px] text-[#64748b]">{overdueRate}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Total Tasks Counter */}
          <div className={`${isAllOpenSprints ? 'hidden' : 'flex'} pt-6 border-t border-[#f1f5f9] flex-col`}>
            <span className="text-xs text-[#64748b] font-medium">Total tasks</span>
            <span className="text-3xl font-extrabold text-[#0f172a] tracking-tight mt-0.5">{currentSprintStats.totalTasks}</span>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Tasks Table & View All Tasks Button */}
      <div className="flex flex-col gap-3">
        {/* Navigation Tabs (In-Progress Tasks, Overdue Tasks, Completed Tasks) */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setOverviewTab('in-progress')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              overviewTab === 'in-progress'
                ? 'bg-[#1877f2] text-white shadow-2xs'
                : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'
            }`}
          >
            In-Progress Tasks ({todayLabel})
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                overviewTab === 'in-progress' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0f172a]'
              }`}
            >
              {inProgressTaskCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOverviewTab('overdue')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              overviewTab === 'overdue'
                ? 'bg-[#1877f2] text-white shadow-2xs'
                : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'
            }`}
          >
            Overdue Tasks
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                overviewTab === 'overdue' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0f172a]'
              }`}
            >
              {overdueTaskCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOverviewTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              overviewTab === 'completed'
                ? 'bg-[#1877f2] text-white shadow-2xs'
                : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'
            }`}
          >
            Completed Tasks
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                overviewTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0f172a]'
              }`}
            >
              {completedTaskCount}
            </span>
          </button>
        </div>

        {isAllOpenSprints && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <div className="flex items-center gap-6 px-5 pt-3 text-xs font-semibold min-w-max">
              {tableSprintOptions.map((sprint) => (
                <button
                  key={sprint}
                  type="button"
                  onClick={() => {
                    setTableSprintFilter(sprint);
                    setCurrentPage(1);
                    setShowAllOverviewTasks(false);
                  }}
                  className={`pb-3 transition-colors cursor-pointer border-b-2 ${
                    tableSprintFilter === sprint
                      ? 'text-blue-600 border-blue-600'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  {sprint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#edf2f7] shadow-xs">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by ID, summary, or project..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:bg-white focus:outline-none focus:border-[#1877f2] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date filter dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#64748b]">calendar_month</span>
                <span>Tất cả các ngày</span>
                <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">expand_more</span>
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {['Tất cả các ngày', 'Hôm nay', 'Tuần này', 'Tháng này'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDateRangeFilter(d);
                        setShowDateDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] font-medium text-[#0f172a]"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] transition-colors"
            >
              <span className="material-symbols-outlined text-[15px] text-[#64748b]">tune</span>
              <span>Filters</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] transition-colors"
              >
                <span>Sort: Due date (Nearest)</span>
                <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">expand_more</span>
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {['Due date (Nearest)', 'Priority (High to Low)', 'Progress (%)'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShowSortDropdown(false)}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] font-medium text-[#0f172a]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Task Table */}
        <div className="flex-1 w-full bg-white rounded-xl border border-[#edf2f7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === displayedOverviewTasks.length && displayedOverviewTasks.length > 0}
                      onChange={(e) =>
                        setSelectedTaskIds(e.target.checked ? displayedOverviewTasks.map((task) => task.id) : [])
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
                {displayedOverviewTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTaskIds.includes(task.id)
                        ? 'bg-blue-50/50 hover:bg-blue-50/70'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td
                      className="py-3 px-3"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedTaskIds((prev) =>
                          prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]
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
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-100">
                        {task.sprint || currentSprint}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <div className="hover:text-blue-600 transition-colors font-bold text-slate-900">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {task.id}
                        {task.functionId ? ` - Function ${task.functionId}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {task.project || 'PMA Agent'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full ${task.owner.avatarColor} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                          {task.owner.initials}
                        </div>
                        <span className="text-slate-700 text-xs truncate">{task.owner.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-600'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-700'
                            : task.priority === 'Medium'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
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
                            : task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : task.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              task.progress >= 100
                                ? 'bg-emerald-500'
                                : task.status === 'Overdue'
                                ? 'bg-rose-500'
                                : task.progress >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 w-8 text-right">{task.progress}%</span>
                      </div>
                    </td>
                    <td className={`py-3 px-3 font-medium ${task.status === 'Overdue' ? 'text-rose-600' : 'text-slate-600'}`}>
                      {task.dueDate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setResolveTaskDetail(task);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        Resolve
                        <span className="material-symbols-outlined text-[14px]">north_east</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with VIEW ALL TASKS BUTTON */}
          <div className="p-4 bg-white border-t border-[#edf2f7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Left: Row count & VIEW ALL TASKS ACTION */}
            <div className="flex items-center gap-3">
              <span className="text-[#64748b]">
                Hiển thị <span className="font-bold text-[#0f172a]">{visibleOverviewTasksCount}</span> trên{' '}
                <span className="font-bold text-[#0f172a]">{tableOverviewTasks.length}</span> tasks
              </span>

              <button
                type="button"
                onClick={handleViewAllTasks}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1877f2] font-bold text-xs rounded-lg transition-colors cursor-pointer group shadow-2xs"
              >
                <span>{showAllOverviewTasks ? 'Show less' : 'View all tasks'}</span>
                <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                  {showAllOverviewTasks ? 'expand_less' : 'arrow_forward'}
                </span>
              </button>
            </div>

            {/* Right: Rows per page & pagination */}
            {!showAllOverviewTasks && (
            <div className="flex items-center gap-4 text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-[#e2e8f0] rounded-lg text-[#0f172a] font-medium"
                >
                  {[5, 10, 15, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1877f2] text-white font-bold text-xs">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= overviewTotalPages}
                  onClick={() => setCurrentPage((p) => Math.min(overviewTotalPages, p + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
        <aside className={`${resolveTaskDetail ? 'flex' : 'hidden'} w-full xl:w-96 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex-col justify-between shrink-0 sticky top-20`}>
          {resolveTaskDetail && (
            <>
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        resolveTaskDetail.priority === 'Critical'
                          ? 'bg-rose-50 text-rose-600'
                          : resolveTaskDetail.priority === 'High'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {resolveTaskDetail.priority}
                    </span>
                    <span className="text-sm font-bold text-slate-700 truncate">{resolveTaskDetail.id}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{resolveTaskDetail.sprint || currentSprint}</span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{resolveTaskDetail.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {resolveTaskDetail.project || 'PMA Agent'} - {resolveTaskDetail.sprint || currentSprint}
                  </p>
                </div>

                <div className="mt-6 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[22px]">person</span>
                      Owner
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-4 h-4 rounded-full ${resolveTaskDetail.owner.avatarColor} text-white text-[8px] font-bold flex items-center justify-center`}>
                        {resolveTaskDetail.owner.initials}
                      </div>
                      <span className="text-slate-800 font-bold truncate">{resolveTaskDetail.owner.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[22px]">flag</span>
                      Priority
                    </span>
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {resolveTaskDetail.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[22px]">check_circle</span>
                      Status
                    </span>
                    <span className={`${resolveTaskDetail.status === 'Overdue' ? 'text-rose-600' : 'text-blue-600'} font-bold flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${resolveTaskDetail.status === 'Overdue' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                      {resolveTaskDetail.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[22px]">trending_up</span>
                      Progress
                    </span>
                    <div className="flex items-center gap-2 min-w-[115px] justify-end">
                      <span className="text-slate-700 font-bold">{resolveTaskDetail.progress}%</span>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${resolveTaskDetail.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[22px]">calendar_today</span>
                      Due Date
                    </span>
                    <span className={`${resolveTaskDetail.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'} font-bold`}>
                      {resolveTaskDetail.dueDate}
                    </span>
                  </div>
                </div>

                <div className="mt-7 pt-5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 mb-3">Recommended Actions</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['person_add', 'Reassign Owner', 'reassign'],
                      ['event_note', 'Update Due Date', 'dueDate'],
                      ['chat_bubble', 'Add Comment', 'comment'],
                      ['block', 'Mark as Blocked', 'blocked']
                    ].map(([icon, label, actionType]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setTaskAction({ type: actionType as TaskActionType, task: resolveTaskDetail })}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[11px] text-left transition-colors ${
                          icon === 'block' ? 'hover:bg-rose-50 hover:border-rose-300' : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[20px] ${icon === 'block' ? 'text-rose-500' : 'text-blue-500'}`}>
                          {icon}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            <div className="mt-7 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onToggleTask && onToggleTask(resolveTaskDetail.id);
                  setResolveTaskDetail(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-lg shadow-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                <span>Update Status</span>
              </button>
            </div>
            </>
          )}
        </aside>
      </div>
    </div>
    </div>
  );
};
