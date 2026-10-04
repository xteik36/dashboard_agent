import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RiskMatrixItem, OwnerRiskExposure, TaskItem } from '../types';
import { SPRINT_DATA } from '@/data/appData';
import { parseFlexibleDate } from '../utils/dateFormat';
import { TaskActionModal, TaskActionType } from './TaskActionModal';

const ALL_OPEN_SPRINTS = 'All Open Sprints';

interface RiskPredictionsViewProps {
  risks: RiskMatrixItem[];
  tasks: TaskItem[];
  filterLevel?: string;
  selectedSprint?: string;
  onSelectSprint: (sprint: string) => void;
  onUpdateTask?: (task: TaskItem) => void;
}

export const RiskPredictionsView: React.FC<RiskPredictionsViewProps> = ({
  risks,
  tasks,
  selectedSprint = 'Sprint 36',
  onSelectSprint,
  onUpdateTask
}) => {
  // Navigation mode: 'overview' | 'exposure' | 'all-risks'
  const [viewMode, setViewMode] = useState<'overview' | 'exposure' | 'all-risks'>('overview');

  // Shared Filters
  const currentSprint = selectedSprint;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('score-desc');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  // Overview screen active tab: 'today' | 'overdue'
  const [overviewTab, setOverviewTab] = useState<'today' | 'overdue'>('today');

  // Owner Exposure sort
  const [exposureSort, setExposureSort] = useState<string>('score-high-low');
  const [showAllOverviewRisks, setShowAllOverviewRisks] = useState(false);
  const [expandedOwnerName, setExpandedOwnerName] = useState<string | null>(null);

  // Dropdown states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExposureSortDropdown, setShowExposureSortDropdown] = useState(false);
  const [showRiskTrendCountDropdown, setShowRiskTrendCountDropdown] = useState(false);
  const [expandedKpiCard, setExpandedKpiCard] = useState<'critical' | 'increasing' | 'overdue' | 'due-soon' | null>(null);
  const [riskTrendSprintCount, setRiskTrendSprintCount] = useState(() => {
    const savedCount = window.localStorage.getItem('riskTrendSprintCount');
    const parsedCount = savedCount ? Number(savedCount) : 10;
    return Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 10 ? parsedCount : 10;
  });
  const [hoveredRiskSprint, setHoveredRiskSprint] = useState<string | null>(null);

  // Review Modal for a selected risk
  const [selectedRiskForReview, setSelectedRiskForReview] = useState<RiskMatrixItem | null>(null);
  const [taskAction, setTaskAction] = useState<{ type: TaskActionType; task: TaskItem } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const todayLabel = new Intl.DateTimeFormat('en-GB').format(new Date());
  const getSprintOrder = (sprint?: string | null) => {
    const match = sprint?.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };
  const normalizeSprintKey = (sprint?: string | null) => (sprint || '').replace(/\s+/g, '').toLowerCase();
  const sprintMatches = (a?: string | null, b?: string | null) => normalizeSprintKey(a) === normalizeSprintKey(b);
  const riskSprintOptions = Array.from(new Set(risks.map((risk) => risk.sprint).filter(Boolean) as string[]));
  const baseSprintOptions = Array.from(new Set([...Object.keys(SPRINT_DATA), ...riskSprintOptions])).sort(
    (a, b) => getSprintOrder(a) - getSprintOrder(b)
  );
  const openSprintOptions = baseSprintOptions.filter((sprint) =>
    risks.some((risk) => sprintMatches(risk.sprint, sprint) && !['Mitigated', 'Completed'].includes(risk.status))
  );
  const isAllOpenSprints = currentSprint === ALL_OPEN_SPRINTS;

  useEffect(() => {
    setShowAllOverviewRisks(false);
  }, [currentSprint, overviewTab]);

  useEffect(() => {
    if (isAllOpenSprints) {
      setShowRiskTrendCountDropdown(false);
    }
  }, [isAllOpenSprints]);

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const parseRiskDueDate = (dueDate?: string) => parseFlexibleDate(dueDate);
  const riskTrendSprintOptions = useMemo(() => {
    const allSprints = new Set<string>(baseSprintOptions);
    risks.forEach((risk) => {
      if (risk.sprint) {
        allSprints.add(risk.sprint);
      }
    });
    return Array.from(allSprints).sort((a, b) => getSprintOrder(a) - getSprintOrder(b));
  }, [risks, baseSprintOptions]);
  const visibleRiskTrendSprintOptions = useMemo(() => {
    if (isAllOpenSprints) {
      return openSprintOptions;
    }

    const selected = riskTrendSprintOptions.slice(-riskTrendSprintCount);
    if (currentSprint && riskTrendSprintOptions.some((sprint) => sprintMatches(sprint, currentSprint)) && !selected.some((sprint) => sprintMatches(sprint, currentSprint))) {
      return [...selected.slice(1), currentSprint].sort((a, b) => getSprintOrder(a) - getSprintOrder(b));
    }
    return selected;
  }, [isAllOpenSprints, openSprintOptions, riskTrendSprintOptions, riskTrendSprintCount, currentSprint]);
  const sprintRisks = useMemo(
    () =>
      risks.filter((risk) =>
        isAllOpenSprints
          ? risk.sprint && openSprintOptions.some((sprint) => sprintMatches(risk.sprint, sprint))
          : sprintMatches(risk.sprint, currentSprint)
      ),
    [risks, currentSprint, isAllOpenSprints, openSprintOptions]
  );
  const todayDateKey = getDateKey(new Date());
  const dueSoonEndDate = new Date();
  dueSoonEndDate.setDate(dueSoonEndDate.getDate() + 14);
  const dueSoonEndDateKey = getDateKey(dueSoonEndDate);
  const activeSprintRisks = sprintRisks.filter((risk) => !['Mitigated', 'Completed'].includes(risk.status));
  const overdueMitigationRisks = sprintRisks.filter((risk) => {
    const dueDate = parseRiskDueDate(risk.dueDate);
    const isClosed = ['completed', 'closed', 'mitigated'].includes(risk.status.toLowerCase());
    return dueDate ? getDateKey(dueDate) < todayDateKey && !isClosed : false;
  });
  const risksDueSoon = sprintRisks.filter((risk) => {
    const dueDate = parseRiskDueDate(risk.dueDate);
    const isActive = !['completed', 'closed', 'mitigated'].includes(risk.status.toLowerCase());
    const dueDateKey = dueDate ? getDateKey(dueDate) : null;
    return dueDateKey ? todayDateKey <= dueDateKey && dueDateKey <= dueSoonEndDateKey && isActive : false;
  });
  const riskTrendData = useMemo(
    () =>
      visibleRiskTrendSprintOptions.map((sprint) => {
        const sprintRiskItems = risks.filter((risk) => sprintMatches(risk.sprint, sprint));
        return {
          sprint,
          crit: sprintRiskItems.filter((risk) => risk.impact === 'Critical').length,
          high: sprintRiskItems.filter((risk) => risk.impact === 'High').length,
          med: sprintRiskItems.filter((risk) => risk.impact === 'Medium').length,
          low: sprintRiskItems.filter((risk) => risk.impact === 'Low').length,
          current: sprintMatches(sprint, currentSprint)
        };
      }),
    [risks, visibleRiskTrendSprintOptions, currentSprint]
  );
  const maxRiskLevelCount = Math.max(
    1,
    ...riskTrendData.flatMap((item) => [item.crit, item.high, item.med, item.low])
  );
  const riskTrendChartMax = Math.max(5, Math.ceil(maxRiskLevelCount / 5) * 5);
  const riskTrendChartTicks = Array.from(
    { length: 5 },
    (_, index) => Math.round(riskTrendChartMax - (riskTrendChartMax / 4) * index)
  );
  const currentSprintRiskTotal = sprintRisks.length;
  const currentSprintOrderIndex = riskTrendSprintOptions.findIndex((sprint) => sprintMatches(sprint, currentSprint));
  const previousSprintForRiskTrend =
    !isAllOpenSprints && currentSprintOrderIndex > 0 ? riskTrendSprintOptions[currentSprintOrderIndex - 1] : undefined;
  const previousSprintRiskTotal = previousSprintForRiskTrend
    ? risks.filter((risk) => sprintMatches(risk.sprint, previousSprintForRiskTrend)).length
    : 0;
  const riskTotalDelta = currentSprintRiskTotal - previousSprintRiskTotal;
  const riskTrendIsDecreasing = riskTotalDelta < 0;
  const riskTrendIsFlat = riskTotalDelta === 0;
  const increasingRisks = [...activeSprintRisks].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, Math.max(1, Math.abs(riskTotalDelta)));
  const getExpandedKpiRisks = (card: NonNullable<typeof expandedKpiCard>) => {
    if (card === 'critical') return activeSprintRisks;
    if (card === 'increasing') return increasingRisks;
    if (card === 'overdue') return overdueMitigationRisks;
    return risksDueSoon;
  };
  const isClosedTask = (task: TaskItem) => task.completed || task.status === 'Completed';
  const getRiskTasks = (risk: RiskMatrixItem) =>
    tasks.filter((task) => {
      const ownerMatches = task.owner.name === risk.owner;
      const sprintMatchesRisk = sprintMatches(task.sprint, risk.sprint || currentSprint);
      const functionMatches = !risk.affectedFunction || task.project === risk.affectedFunction;
      return ownerMatches && sprintMatchesRisk && functionMatches && !isClosedTask(task);
    });
  const criticalRiskCount = activeSprintRisks.length;
  const overdueMitigationCount = overdueMitigationRisks.length;
  const risksDueSoonCount = risksDueSoon.length;
  const getOwnerTaskForRisk = (risk: RiskMatrixItem) =>
    getRiskTasks(risk)[0] ||
    tasks.find(
      (task) =>
        task.owner.name === risk.owner &&
        sprintMatches(task.sprint, risk.sprint || currentSprint) &&
        !isClosedTask(task)
    ) ||
    tasks.find((task) => task.owner.name === risk.owner && !isClosedTask(task));
  const getRiskTaskTitle = (risk: RiskMatrixItem) =>
    getOwnerTaskForRisk(risk)?.title || risk.riskName || risk.title || risk.affectedFunction || 'Risk Trigger';
  const toTaskStatus = (status: RiskMatrixItem['status'] | TaskItem['status']): TaskItem['status'] => {
    if (['Completed', 'In Progress', 'Pending', 'Overdue', 'To Do', 'At Risk', 'Blocked', 'Planned'].includes(status)) {
      return status as TaskItem['status'];
    }
    return status === 'Open' || status === 'Monitoring' ? 'At Risk' : 'In Progress';
  };
  const riskToTask = (risk: RiskMatrixItem, task?: TaskItem | null): TaskItem => ({
    id: task?.id || risk.id,
    title: task?.title || risk.riskName || risk.title,
    project: task?.project || risk.affectedFunction || 'PMA Agent',
    priority: task?.priority || (risk.impact === 'Critical' ? 'Critical' : risk.impact === 'High' ? 'High' : 'Medium'),
    progress: task?.progress ?? Math.max(25, Math.min(95, Math.round(((risk.score ?? 10) / 25) * 100))),
    dueDate: task?.dueDate || risk.dueDate || risk.dueRelative || 'No due date',
    owner: {
      name: task?.owner.name || risk.owner,
      initials: task?.owner.initials || risk.ownerInitials || risk.owner.slice(0, 2).toUpperCase(),
      avatarColor: task?.owner.avatarColor || risk.ownerAvatarColor || 'bg-[#1877f2]',
      role: task?.owner.role || risk.affectedFunction || 'Delivery Owner'
    },
    status: task?.status || toTaskStatus(risk.status),
    sprint: task?.sprint || risk.sprint || currentSprint,
    completed: task?.completed
  });
  const getSprintOwnerOptions = (task?: TaskItem) => {
    if (!task?.sprint) return [];

    const ownersByName = new Map<string, TaskItem['owner']>();
    tasks
      .filter((item) => sprintMatches(item.sprint, task.sprint))
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
    if (tasks.some((task) => task.id === updatedTask.id)) {
      onUpdateTask?.(updatedTask);
    }
    showToast(message);
  };
  const openRiskTaskAction = (type: TaskActionType, risk: RiskMatrixItem, task?: TaskItem | null) => {
    setTaskAction({ type, task: riskToTask(risk, task) });
  };
  const getExpandedKpiTitle = (card: NonNullable<typeof expandedKpiCard>) => {
    if (card === 'critical') return 'Critical Risks Tasks (Need Immediate Action)';
    if (card === 'increasing') return 'Risks Increasing Tasks (Approaching Threshold)';
    if (card === 'overdue') return 'Overdue Mitigations Tasks (Need Follow-up Check)';
    return 'Risks Due Soon Tasks (Next 14 Days Deadline)';
  };
  const getExpandedKpiDotClass = (card: NonNullable<typeof expandedKpiCard>) => {
    if (card === 'critical') return 'bg-red-500';
    if (card === 'increasing') return 'bg-orange-500';
    if (card === 'overdue') return 'bg-[#1877f2]';
    return 'bg-teal-500';
  };
  const averageRisksPerSprint =
    riskTrendData.length === 0
      ? 0
      : riskTrendData.reduce((sum, item) => sum + item.crit + item.high + item.med + item.low, 0) /
        riskTrendData.length;
  const riskTrendLevels = [
    {
      key: 'crit',
      label: 'Critical',
      textClass: 'text-red-700',
      cellClass: 'border-red-200 bg-red-50',
      fillClass: 'bg-red-500'
    },
    {
      key: 'high',
      label: 'High',
      textClass: 'text-orange-700',
      cellClass: 'border-orange-200 bg-orange-50',
      fillClass: 'bg-orange-500'
    },
    {
      key: 'med',
      label: 'Medium',
      textClass: 'text-amber-700',
      cellClass: 'border-amber-200 bg-amber-50',
      fillClass: 'bg-amber-500'
    },
    {
      key: 'low',
      label: 'Low',
      textClass: 'text-teal-700',
      cellClass: 'border-teal-200 bg-teal-50',
      fillClass: 'bg-teal-500'
    }
  ] as const;

  // Filtered risks for All Risks dashboard
  const filteredAllRisks = useMemo(() => {
    return sprintRisks
      .filter((r) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesId = r.id.toLowerCase().includes(q);
          const matchesTitle = r.title.toLowerCase().includes(q);
          const matchesName = r.riskName?.toLowerCase().includes(q) ?? false;
          const matchesOwner = r.owner.toLowerCase().includes(q);
          if (!matchesId && !matchesTitle && !matchesName && !matchesOwner) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [sprintRisks, searchQuery]);

  // Overview table 5 items
  const overviewTableRisks = useMemo(() => {
    const tabRisks =
      overviewTab === 'overdue'
        ? sprintRisks.filter((risk) => risk.status === 'Overdue')
        : sprintRisks.filter((risk) => !['Completed', 'Closed', 'Mitigated'].includes(risk.status));

    return showAllOverviewRisks ? tabRisks : tabRisks.slice(0, 5);
  }, [sprintRisks, overviewTab, showAllOverviewRisks]);
  const inProgressRiskCount = sprintRisks.filter(
    (risk) => !['Completed', 'Closed', 'Mitigated'].includes(risk.status)
  ).length;
  const overdueRiskCount = sprintRisks.filter((risk) => risk.status === 'Overdue').length;
  const overviewTabRiskCount =
    overviewTab === 'overdue'
      ? overdueRiskCount
      : inProgressRiskCount;

  // Sorted owner exposure data
  const sortedOwnerExposure = useMemo(() => {
    type OwnerExposureAccumulator = OwnerRiskExposure & { topThreatScore: number };

    const list = Array.from(
      sprintRisks.reduce((map, risk) => {
        const rawRisk = risk as RiskMatrixItem & { assignee?: string; owner_name?: string };
        const riskScore = risk.score || 0;
        const ownerName = risk.owner || rawRisk.owner_name || rawRisk.assignee || `Owner ${map.size + 1}`;
        const current = map.get(ownerName) || {
          rank: 0,
          name: ownerName,
          role: risk.affectedFunction || 'Delivery Owner',
          initials: risk.ownerInitials || ownerName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
          avatarColor: risk.ownerAvatarColor || 'bg-[#1877f2]',
          totalRisks: 0,
          critCount: 0,
          highCount: 0,
          medCount: 0,
          riskScore: 0,
          maxScore: 25,
          overdueCount: 0,
          topThreatRisk: risk.id,
          topThreatScore: riskScore
        };

        current.totalRisks += 1;
        current.critCount += risk.impact === 'Critical' ? 1 : 0;
        current.highCount += risk.impact === 'High' ? 1 : 0;
        current.medCount += risk.impact === 'Medium' || risk.impact === 'Low' ? 1 : 0;
        current.riskScore += riskScore;
        current.maxScore = 25;

        const dueDate = parseRiskDueDate(risk.dueDate);
        const isClosed = ['completed', 'closed', 'mitigated'].includes(risk.status.toLowerCase());
        current.overdueCount += dueDate && getDateKey(dueDate) < todayDateKey && !isClosed ? 1 : 0;

        if (riskScore >= current.topThreatScore) {
          current.topThreatRisk = risk.id;
          current.topThreatScore = riskScore;
        }

        map.set(ownerName, current);
        return map;
      }, new Map<string, OwnerExposureAccumulator>())
    ).map(({ topThreatScore, ...owner }) => owner);

    if (exposureSort === 'score-high-low') {
      return list.sort((a, b) => b.riskScore - a.riskScore).map((owner, index) => ({ ...owner, rank: index + 1 }));
    }
    if (exposureSort === 'score-low-high') {
      return list.sort((a, b) => a.riskScore - b.riskScore).map((owner, index) => ({ ...owner, rank: index + 1 }));
    }
    if (exposureSort === 'risks-count') {
      return list.sort((a, b) => b.totalRisks - a.totalRisks).map((owner, index) => ({ ...owner, rank: index + 1 }));
    }
    if (exposureSort === 'overdue-high') {
      return list.sort((a, b) => b.overdueCount - a.overdueCount).map((owner, index) => ({ ...owner, rank: index + 1 }));
    }
    return list.map((owner, index) => ({ ...owner, rank: index + 1 }));
  }, [sprintRisks, exposureSort, todayDateKey]);

  // Export Matrix CSV
  const handleExportMatrix = () => {
    const header = 'RISK ID,Risk Name,Description,Probability,Prob %,Impact,Impact Score,Score,Owner,Due Date,Status,Mitigation Plan\n';
    const rows = filteredAllRisks
      .map(
        (r) =>
          `"${r.id}","${r.riskName || ''}","${r.title}","${r.probability}","${r.probabilityPct || ''}%","${r.impact}","${r.impactScore || ''}","${r.score || ''}","${r.owner}","${r.dueDate || ''}","${r.status}","${(r.mitigationPlan || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Risk_Matrix_Export_${currentSprint.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper for Impact pill style
  const getImpactBadge = (impact: string, impactScore?: number) => {
    if (impact === 'Critical') {
      return (
        <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
          Critical {impactScore ? impactScore.toFixed(1) : ''}
        </span>
      );
    }
    if (impact === 'High') {
      return (
        <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
          High {impactScore ? impactScore.toFixed(1) : ''}
        </span>
      );
    }
    if (impact === 'Medium') {
      return (
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          Medium {impactScore ? impactScore.toFixed(1) : ''}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
        Low {impactScore ? impactScore.toFixed(1) : ''}
      </span>
    );
  };

  // Helper for Probability pill style
  const getProbBadge = (prob: string, probPct?: number) => {
    if (prob === 'High') {
      return (
        <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
          High {probPct ? `${probPct}%` : ''}
        </span>
      );
    }
    if (prob === 'Medium') {
      return (
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          Medium {probPct ? `${probPct}%` : ''}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
        Low {probPct ? `${probPct}%` : ''}
      </span>
    );
  };

  // Helper for Status pill
  const getStatusBadge = (status: string) => {
    if (status === 'Overdue') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Overdue
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          In Progress
        </span>
      );
    }
    if (status === 'Planned') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1877f2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
          Planned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        On Track
      </span>
    );
  };

  const renderViewSwitcher = () => (
    <div className="inline-flex items-center rounded-xl bg-[#f8fafc] p-1 border border-[#edf2f7] shadow-2xs">
      {[
        { id: 'overview' as const, label: 'Overview & Trends' },
        { id: 'exposure' as const, label: 'Owner Exposure' },
        { id: 'all-risks' as const, label: 'All Risks Matrix' }
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setViewMode(tab.id)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            viewMode === tab.id
              ? 'bg-white text-[#0b5cff] ring-1 ring-[#0f172a] shadow-2xs'
              : 'text-[#334155] hover:text-[#0f172a] hover:bg-white/70'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
  const renderTaskActionLayer = () => (
    <>
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
    </>
  );

  // =========================================================================
  // SCREEN 2: ALL RISKS & RISK EXPOSURE ANALYSIS (MÀN HÌNH BÊN TAY PHẢI KHI NHẤN OWNER RISK EXPOSURE)
  // =========================================================================
  if (viewMode === 'exposure') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-200">
        {renderTaskActionLayer()}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Risk Predictions</h1>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              AI-powered risk forecasting, exposure analysis, and mitigation matrix.
            </p>
          </div>

          {renderViewSwitcher()}
        </div>

        {/* Main Exposure Card */}
        <div className="bg-white rounded-xl border border-[#edf2f7] shadow-xs overflow-hidden p-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">shield_person</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0f172a]">
                  Owner Risk Exposure & Workload Vulnerability
                </h2>
                <p className="text-xs text-[#64748b]">
                  Consolidated risk distribution, individual threat burden, and overdue mitigation actions for{' '}
                  <span className="font-semibold text-[#0f172a]">{currentSprint}</span>.
                </p>
              </div>
            </div>

            {/* Filter by Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExposureSortDropdown(!showExposureSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors"
              >
                <span className="text-[#64748b]">Filter by:</span>
                <span className="font-bold">
                  {exposureSort === 'score-high-low' && 'Total Risk Score (High to Low)'}
                  {exposureSort === 'score-low-high' && 'Total Risk Score (Low to High)'}
                  {exposureSort === 'risks-count' && 'Total Risks Count'}
                  {exposureSort === 'overdue-high' && 'Overdue Actions'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">expand_more</span>
              </button>

              {showExposureSortDropdown && (
                <div className="absolute right-0 mt-1 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {[
                    { id: 'score-high-low', label: 'Total Risk Score (High to Low)' },
                    { id: 'score-low-high', label: 'Total Risk Score (Low to High)' },
                    { id: 'risks-count', label: 'Total Risks Count' },
                    { id: 'overdue-high', label: 'Overdue Actions' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setExposureSort(opt.id);
                        setShowExposureSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#f8fafc] font-medium ${
                        exposureSort === opt.id ? 'text-[#1877f2] font-semibold bg-[#eff6ff]' : 'text-[#0f172a]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ranking Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#8a9bb8] font-bold text-[11px] uppercase tracking-wider border-b border-[#f1f5f9]">
                <tr>
                  <th className="py-3 px-4 min-w-[320px]">RANK & TEAM MEMBER</th>
                  <th className="py-3 px-4 min-w-[360px]">TOTAL RISKS & COMPOSITION (CRIT / HIGH / MED)</th>
                  <th className="py-3 px-4 w-28">RISK SCORE</th>
                  <th className="py-3 px-4 w-36">OVERDUE ACTION</th>
                  <th className="py-3 px-4 w-36">TOP THREAT RISK</th>
                  <th className="py-3 px-4 w-32 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {sortedOwnerExposure.map((owner, index) => {
                  const rawOwner = owner as OwnerRiskExposure & {
                    avatar_color?: string;
                    critical_count?: number;
                    high_count?: number;
                    max_score?: number;
                    medium_count?: number;
                    overdue_count?: number;
                    risk_score?: number;
                    top_threat_risk?: string;
                    total_risks?: number;
                  };
                  const seedRisk =
                    sprintRisks.find((risk) => risk.id === rawOwner.topThreatRisk || risk.id === rawOwner.top_threat_risk) ||
                    sprintRisks[index];
                  const rawOwnerName = rawOwner.name && rawOwner.name !== 'Unassigned' ? rawOwner.name : '';
                  const ownerName = rawOwnerName || seedRisk?.owner || `Owner ${index + 1}`;
                  const ownerRisks = sprintRisks.filter((risk) => risk.owner === ownerName);
                  const totalRisks = rawOwner.totalRisks ?? rawOwner.total_risks ?? ownerRisks.length;
                  const critCount = rawOwner.critCount ?? rawOwner.critical_count ?? ownerRisks.filter((risk) => risk.impact === 'Critical').length;
                  const highCount = rawOwner.highCount ?? rawOwner.high_count ?? ownerRisks.filter((risk) => risk.impact === 'High').length;
                  const medCount =
                    rawOwner.medCount ??
                    rawOwner.medium_count ??
                    ownerRisks.filter((risk) => risk.impact === 'Medium' || risk.impact === 'Low').length;
                  const riskScore = rawOwner.riskScore ?? rawOwner.risk_score ?? ownerRisks.reduce((sum, risk) => sum + (risk.score || 0), 0);
                  const maxScore = rawOwner.maxScore ?? rawOwner.max_score ?? 25;
                  const overdueCount =
                    rawOwner.overdueCount ??
                    rawOwner.overdue_count ??
                    ownerRisks.filter((risk) => {
                      const dueDate = parseRiskDueDate(risk.dueDate);
                      const isClosed = ['completed', 'closed', 'mitigated'].includes(risk.status.toLowerCase());
                      return dueDate ? getDateKey(dueDate) < todayDateKey && !isClosed : false;
                    }).length;
                  const topThreatRisk =
                    rawOwner.topThreatRisk ||
                    rawOwner.top_threat_risk ||
                    [...ownerRisks].sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.id ||
                    '';
                  const initials =
                    rawOwner.initials ||
                    ownerName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                  const avatarColor = rawOwner.avatarColor || rawOwner.avatar_color || 'bg-[#1877f2]';
                  const ownerRole = rawOwner.role || ownerRisks[0]?.affectedFunction || 'Delivery Owner';
                  const isExpanded = expandedOwnerName === ownerName;

                  return (
                    <React.Fragment key={ownerName}>
                      <tr
                        className={`hover:bg-[#f8fafc]/80 transition-colors ${
                          index % 2 === 1 ? 'bg-[#f8fafc]/70' : 'bg-white'
                        }`}
                      >
                    {/* Rank & Team Member */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setExpandedOwnerName(isExpanded ? null : ownerName)}
                          className="w-5 h-5 flex items-center justify-center text-[#94a3b8] hover:text-[#1877f2] transition-colors cursor-pointer"
                          aria-label={isExpanded ? 'Hide owner tasks' : 'View owner tasks'}
                        >
                          <span className={`material-symbols-outlined text-[20px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            chevron_right
                          </span>
                        </button>
                        <span className={`font-extrabold text-sm w-4 ${owner.rank <= 2 ? 'text-red-600' : 'text-[#8a9bb8]'}`}>
                          {owner.rank}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-full ${avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-2xs`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-[#0f172a] text-sm">{ownerName}</div>
                          <div className="text-[11px] text-[#64748b]">{ownerRole}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md border border-[#bfdbfe] bg-[#eff6ff] text-[#0b5cff] text-[11px] font-bold whitespace-nowrap">
                          {totalRisks} total tasks
                        </span>
                      </div>
                    </td>

                    {/* Total Risks & Composition */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="font-medium text-[#0f172a]">
                          <span className="font-bold">{totalRisks} Risks</span>
                          <span className="text-[#94a3b8] mx-1.5">•</span>
                          <span className="text-[#64748b] text-[11px]">
                            <span className="text-red-600 font-semibold">{critCount} Crit, </span>
                            <span className="text-orange-600 font-semibold">{highCount} High, </span>
                            <span className="text-amber-600 font-semibold">{medCount} Med</span>
                          </span>
                        </div>

                        {/* Visual Colored Composition Bar */}
                        <div className="w-48 h-2 rounded-full overflow-hidden flex bg-slate-100">
                          {critCount > 0 && (
                            <div
                              className="bg-red-500 h-full"
                              style={{ width: `${totalRisks ? (critCount / totalRisks) * 100 : 0}%` }}
                            ></div>
                          )}
                          {highCount > 0 && (
                            <div
                              className="bg-orange-500 h-full"
                              style={{ width: `${totalRisks ? (highCount / totalRisks) * 100 : 0}%` }}
                            ></div>
                          )}
                          {medCount > 0 && (
                            <div
                              className="bg-amber-400 h-full"
                              style={{ width: `${totalRisks ? (medCount / totalRisks) * 100 : 0}%` }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-4 px-4">
                      <span className={`font-extrabold text-lg ${riskScore >= 12 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {Number.isInteger(riskScore) ? riskScore : riskScore.toFixed(2)}
                      </span>
                      <span className="text-[#8a9bb8] ml-1">/{maxScore}</span>
                    </td>

                    {/* Overdue Action */}
                    <td className="py-4 px-4">
                      {overdueCount > 0 ? (
                        <span className="inline-flex items-center gap-2 text-red-600 font-bold">
                          <span className="material-symbols-outlined text-[22px]">warning</span>
                          {overdueCount} Overdue
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Clear
                        </span>
                      )}
                    </td>

                    {/* Top Threat Risk */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          const r = risks.find((item) => item.id === topThreatRisk);
                          if (r) setSelectedRiskForReview(r);
                        }}
                        className="text-[#0b5cff] font-mono text-xs font-bold hover:underline cursor-pointer"
                      >
                        {topThreatRisk}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedOwnerName(isExpanded ? null : ownerName)}
                        className="px-3 py-1.5 rounded-lg border border-[#bfdbfe] bg-white text-[#0b5cff] text-xs font-semibold hover:bg-[#eff6ff] transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Hide Tasks' : `View Tasks (${totalRisks})`}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-white">
                      <td colSpan={6} className="px-12 pb-4">
                        <div className="rounded-xl border border-[#dbe5f3] bg-white p-4 shadow-2xs">
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#edf2f7]">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[20px] text-orange-500">assignment_late</span>
                              <h3 className="text-sm font-bold text-[#0f172a]">
                                Assigned Risks & Tasks for {ownerName}
                              </h3>
                            </div>
                            <span className="text-[11px] text-[#64748b]">Select an action to execute immediate mitigation</span>
                          </div>

                          <div className="pt-3 space-y-3">
                            {ownerRisks.map((risk) => (
                              <div
                                key={risk.id}
                                className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-lg border border-[#dbe5f3] bg-[#f8fafc] px-3 py-3"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                                        risk.impact === 'Critical'
                                          ? 'bg-red-50 border-red-100 text-red-600'
                                          : risk.impact === 'High'
                                          ? 'bg-amber-50 border-amber-100 text-amber-700'
                                          : 'bg-blue-50 border-blue-100 text-blue-600'
                                      }`}
                                    >
                                      {risk.impact}
                                    </span>
                                    <span className="font-bold text-[#0f172a] text-sm">
                                      {risk.id} - {getRiskTaskTitle(risk)}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748b]">
                                    <span>
                                      Sprint: <strong className="text-[#0f172a]">{risk.sprint}</strong>
                                    </span>
                                    <span>
                                      Due:{' '}
                                      <strong className={risk.status === 'Overdue' ? 'text-red-600' : 'text-[#0f172a]'}>
                                        {risk.dueRelative || risk.dueDate}
                                      </strong>
                                    </span>
                                    <span>
                                      Status: <strong className="text-[#0b5cff]">{risk.status}</strong>
                                    </span>
                                    <span>
                                      Progress: <strong className="text-[#0f172a]">{risk.progress || 0}%</strong>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 shrink-0 rounded-lg border border-[#dbe5f3] bg-[#f8fafc] p-2">
                                  {[
                                    ['person_add', 'Reassign Owner', 'reassign', 'text-[#0b5cff]'],
                                    ['edit_calendar', 'Update Due Date', 'dueDate', 'text-[#0b5cff]'],
                                    ['chat_bubble', 'Add Comment', 'comment', 'text-[#0b5cff]'],
                                    ['block', 'Mark as Blocked', 'blocked', 'text-rose-500']
                                  ].map(([icon, label, actionType]) => (
                                    <button
                                      key={label}
                                      type="button"
                                      onClick={() => openRiskTaskAction(actionType as TaskActionType, risk, getRiskTasks(risk)[0])}
                                      className="inline-flex h-10 min-w-[128px] items-center justify-center gap-2 rounded-md border border-[#dbe5f3] bg-white px-3 text-[11px] font-semibold text-[#0f172a] shadow-2xs transition-colors hover:border-[#b9c9df] hover:bg-[#f8fbff]"
                                    >
                                      <span className={`material-symbols-outlined text-[24px] leading-none ${actionType === 'blocked' ? 'text-rose-500' : 'text-[#0b5cff]'}`}>
                                        {icon}
                                      </span>
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
                {sortedOwnerExposure.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 px-4 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-[#64748b]">
                        <div className="w-10 h-10 rounded-full bg-[#f8fafc] text-[#94a3b8] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">shield_person</span>
                        </div>
                        <div className="text-sm font-bold text-[#0f172a]">No owner exposure in {currentSprint}</div>
                        <div className="text-xs">This sprint does not have risk data to rank by owner.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal when clicking on Top Threat Risk */}
        {selectedRiskForReview && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overscroll-none"
            onWheel={(event) => event.preventDefault()}
            onTouchMove={(event) => event.preventDefault()}
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-red-100 text-red-700">
                    {selectedRiskForReview.id}
                  </span>
                  <h3 className="font-bold text-[#0f172a] text-base">{getRiskTaskTitle(selectedRiskForReview)}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRiskForReview(null)}
                  className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div>
                  <span className="text-[#64748b] block font-medium">Issue Summary:</span>
                  <p className="font-semibold text-[#0f172a] mt-0.5">{selectedRiskForReview.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#edf2f7]">
                  <div>
                    <span className="text-[#64748b] block">Probability:</span>
                    <span className="font-bold text-red-600">
                      {selectedRiskForReview.probability} ({selectedRiskForReview.probabilityPct}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Impact:</span>
                    <span className="font-bold text-red-600">
                      {selectedRiskForReview.impact} ({selectedRiskForReview.impactScore})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Total Risk Score:</span>
                    <span className="font-extrabold text-sm text-[#0f172a]">{selectedRiskForReview.score}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Due Date:</span>
                    <span className="font-semibold text-[#0f172a]">
                      {selectedRiskForReview.dueDate} ({selectedRiskForReview.dueRelative})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[#64748b] block font-medium">Mitigation Plan:</span>
                  <div className="p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe] text-[#1e40af] font-medium mt-1">
                    {selectedRiskForReview.mitigationPlan}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRiskForReview(null)}
                  className="px-4 py-1.5 bg-[#1877f2] text-white rounded-lg text-xs font-bold hover:bg-[#166fe5]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3: ALL RISKS FULL DASHBOARD (MÀN HÌNH ALL RISKS KHI NHẤN VIEW ALL RISKS →)
  // =========================================================================
  if (viewMode === 'all-risks') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-200">
        {renderTaskActionLayer()}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Risk Predictions</h1>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              AI-powered risk forecasting, exposure analysis, and mitigation matrix.
            </p>
          </div>

          {renderViewSwitcher()}
        </div>

        {/* Toolbar: Search and Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#edf2f7] shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks by ID, risk name, or owner..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:bg-white focus:outline-none focus:border-[#1877f2] transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleExportMatrix}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0f172a]">download</span>
            Export Matrix
          </button>
        </div>

        {/* Full Matrix Table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-[#edf2f7] tracking-wider uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-28">RISK ID</th>
                  <th className="py-3 px-3">RISK</th>
                  <th className="py-3 px-3 w-32">PROBABILITY</th>
                  <th className="py-3 px-3 w-32">IMPACT</th>
                  <th className="py-3 px-3 w-20 text-center">SCORE</th>
                  <th className="py-3 px-3 w-36">OWNER</th>
                  <th className="py-3 px-3 w-36">DUE DATE</th>
                  <th className="py-3 px-3 w-28">STATUS</th>
                  <th className="py-3 px-4 w-24 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {filteredAllRisks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc]/90 transition-colors group">
                    {/* Risk ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#0f172a]">
                      {item.id}
                    </td>

                    {/* Risk Title & Description */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0f172a] group-hover:text-[#1877f2] transition-colors">
                          {getRiskTaskTitle(item)}
                        </span>
                        <span className="text-[11px] text-[#64748b] line-clamp-1">{item.title}</span>
                      </div>
                    </td>

                    {/* Probability */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getProbBadge(item.probability, item.probabilityPct)}
                    </td>

                    {/* Impact */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getImpactBadge(item.impact, item.impactScore)}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          (item.score ?? 0) >= 15
                            ? 'bg-red-50 text-red-600'
                            : (item.score ?? 0) >= 10
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-slate-100 text-[#0f172a]'
                        }`}
                      >
                        {item.score ?? 0}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            item.ownerAvatarColor || 'bg-[#1877f2]'
                          } text-white text-[10px] font-bold flex items-center justify-center shadow-2xs`}
                        >
                          {item.ownerInitials || item.owner.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-[#0f172a]">{item.owner}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#0f172a]">{item.dueDate || '15/09/2026'}</span>
                        <span className="text-[10px] text-[#94a3b8]">{item.dueRelative || 'In 6 days'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedRiskForReview(item)}
                        className="px-3 py-1.5 text-xs font-bold text-[#0057ff] bg-[#eff6ff] hover:bg-[#dbeafe] rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#64748b]">
            <div>
              Hiển thị <span className="font-bold text-[#0f172a]">{filteredAllRisks.length}</span> trên{' '}
              <span className="font-bold text-[#0f172a]">{sprintRisks.length}</span> risks
            </div>
            <div className="text-[11px] text-[#94a3b8]">
              Updated in real-time from automated CI/CD and SOC2 auditor telemetry
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {selectedRiskForReview && createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#e2e8f0] animate-in zoom-in-95 duration-150 overflow-hidden">
              <div className="px-6 py-5 flex items-start justify-between border-b border-[#edf2f7]">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#dbeafe] text-[#1877f2] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">policy</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#0f172a] text-base leading-snug break-words">
                      Review {selectedRiskForReview.id} — {getRiskTaskTitle(selectedRiskForReview)}
                    </h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      {selectedRiskForReview.sprint || currentSprint}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRiskForReview(null)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  aria-label="Close review"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              <div className="px-6 py-6 text-xs">
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#edf2f7] space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748b] font-medium">Current Risk Score:</span>
                    <span className="text-red-600 font-extrabold text-base">
                      {selectedRiskForReview.score ?? 0} / 25
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748b] font-medium">Probability / Impact:</span>
                    <span className="font-bold text-[#0f172a] text-right">
                      {selectedRiskForReview.probability} ({selectedRiskForReview.probabilityPct}%) / {selectedRiskForReview.impact} ({selectedRiskForReview.impactScore})
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748b] font-medium">Assigned Owner:</span>
                    <span className="font-bold text-[#0f172a]">{selectedRiskForReview.owner}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#edf2f7]">
                  <div className="text-xs font-extrabold text-[#0f172a] mb-3">Recommended Actions for PM:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['person_add', 'Reassign Owner', 'reassign'],
                      ['edit_calendar', 'Update Due Date', 'dueDate'],
                      ['chat_bubble', 'Add Comment', 'comment'],
                      ['block', 'Mark as Blocked', 'blocked']
                    ].map(([icon, label, actionType]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const risk = selectedRiskForReview;
                          const task = getOwnerTaskForRisk(risk);
                          setSelectedRiskForReview(null);
                          openRiskTaskAction(actionType as TaskActionType, risk, task);
                        }}
                        className="flex items-center gap-2 px-3 py-3 rounded-xl border border-[#dbe3ef] text-[#334155] font-semibold text-[12px] bg-white hover:bg-[#f8fafc] hover:border-[#bfdbfe] transition-colors shadow-2xs text-left"
                      >
                        <span className={`material-symbols-outlined text-[22px] ${icon === 'block' ? 'text-rose-500' : 'text-blue-600'}`}>
                          {icon}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#edf2f7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRiskForReview(null)}
                  className="px-4 py-2 bg-white border border-[#dbe3ef] text-[#334155] rounded-lg text-xs font-bold hover:bg-[#f8fafc] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: RISK PREDICTIONS - MAIN OVERVIEW (MÀN HÌNH BÊN TAY TRÁI)
  // =========================================================================
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {renderTaskActionLayer()}

      {/* 1. Header with Breadcrumbs, Title, and Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b] mb-1">
            <span>Workspace</span>
            <span className="text-[#94a3b8]">&gt;</span>
            <span className="text-[#0f172a] font-semibold">Risk Predictions</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Risk Predictions</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            AI-powered risk forecasting and mitigation across Agent Functions and Project tasks.
          </p>
        </div>

        {renderViewSwitcher()}
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical Risks */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandedKpiCard((card) => (card === 'critical' ? null : 'critical'))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpandedKpiCard((card) => (card === 'critical' ? null : 'critical'));
            }
          }}
          className="p-4 rounded-xl bg-white border border-[#edf2f7] border-l-4 border-l-red-500 shadow-xs flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-red-500">warning</span>
              Critical Risks
            </div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">{criticalRiskCount}</div>
            <div className="text-[11px] font-semibold text-red-500 mt-0.5">
              {criticalRiskCount > 0 ? 'Need action' : 'On track'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">error</span>
          </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpandedKpiCard((card) => (card === 'critical' ? null : 'critical'));
            }}
            className="self-end text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            {expandedKpiCard === 'critical' ? 'Collapse' : 'View tasks →'}
          </button>
        </div>

        {/* Card 2: Risks Increasing / Decreasing */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandedKpiCard((card) => (card === 'increasing' ? null : 'increasing'))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpandedKpiCard((card) => (card === 'increasing' ? null : 'increasing'));
            }
          }}
          className="p-4 rounded-xl bg-white border border-[#edf2f7] border-l-4 border-l-orange-500 shadow-xs flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
              <span
                className={`material-symbols-outlined text-[15px] ${
                  riskTrendIsDecreasing ? 'text-emerald-500' : riskTrendIsFlat ? 'text-[#64748b]' : 'text-orange-500'
                }`}
              >
                {riskTrendIsDecreasing ? 'trending_down' : riskTrendIsFlat ? 'trending_flat' : 'trending_up'}
              </span>
              {riskTrendIsDecreasing ? 'Risks Decreasing' : riskTrendIsFlat ? 'Risks Stable' : 'Risks Increasing'}
            </div>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                riskTrendIsDecreasing ? 'text-emerald-600' : riskTrendIsFlat ? 'text-[#64748b]' : 'text-orange-600'
              }`}
            >
              {Math.abs(riskTotalDelta)}
            </div>
            <div
              className={`text-[11px] font-semibold mt-0.5 ${
                riskTrendIsDecreasing ? 'text-emerald-600' : riskTrendIsFlat ? 'text-[#64748b]' : 'text-orange-500'
              }`}
            >
              {previousSprintForRiskTrend
                ? `${currentSprintRiskTotal} vs ${previousSprintRiskTotal} in ${previousSprintForRiskTrend}`
                : 'No previous sprint'}
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              riskTrendIsDecreasing
                ? 'bg-emerald-50 text-emerald-500'
                : riskTrendIsFlat
                  ? 'bg-slate-50 text-[#64748b]'
                  : 'bg-orange-50 text-orange-500'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {riskTrendIsDecreasing ? 'trending_down' : riskTrendIsFlat ? 'trending_flat' : 'show_chart'}
            </span>
          </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpandedKpiCard((card) => (card === 'increasing' ? null : 'increasing'));
            }}
            className="self-end text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
          >
            {expandedKpiCard === 'increasing' ? 'Collapse' : 'View tasks →'}
          </button>
        </div>

        {/* Card 3: Overdue Mitigations */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandedKpiCard((card) => (card === 'overdue' ? null : 'overdue'))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpandedKpiCard((card) => (card === 'overdue' ? null : 'overdue'));
            }
          }}
          className="p-4 rounded-xl bg-white border border-[#edf2f7] border-l-4 border-l-[#1877f2] shadow-xs flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#1877f2]">history</span>
              Overdue Mitigations
            </div>
            <div className="text-2xl font-extrabold text-[#1877f2] mt-1">{overdueMitigationCount}</div>
            <div className="text-[11px] font-semibold text-[#1877f2] mt-0.5">
              {overdueMitigationCount > 0 ? 'Need follow-up' : 'On track'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877f2] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpandedKpiCard((card) => (card === 'overdue' ? null : 'overdue'));
            }}
            className="self-end text-xs font-semibold text-[#1877f2] hover:text-[#0b5ed7] hover:underline cursor-pointer"
          >
            {expandedKpiCard === 'overdue' ? 'Collapse' : 'View tasks →'}
          </button>
        </div>

        {/* Card 4: Risks Due Soon */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandedKpiCard((card) => (card === 'due-soon' ? null : 'due-soon'))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpandedKpiCard((card) => (card === 'due-soon' ? null : 'due-soon'));
            }
          }}
          className="p-4 rounded-xl bg-white border border-[#edf2f7] border-l-4 border-l-teal-500 shadow-xs flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-teal-600">event</span>
              Risks Due Soon
            </div>
            <div className="text-2xl font-extrabold text-teal-700 mt-1">{risksDueSoonCount}</div>
            <div className="text-[11px] font-semibold text-teal-600 mt-0.5">Next 14 days</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">calendar_clock</span>
          </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpandedKpiCard((card) => (card === 'due-soon' ? null : 'due-soon'));
            }}
            className="self-end text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
          >
            {expandedKpiCard === 'due-soon' ? 'Collapse' : 'View tasks →'}
          </button>
        </div>
      </div>

      {expandedKpiCard && (() => {
        const panelTaskRows = getExpandedKpiRisks(expandedKpiCard).map((risk) => ({
          risk,
          task: getRiskTasks(risk)[0] || null
        }));

        return (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${getExpandedKpiDotClass(expandedKpiCard)}`}></span>
                <h3 className="text-sm font-bold text-slate-900">
                  {getExpandedKpiTitle(expandedKpiCard)}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  {panelTaskRows.length} tasks
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpandedKpiCard(null)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Close</span>
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              {panelTaskRows.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1">task_alt</span>
                  <p className="text-xs font-medium">No tasks found in this category.</p>
                </div>
              ) : (
                panelTaskRows.map(({ risk, task }) => {
                  const priority = task?.priority || (risk.impact === 'Critical' ? 'Critical' : risk.impact === 'High' ? 'High' : 'Medium');
                  const progress = task?.progress ?? Math.max(25, Math.min(95, Math.round(((risk.score ?? 10) / 25) * 100)));
                  const owner = task?.owner.name || risk.owner;
                  const ownerInitials = task?.owner.initials || risk.ownerInitials || owner.slice(0, 2).toUpperCase();
                  const ownerAvatarColor = task?.owner.avatarColor || risk.ownerAvatarColor || 'bg-[#1877f2]';
                  const rowId = task?.id || risk.id;
                  const rowTitle = task?.title || getRiskTaskTitle(risk);

                  return (
                    <div
                      key={`${risk.id}-${rowId}`}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              priority === 'Critical'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}
                          >
                            {priority}
                          </span>
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {rowId} - {rowTitle}
                          </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-500">
                          <span>Sprint: <strong className="text-slate-700">{task?.sprint || risk.sprint || currentSprint}</strong></span>
                          <span>Due: <strong className="text-rose-600">{task?.dueDate || risk.dueRelative || risk.dueDate || 'No due date'}</strong></span>
                          <span>Status: <strong className="text-blue-600">{task?.status || risk.status}</strong></span>
                          <span>Progress: <strong className="text-slate-800">{progress}%</strong></span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-full ${ownerAvatarColor} text-white text-[9px] font-bold flex items-center justify-center`}>
                              {ownerInitials}
                            </div>
                            <span>{owner}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-1.5 shrink-0">
                        {[
                          ['person_add', 'Reassign Owner', 'reassign'],
                          ['edit_calendar', 'Update Due Date', 'dueDate'],
                          ['chat_bubble', 'Add Comment', 'comment'],
                          ['block', 'Mark as Blocked', 'blocked']
                        ].map(([icon, label, actionType]) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => openRiskTaskAction(actionType as TaskActionType, risk, task)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer ${
                              icon === 'block' ? 'hover:bg-rose-50 hover:border-rose-300' : 'hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[14px] ${icon === 'block' ? 'text-rose-500' : 'text-blue-500'}`}>
                              {icon}
                            </span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* 3. Middle Section: Risk Trend by Sprint Chart */}
      <div className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#1877f2] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">stacked_bar_chart</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0f172a]">Risk Trend by Sprint</h3>
                <p className="text-[11px] text-[#64748b]">
                  Track total identified risks and critical risk evolution across sprints
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-[#475569]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                  Critical
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                  High
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                  Medium
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                  Low
                </div>
              </div>

              {!isAllOpenSprints && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRiskTrendCountDropdown(!showRiskTrendCountDropdown)}
                    className="px-2.5 py-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[11px] font-semibold text-[#0f172a] flex items-center gap-1 hover:bg-white transition-colors"
                  >
                    <span>{riskTrendSprintCount} Sprints</span>
                    <span className="material-symbols-outlined text-[14px] text-[#64748b]">expand_more</span>
                  </button>
                  {showRiskTrendCountDropdown && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            window.localStorage.setItem('riskTrendSprintCount', String(count));
                            setRiskTrendSprintCount(count);
                            setShowRiskTrendCountDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] font-medium ${
                            riskTrendSprintCount === count
                              ? 'text-[#1877f2] font-semibold bg-[#eff6ff]'
                              : 'text-[#0f172a]'
                          }`}
                        >
                          {count} Sprint{count > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Custom Bar Chart */}
          <div className="relative h-80 w-full pt-2">
            {/* Y Axis Gridlines */}
            <div className="absolute inset-x-8 top-0 bottom-9 flex flex-col justify-between pointer-events-none">
              {riskTrendChartTicks.map((tick) => (
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
              {riskTrendData.map((item) => (
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
                  onMouseEnter={() => setHoveredRiskSprint(item.sprint)}
                  onMouseLeave={() => setHoveredRiskSprint(null)}
                  className="flex flex-col items-center group relative h-full justify-end cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877f2]/40"
                >
                  {/* Tooltip on hover */}
                  {hoveredRiskSprint === item.sprint && (
                    <div className="absolute -top-12 z-20 bg-[#0f172a] text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                      <div className="font-bold">{item.sprint}</div>
                      <div>
                        Critical: {item.crit} · High: {item.high} · Medium: {item.med} · Low: {item.low}
                      </div>
                    </div>
                  )}

                  {/* Bars Group */}
                  <div className="flex items-end gap-1.5 px-2 h-full">
                    {riskTrendLevels.map((bar) => {
                      const value = item[bar.key];

                      return (
                        <div key={bar.key} className="flex h-full flex-col items-center justify-end gap-1">
                          <span className="text-[10px] font-bold text-[#334155] leading-none">{value}</span>
                          <div
                            className={`w-5 sm:w-7 ${bar.fillClass} rounded-t transition-all hover:opacity-80 min-h-[3px]`}
                            title={`${bar.label}: ${value}`}
                            style={{ height: `${(value / riskTrendChartMax) * 100}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* X Axis Labels */}
            <div className="absolute left-8 right-2 bottom-0 flex justify-around text-[10px] font-medium text-[#64748b]">
              {riskTrendData.map((item) => (
                <div key={item.sprint} className="text-center font-semibold">
                  {item.sprint}
                  {item.current && (
                    <span className="block text-[9px] text-[#1877f2] font-bold">(Current)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer stats banner */}
          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] gap-2">
            <div className="flex items-center gap-1.5 text-[#0f172a] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-red-500">warning</span>
              Total risks: {currentSprintRiskTotal}
              <span className={riskTotalDelta > 0 ? 'text-red-600' : riskTotalDelta < 0 ? 'text-emerald-600' : 'text-[#64748b]'}>
                ({riskTotalDelta > 0 ? '+' : ''}
                {riskTotalDelta} vs previous sprint)
              </span>
            </div>
            <div className="text-[#0f172a] font-medium">
              Average risk volume:{' '}
              <span className="font-bold text-[#1877f2]">{averageRisksPerSprint.toFixed(1)} risks / sprint</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Risk Table & Owner Risk Exposure Button */}
      <div className="bg-white rounded-xl border border-[#edf2f7] shadow-xs overflow-hidden">
        {/* Navigation Tabs (In-Progress, Overdue, AND Owner Risk Exposure Button!) */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs px-4 pt-3 border-b border-[#edf2f7]">
          <div className="flex items-center gap-5 flex-wrap">
            <button
              type="button"
              onClick={() => setOverviewTab('today')}
              className={`pb-3 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                overviewTab === 'today'
                  ? 'text-[#0b5cff] border-[#0b5cff]'
                  : 'text-[#475569] border-transparent hover:text-[#0f172a]'
              }`}
            >
              Risk Tasks In Progress
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#eff6ff] text-[#0b5cff]">
                {inProgressRiskCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOverviewTab('overdue')}
              className={`pb-3 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                overviewTab === 'overdue'
                  ? 'text-[#0b5cff] border-[#0b5cff]'
                  : 'text-[#475569] border-transparent hover:text-[#0f172a]'
              }`}
            >
              Risk Tasks Overdue
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-[#0f172a]">
                {overdueRiskCount}
              </span>
            </button>

          </div>

          {/* NÚT OWNER RISK EXPOSURE (THE USER REQUESTED THIS BUTTON TO OPEN SCREEN 2: ALL RISKS & RISK EXPOSURE ANALYSIS) */}
        </div>

        {/* Search and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#edf2f7]">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks by ID, summary, or project..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:bg-white focus:outline-none focus:border-[#1877f2] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden">
              <button
                type="button"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#64748b]">calendar_today</span>
                <span>Tất cả các ngày</span>
                <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">expand_more</span>
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {['Tất cả các ngày', 'Hôm nay', '7 ngày tới', '14 ngày tới', 'Quá hạn'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDateRangeFilter(d);
                        setShowDateDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#f8fafc] font-medium text-[#0f172a]"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative hidden">
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#64748b]">filter_list</span>
                <span>Filters</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 p-3 text-xs space-y-2">
                  <span className="block text-[11px] font-bold text-[#64748b] uppercase">Impact Level</span>
                  {['all', 'Critical', 'High', 'Medium', 'Low'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setFilterImpact(lvl);
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded font-medium hover:bg-[#f8fafc] text-[#0f172a]"
                    >
                      {lvl === 'all' ? 'Tất cả mức độ' : lvl}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors whitespace-nowrap"
              >
                <span>Sort: Score High-Low</span>
                <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">expand_more</span>
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {[
                    { val: 'score-desc', label: 'Due date (Nearest)' },
                    { val: 'score-desc', label: 'Risk Score (High-Low)' },
                    { val: 'prob-desc', label: 'Probability' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setShowSortDropdown(false)}
                      className="w-full text-left px-3 py-2 hover:bg-[#f8fafc] font-medium text-[#0f172a]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overview Risks Table */}
        <div className="bg-white rounded-xl border border-[#edf2f7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-[#edf2f7] tracking-wider uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-28">RISK ID</th>
                  <th className="py-3 px-3">RISK</th>
                  <th className="py-3 px-3 w-32">PROBABILITY</th>
                  <th className="py-3 px-3 w-32">IMPACT</th>
                  <th className="py-3 px-3 w-20 text-center">SCORE</th>
                  <th className="py-3 px-3 w-36">OWNER</th>
                  <th className="py-3 px-3 w-36">DUE DATE</th>
                  <th className="py-3 px-3 w-28">STATUS</th>
                  <th className="py-3 px-4 w-24 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {overviewTableRisks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc]/90 transition-colors group">
                    {/* Risk ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#0f172a]">
                      {item.id}
                    </td>

                    {/* Risk & Description */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0f172a] group-hover:text-[#1877f2] transition-colors">
                          {getRiskTaskTitle(item)}
                        </span>
                        <span className="text-[11px] text-[#64748b] line-clamp-1">{item.title}</span>
                      </div>
                    </td>

                    {/* Probability */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getProbBadge(item.probability, item.probabilityPct)}
                    </td>

                    {/* Impact */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getImpactBadge(item.impact, item.impactScore)}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          (item.score ?? 0) >= 15
                            ? 'bg-red-50 text-red-600'
                            : (item.score ?? 0) >= 10
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-slate-100 text-[#0f172a]'
                        }`}
                      >
                        {item.score ?? 0}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            item.ownerAvatarColor || 'bg-[#1877f2]'
                          } text-white text-[10px] font-bold flex items-center justify-center shadow-2xs`}
                        >
                          {item.ownerInitials || item.owner.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-[#0f172a]">{item.owner}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#0f172a]">{item.dueDate || '15/09/2026'}</span>
                        <span className="text-[10px] text-[#94a3b8]">{item.dueRelative || 'In 6 days'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedRiskForReview(item)}
                        className="px-3 py-1.5 text-xs font-bold text-[#0057ff] bg-[#eff6ff] hover:bg-[#dbeafe] rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-white border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#64748b]">
            <button
              type="button"
              onClick={() => setShowAllOverviewRisks((value) => !value)}
              className="inline-flex items-center gap-1.5 font-bold text-[#1877f2] hover:text-[#166fe5] hover:underline cursor-pointer group"
            >
              <span>{showAllOverviewRisks ? 'Show less' : 'View all risks'}</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                {showAllOverviewRisks ? 'expand_less' : 'arrow_forward'}
              </span>
            </button>

            <span className="text-xs text-[#64748b]">
              Showing <span className="font-bold text-[#0f172a]">{overviewTableRisks.length}</span> of{' '}
              <span className="font-bold text-[#0f172a]">{overviewTabRiskCount}</span> risks
            </span>
          </div>
        </div>

        {/* Review Modal */}
        {selectedRiskForReview && createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#e2e8f0] animate-in zoom-in-95 duration-150 overflow-hidden">
              <div className="px-6 py-5 flex items-start justify-between border-b border-[#edf2f7]">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#dbeafe] text-[#1877f2] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">policy</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#0f172a] text-base leading-snug break-words">
                      Review {selectedRiskForReview.id} — {getRiskTaskTitle(selectedRiskForReview)}
                    </h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      {selectedRiskForReview.sprint || currentSprint}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRiskForReview(null)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  aria-label="Close review"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              <div className="px-6 py-6 text-xs">
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#edf2f7] space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748b] font-medium">Current Risk Score:</span>
                    <span className="text-red-600 font-extrabold text-base">
                      {selectedRiskForReview.score ?? 0} / 25
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748b] font-medium">Probability / Impact:</span>
                    <span className="font-bold text-[#0f172a] text-right">
                      {selectedRiskForReview.probability} ({selectedRiskForReview.probabilityPct}%) / {selectedRiskForReview.impact} ({selectedRiskForReview.impactScore})
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748b] font-medium">Assigned Owner:</span>
                    <span className="font-bold text-[#0f172a]">{selectedRiskForReview.owner}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#edf2f7]">
                  <div className="text-xs font-extrabold text-[#0f172a] mb-3">Recommended Actions for PM:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['person_add', 'Reassign Owner', 'reassign'],
                      ['edit_calendar', 'Update Due Date', 'dueDate'],
                      ['chat_bubble', 'Add Comment', 'comment'],
                      ['block', 'Mark as Blocked', 'blocked']
                    ].map(([icon, label, actionType]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const risk = selectedRiskForReview;
                          const task = getOwnerTaskForRisk(risk);
                          setSelectedRiskForReview(null);
                          openRiskTaskAction(actionType as TaskActionType, risk, task);
                        }}
                        className="flex items-center gap-2 px-3 py-3 rounded-xl border border-[#dbe3ef] text-[#334155] font-semibold text-[12px] bg-white hover:bg-[#f8fafc] hover:border-[#bfdbfe] transition-colors shadow-2xs text-left"
                      >
                        <span className={`material-symbols-outlined text-[22px] ${icon === 'block' ? 'text-rose-500' : 'text-blue-600'}`}>
                          {icon}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#edf2f7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRiskForReview(null)}
                  className="px-4 py-2 bg-white border border-[#dbe3ef] text-[#334155] rounded-lg text-xs font-bold hover:bg-[#f8fafc] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

