import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AuditDocument, NavigationTab, RiskMatrixItem, TaskItem } from '../types';
import { SPRINT_DATA } from '@/data/appData';

const ALL_OPEN_SPRINTS = 'All Open Sprints';
type TaskActionType = 'reassign' | 'dueDate' | 'comment' | 'blocked';

const FALLBACK_TEAM_MEMBERS = [
  { name: 'Alex Johnson', initials: 'AJ', avatarColor: 'bg-blue-600', role: 'Frontend Lead' },
  { name: 'Sarah Chen', initials: 'SC', avatarColor: 'bg-emerald-600', role: 'QA & Security' },
  { name: 'Maria Kim', initials: 'MK', avatarColor: 'bg-sky-600', role: 'Database Engineer' },
  { name: 'David Tran', initials: 'DT', avatarColor: 'bg-indigo-600', role: 'DevOps / SRE' },
  { name: 'Linh Nguyen', initials: 'LN', avatarColor: 'bg-purple-600', role: 'Backend Dev' }
];

const ACTION_BUTTONS: Array<[string, string, TaskActionType]> = [
  ['person_add', 'Reassign Owner', 'reassign'],
  ['edit_calendar', 'Update Due Date', 'dueDate'],
  ['chat_bubble', 'Add Comment', 'comment'],
  ['block', 'Mark as Blocked', 'blocked']
];

interface TaskActionModalProps {
  action: { type: TaskActionType; task: TaskItem } | null;
  ownerOptions: Array<TaskItem['owner']>;
  onClose: () => void;
  onSave: (task: TaskItem, message: string) => void;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({ action, ownerOptions, onClose, onSave }) => {
  const task = action?.task;
  const type = action?.type;
  const [selectedOwner, setSelectedOwner] = useState(task?.owner.name || '');
  const [handoverNote, setHandoverNote] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState(task?.dueDate || '');
  const [dueDateReason, setDueDateReason] = useState('');
  const [commentText, setCommentText] = useState('');
  const [blockerStatus, setBlockerStatus] = useState<'Blocked' | 'At Risk' | 'Overdue'>('Blocked');
  const [blockerReason, setBlockerReason] = useState('');

  React.useEffect(() => {
    if (!task) return;
    setSelectedOwner(task.owner.name);
    setSelectedDueDate(task.dueDate);
    setBlockerStatus(task.status === 'Overdue' ? 'Overdue' : 'Blocked');
    setHandoverNote('');
    setDueDateReason('');
    setCommentText('');
    setBlockerReason('');
  }, [task, type]);

  if (!task || !type) return null;

  const sprintOwners = ownerOptions.length > 0 ? ownerOptions : FALLBACK_TEAM_MEMBERS;

  const title =
    type === 'reassign'
      ? 'Reassign Task Owner'
      : type === 'dueDate'
      ? 'Update Due Date'
      : type === 'comment'
      ? 'Add PM Comment'
      : 'Mark Task as Blocked';
  const icon =
    type === 'reassign'
      ? 'person_add'
      : type === 'dueDate'
      ? 'edit_calendar'
      : type === 'comment'
      ? 'chat_bubble'
      : 'block';

  const handleConfirm = () => {
    if (type === 'reassign') {
      const member = sprintOwners.find((item) => item.name === selectedOwner);
      if (!member) return;
      onSave(
        {
          ...task,
          owner: {
            name: member.name,
            initials: member.initials,
            avatarColor: member.avatarColor,
            role: member.role
          }
        },
        `Reassigned ${task.id} to ${member.name}${handoverNote ? ' with handover note' : ''}`
      );
    }

    if (type === 'dueDate') {
      onSave(
        { ...task, dueDate: selectedDueDate },
        `Updated due date for ${task.id} to ${selectedDueDate}${dueDateReason ? ' with reason' : ''}`
      );
    }

    if (type === 'comment') {
      if (!commentText.trim()) return;
      onSave(task, `Comment added to ${task.id}`);
    }

    if (type === 'blocked') {
      onSave(
        { ...task, status: blockerStatus },
        `${task.id} marked as ${blockerStatus}${blockerReason ? ' with blocker reason' : ''}`
      );
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500 truncate">
                {task.id} - {task.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Close action modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {type === 'reassign' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select New Owner:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {sprintOwners.map((member) => {
                    const isSelected = selectedOwner === member.name;
                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => setSelectedOwner(member.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected ? 'border-blue-500 bg-blue-50/60 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full ${member.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                            {member.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{member.name}</div>
                            <span className="text-[10px] text-slate-500 font-normal">{member.role}</span>
                          </div>
                        </div>
                        {isSelected && <span className="material-symbols-outlined text-[18px] text-blue-600">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Handover Note (Optional):</label>
                <input
                  type="text"
                  value={handoverNote}
                  onChange={(event) => setHandoverNote(event.target.value)}
                  placeholder="e.g. Please sync with QA before deploy..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {type === 'dueDate' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Preset Due Dates:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 5 days', 'Next Sprint'].map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDueDate(date)}
                      className={`py-2 px-2.5 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        selectedDueDate === date ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or Custom Due Date:</label>
                <input
                  type="text"
                  value={selectedDueDate}
                  onChange={(event) => setSelectedDueDate(event.target.value)}
                  placeholder="e.g. 28-10-2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Extension Reason (Optional):</label>
                <input
                  type="text"
                  value={dueDateReason}
                  onChange={(event) => setDueDateReason(event.target.value)}
                  placeholder="e.g. Blocked on upstream dependency"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {type === 'comment' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">PM Comment & Action Note:</label>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={4}
                  placeholder="Enter comments, blocker updates or mitigation notes for this task..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">Comment will be logged to task activity history and notified to owner.</p>
            </>
          )}

          {type === 'blocked' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Status Flag:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Blocked', 'At Risk', 'Overdue'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setBlockerStatus(status)}
                      className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        blockerStatus === status ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blocker Reason & Remediation Details:</label>
                <textarea
                  value={blockerReason}
                  onChange={(event) => setBlockerReason(event.target.value)}
                  rows={3}
                  placeholder="Explain why this task is blocked..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Update Information
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  tasks: TaskItem[];
  risks: RiskMatrixItem[];
  auditDocs: AuditDocument[];
  selectedSprint: string;
  onSelectSprint: (sprint: string) => void;
  onOpenRiskModal?: (riskLevel?: string) => void;
  onToggleTaskComplete?: (taskId: string) => void;
  onUpdateTask?: (task: TaskItem) => void;
  onToggleAuditDocStatus?: (docId: string, newStatus: AuditDocument['pmReviewStatus']) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  tasks,
  risks,
  auditDocs,
  selectedSprint,
  onSelectSprint,
  onOpenRiskModal,
  onUpdateTask,
  onToggleAuditDocStatus
}) => {
  const [trendRange, setTrendRange] = useState('Last 4 sprints');
  const [showTrendMenu, setShowTrendMenu] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showCriticalRiskTasks, setShowCriticalRiskTasks] = useState(false);
  const [showAuditPendingDocs, setShowAuditPendingDocs] = useState(false);
  const [selectedSprintDetail, setSelectedSprintDetail] = useState<string | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskItem | null>(null);
  const [selectedCriticalTask, setSelectedCriticalTask] = useState<{
    task?: TaskItem;
    risk: RiskMatrixItem;
  } | null>(null);
  const [taskAction, setTaskAction] = useState<{ type: TaskActionType; task: TaskItem } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const baseSprintOptions = Object.keys(SPRINT_DATA);
  const openSprintOptions = baseSprintOptions.filter((sprint) =>
    tasks.some((task) => task.sprint === sprint && (task.status !== 'Completed' || task.status === 'Overdue'))
  );
  const isAllOpenSprints = selectedSprint === ALL_OPEN_SPRINTS;
  const fallbackSprintStats = SPRINT_DATA[baseSprintOptions[baseSprintOptions.length - 1] as keyof typeof SPRINT_DATA];
  const scopedTasks = isAllOpenSprints
    ? tasks.filter((task) => task.sprint && openSprintOptions.includes(task.sprint))
    : tasks.filter((task) => task.sprint === selectedSprint);
  const scopedRisks = isAllOpenSprints
    ? risks.filter((risk) => risk.sprint && openSprintOptions.includes(risk.sprint))
    : risks.filter((risk) => risk.sprint === selectedSprint);
  const normalizeSprintLabel = (value?: string) => (value || '').toLowerCase().replace(/\s+/g, '');
  const sprintDigits = (value?: string) => (value || '').match(/\d+/)?.[0] || '';
  const docMatchesSprint = (doc: AuditDocument, sprint: string) =>
    normalizeSprintLabel(doc.sprint) === normalizeSprintLabel(sprint) ||
    (!!sprintDigits(doc.sprint) && sprintDigits(doc.sprint) === sprintDigits(sprint));
  const scopedAuditDocs = isAllOpenSprints
    ? auditDocs
    : auditDocs.filter((doc) => docMatchesSprint(doc, selectedSprint));
  const visibleAuditDocs = scopedAuditDocs.length > 0 ? scopedAuditDocs : auditDocs;
  const auditPendingDocs = visibleAuditDocs.filter(
    (doc) =>
      doc.pmReviewStatus !== 'Completed' &&
      doc.pmReviewStatus !== 'Rework' &&
      (doc.aiAuditStatus === 'AI Passed' || doc.pmReviewStatus === 'Pending')
  );
  const formatPercent = (value: number) =>
    value.toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
  const completedPercent = scopedTasks.length
    ? (scopedTasks.filter((task) => task.status === 'Completed').length / scopedTasks.length) * 100
    : 0;
  const inProgressPercent = scopedTasks.length
    ? (scopedTasks.filter((task) => task.status === 'In Progress').length / scopedTasks.length) * 100
    : 0;
  const pendingPercent = scopedTasks.length
    ? (scopedTasks.filter((task) => task.status === 'Pending' || task.status === 'To Do').length / scopedTasks.length) * 100
    : 0;
  const overduePercent = scopedTasks.length
    ? (scopedTasks.filter((task) => task.status === 'Overdue').length / scopedTasks.length) * 100
    : 0;
  const aggregateStats = {
    health: `${formatPercent(completedPercent)}%`,
    healthStatus: scopedTasks.some((task) => task.status === 'Overdue') ? 'At Risk' : 'On Track',
    healthDelta: '0%',
    criticalRiskCount: scopedRisks.filter((risk) => !['Mitigated', 'Completed'].includes(risk.status)).length,
    criticalRiskDelta: '0',
    auditPendingCount: auditPendingDocs.length,
    auditPendingDelta: fallbackSprintStats.auditPendingDelta,
    totalTasks: scopedTasks.length,
    completedTasks: scopedTasks.filter((task) => task.status === 'Completed').length,
    completedRate: `${formatPercent(completedPercent)}%`,
    inProgressTasks: scopedTasks.filter((task) => task.status === 'In Progress').length,
    inProgressRate: `${formatPercent(inProgressPercent)}%`,
    pendingTasks: scopedTasks.filter((task) => task.status === 'Pending' || task.status === 'To Do').length,
    pendingRate: `${formatPercent(pendingPercent)}%`,
    overdueTasks: scopedTasks.filter((task) => task.status === 'Overdue').length,
    overdueRate: `${formatPercent(overduePercent)}%`,
    auditTotalDocs: fallbackSprintStats.auditTotalDocs,
    auditAgentPassed: fallbackSprintStats.auditAgentPassed,
    auditPmApproved: fallbackSprintStats.auditPmApproved,
    auditPendingPm: auditPendingDocs.length,
    auditRejected: fallbackSprintStats.auditRejected
  };
  const currentSprintStats = isAllOpenSprints
    ? aggregateStats
    : {
        ...(SPRINT_DATA[selectedSprint as keyof typeof SPRINT_DATA] || fallbackSprintStats),
        auditPendingCount: auditPendingDocs.length,
        auditPendingPm: auditPendingDocs.length
      };
  const trendBaseSprintOptions = isAllOpenSprints ? openSprintOptions : baseSprintOptions;
  const trendSprintCount =
    isAllOpenSprints
      ? trendBaseSprintOptions.length
      : trendRange === 'Last 4 sprints'
      ? 4
      : trendRange === 'Last 6 sprints'
      ? 6
      : trendBaseSprintOptions.length;
  const trendSprintOptions = trendBaseSprintOptions.slice(-trendSprintCount);
  const sprintTrendData = trendSprintOptions.map((sprint) => {
    const stats = SPRINT_DATA[sprint as keyof typeof SPRINT_DATA];
    return {
      sprint,
      created: stats.totalTasks,
      completed: stats.completedTasks,
      completionRate:
        stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 10000) / 100 : 0
    };
  });
  const formatTrendPercent = (value: number) =>
    value.toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
  const maxTrendTasks = Math.max(
    ...sprintTrendData.flatMap((item) => [item.created, item.completed]),
    1
  );
  const trendTaskAxisStep = Math.max(1, Math.ceil((maxTrendTasks * 1.15) / 4 / 5) * 5);
  const trendTaskAxisMax = trendTaskAxisStep * 7 - 20;
  const trendTaskAxisTicks = Array.from(
    { length: 5 },
    (_, index) => trendTaskAxisMax - (trendTaskAxisMax / 4) * index
  );
  const getTrendPointX = (index: number) =>
    sprintTrendData.length <= 1 ? 200 : ((index + 0.5) / sprintTrendData.length) * 400;
  const getTrendPointY = (completionRate: number) => 95 - completionRate * 0.85;
  const activeRisks = scopedRisks.filter(
    (risk) => !['Mitigated', 'Completed'].includes(risk.status)
  );
  const riskProbabilityRows: Array<RiskMatrixItem['probability']> = ['High', 'Medium', 'Low'];
  const riskImpactColumns: Array<RiskMatrixItem['impact']> = ['Low', 'Medium', 'High', 'Critical'];
  const getRiskExposureCount = (
    probability: RiskMatrixItem['probability'],
    impact: RiskMatrixItem['impact']
  ) => activeRisks.filter((risk) => risk.probability === probability && risk.impact === impact).length;
  const getRiskExposureCellClass = (
    probability: RiskMatrixItem['probability'],
    impact: RiskMatrixItem['impact'],
    count: number
  ) => {
    if (count === 0) return 'bg-[#eff6ff] text-[#64748b] font-medium';
    if (probability === 'High' && impact === 'Critical') return 'bg-[#ef4444] text-white font-bold ring-2 ring-red-300';
    if (probability === 'High' && impact === 'High') return 'bg-[#fca5a5] text-[#991b1b] font-semibold';
    if (probability === 'High' || impact === 'High' || impact === 'Critical') return 'bg-[#fed7aa] text-[#9a3412] font-semibold';
    return 'bg-[#fef9c3] text-[#854d0e] font-semibold';
  };

  const normalizeAttentionText = (value?: string) => (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizeAttentionDate = (value?: string) => (value || '').trim();
  const isTaskLinkedToRisk = (task: TaskItem) =>
    activeRisks.some((risk) => {
      if (risk.sprint && task.sprint !== risk.sprint) return false;

      const sameOwner = normalizeAttentionText(task.owner.name) === normalizeAttentionText(risk.owner);
      const sameStatus = task.status === risk.status;
      const sameDueDate = normalizeAttentionDate(task.dueDate) === normalizeAttentionDate(risk.dueDate);
      const taskTitle = normalizeAttentionText(task.title);
      const riskTitle = normalizeAttentionText(risk.title);
      const titleMatches = riskTitle.includes(taskTitle) || taskTitle.includes(riskTitle);

      return titleMatches || (sameOwner && (sameStatus || sameDueDate || risk.affectedFunction === task.project));
    });
  const attentionTasks = scopedTasks
    .filter((task) => task.status !== 'Completed' && isTaskLinkedToRisk(task))
    .slice(0, 5);
  const openSprintCards = openSprintOptions
    .map((sprint) => {
      const sprintTaskList = tasks.filter((task) => task.sprint === sprint);
      const totalTasks = sprintTaskList.length;
      const completedTasks = sprintTaskList.filter((task) => task.status === 'Completed').length;
      const overdueTasks = sprintTaskList.filter((task) => task.status === 'Overdue').length;
      const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const badge = overdueTasks > 0 ? 'At Risk' : progress >= 70 ? 'On Track' : 'Delay Risk';

      return {
        sprint,
        totalTasks,
        overdueTasks,
        progress,
        badge,
        badgeClass:
          badge === 'On Track'
            ? 'bg-emerald-50 text-emerald-700'
            : badge === 'At Risk'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-red-50 text-red-700'
      };
    })
    .filter((sprint) => sprint.totalTasks > 0);
  const getSprintOverview = (sprint: string) => {
    const sprintTaskList = tasks.filter((task) => task.sprint === sprint);
    const totalTasks = sprintTaskList.length;
    const completedTasks = sprintTaskList.filter((task) => task.status === 'Completed').length;
    const overdueTasks = sprintTaskList.filter((task) => task.status === 'Overdue').length;
    const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const badge = overdueTasks > 0 ? 'At Risk' : progress >= 70 ? 'On Track' : 'Delay Risk';
    const keyTasks = sprintTaskList
      .filter((task) => task.status !== 'Completed')
      .sort((a, b) => {
        const statusRank: Record<string, number> = { Overdue: 0, 'In Progress': 1, Pending: 2, 'To Do': 3 };
        return (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
      })
      .slice(0, 6);

    return {
      sprint,
      totalTasks,
      completedTasks,
      overdueTasks,
      progress,
      badge,
      keyTasks
    };
  };
  const criticalRisks = [...activeRisks].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const normalizeText = (value?: string) => (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizeDate = (value?: string) => (value || '').trim();
  const findTaskForRisk = (risk: RiskMatrixItem) => {
    const sprintTasks = tasks.filter((task) => isAllOpenSprints || task.sprint === (risk.sprint || selectedSprint));
    const ownerName = normalizeText(risk.owner);
    const riskTitle = normalizeText(risk.title);
    const riskDueDate = normalizeDate(risk.dueDate);

    return (
      sprintTasks.find(
        (task) =>
          normalizeText(task.owner.name) === ownerName &&
          normalizeDate(task.dueDate) === riskDueDate &&
          task.status === risk.status
      ) ||
      sprintTasks.find(
        (task) =>
          normalizeText(task.owner.name) === ownerName &&
          task.status === risk.status &&
          task.status !== 'Completed'
      ) ||
      sprintTasks.find(
        (task) =>
          normalizeText(task.owner.name) === ownerName &&
          task.status !== 'Completed'
      ) ||
      sprintTasks.find(
        (task) =>
          riskTitle.includes(normalizeText(task.title)) ||
          normalizeText(task.title).includes(riskTitle)
      )
    );
  };
  const toTaskStatus = (status: RiskMatrixItem['status'] | TaskItem['status']): TaskItem['status'] => {
    if (['Completed', 'In Progress', 'Pending', 'Overdue', 'To Do', 'At Risk', 'Blocked', 'Planned'].includes(status)) {
      return status as TaskItem['status'];
    }
    return status === 'Open' || status === 'Monitoring' ? 'At Risk' : 'In Progress';
  };
  const getRiskTaskDisplay = (risk: RiskMatrixItem, task?: TaskItem) => ({
    id: task?.id || risk.id,
    title: task?.title || risk.riskName || risk.affectedFunction || 'Risk Trigger',
    project: task?.project || risk.affectedFunction || 'PMA Agent',
    sprint: task?.sprint || risk.sprint || selectedSprint,
    priority: task?.priority || (risk.impact === 'Critical' ? 'Critical' : risk.impact === 'High' ? 'High' : 'Medium'),
    status: task?.status || toTaskStatus(risk.status),
    progress: task?.progress ?? (risk.status === 'Overdue' ? 35 : risk.status === 'In Progress' ? 55 : 25),
    dueDate: task?.dueDate || risk.dueDate || 'No due date',
    owner: {
      name: task?.owner.name || risk.owner,
      initials: task?.owner.initials || risk.ownerInitials || risk.owner.split(' ').map((part) => part[0]).join(''),
      avatarColor: task?.owner.avatarColor || risk.ownerAvatarColor || 'bg-[#1877f2]'
    },
    riskScore: risk.score ?? 0,
    mitigationPlan: risk.mitigationPlan
  });
  const openTaskAction = (type: TaskActionType, task: TaskItem) => {
    setTaskAction({ type, task });
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
    setSelectedTaskDetail((current) => (current?.id === updatedTask.id ? updatedTask : current));
    setSelectedCriticalTask((current) =>
      current?.task?.id === updatedTask.id ? { ...current, task: updatedTask } : current
    );
    showToast(message);
  };
  const handleApproveAuditDoc = (doc: AuditDocument) => {
    onToggleAuditDocStatus?.(doc.id, 'Completed');
    showToast(`${doc.title} approved`);
  };
  const renderAuditPendingModal = () =>
    showAuditPendingDocs
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">approval_delegation</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900">
                        Pending PM Review Documents ({auditPendingDocs.length} Docs)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
                        Need PM Check
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All {auditPendingDocs.length} documents passed agent validation check. PM decision required.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditPendingDocs(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                  aria-label="Close audit pending documents"
                >
                  <span className="material-symbols-outlined text-[21px]">close</span>
                </button>
              </div>

              <div className="px-6 py-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-semibold">Document Name</th>
                      <th className="pb-3 font-semibold w-20">Sprint</th>
                      <th className="pb-3 font-semibold w-44">Prepared By / Owner</th>
                      <th className="pb-3 font-semibold w-28">Submitted</th>
                      <th className="pb-3 font-semibold w-40">Status</th>
                      <th className="pb-3 font-semibold text-right w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditPendingDocs.map((doc, index) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-[22px] ${index % 3 === 0 ? 'text-blue-600' : index % 3 === 1 ? 'text-purple-600' : 'text-emerald-600'}`}>
                              description
                            </span>
                            <span className="font-bold text-slate-900 leading-tight max-w-[140px]">{doc.title}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-bold">
                            {doc.sprint}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${doc.owner.avatarBg} text-white font-bold text-[10px] flex items-center justify-center`}>
                              {doc.owner.initials}
                            </div>
                            <span className="font-semibold text-slate-700">{doc.owner.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">{doc.lastUpdated || 'Today, 09:20'}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending PM Check
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                              Approve
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproveAuditDoc(doc)}
                              className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAuditPendingDocs(false);
                                onNavigate('audit-docs');
                              }}
                              className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors inline-flex items-center gap-1"
                            >
                              Review
                              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuditPendingDocs(false);
                    onNavigate('audit-docs');
                  }}
                  className="text-xs font-bold text-purple-700 hover:text-purple-800"
                >
                  Go to Audit Docs workspace →
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuditPendingDocs(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
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
      {renderAuditPendingModal()}

      {/* Header Greeting & Selectors */}
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
        <div className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#cbd5e1] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[22px]">vital_signs</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#475569]">Sprint Health</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  {currentSprintStats.healthStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight">
              {currentSprintStats.health}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
            <span>vs last sprint</span>
            <span className="text-[#10b981] font-semibold flex items-center">
              ↑ {currentSprintStats.healthDelta}
            </span>
          </div>
        </div>

        {/* Card 2: Critical Risk */}
        <div
          onClick={() => setShowCriticalRiskTasks(true)}
          className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-red-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fff7ed] flex items-center justify-center text-[#f97316] group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <span className="text-[13px] font-semibold text-[#475569] group-hover:text-red-700">
                Critical Risk
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity">
              arrow_forward
            </span>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight">
              {currentSprintStats.criticalRiskCount}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#ef4444] font-semibold flex items-center">
              ↑ {currentSprintStats.criticalRiskDelta}
            </span>
            <span className="text-[#64748b]">vs last sprint</span>
          </div>
        </div>

        {/* Card 3: Audit Pending */}
        <div
          onClick={() => setShowAuditPendingDocs(true)}
          className="bg-white p-5 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-purple-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faf5ff] flex items-center justify-center text-[#9333ea] shrink-0 group-hover:bg-purple-100 transition-colors">
                <span className="material-symbols-outlined text-[22px]">description</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#475569] group-hover:text-purple-700">
                  Audit Pending
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f3e8ff] text-[#7e22ce] w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></span>
                  Need PM Check
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity">
              arrow_forward
            </span>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight">
              {currentSprintStats.auditPendingCount}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#ef4444] font-semibold flex items-center">
              ↑ {currentSprintStats.auditPendingDelta}
            </span>
            <span className="text-[#64748b]">vs last sprint</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Sprint Delivery Trend & Risk Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sprint Delivery Trend */}
        {false && (
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1877f2]">
                    <span className="material-symbols-outlined text-[19px]">fact_check</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0f172a]">Open Sprints - Execution Overview</h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1877f2]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
                  {openSprintCards.length} Active Sprints
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {openSprintCards.map((sprint) => (
                  <div key={sprint.sprint} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#cbd5e1] hover:shadow-xs transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[13px] text-[#0f172a]">{sprint.sprint}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sprint.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sprint.badge === 'On Track' ? 'bg-emerald-500' : sprint.badge === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                          {sprint.badge}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs text-[#64748b] mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-[#0f172a] text-[13px]">{sprint.progress}%</span>
                      </div>
                      <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${sprint.badge === 'On Track' ? 'bg-emerald-500' : sprint.badge === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sprint.progress}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#edf2f7]">
                        <span className="text-[#64748b]">Tasks: <strong className="text-[#0f172a] font-semibold">{sprint.totalTasks}</strong></span>
                        <span className={`font-semibold ${sprint.overdueTasks > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>Overdue: {sprint.overdueTasks}</span>
                      </div>
                    </div>
                    <div className="pt-3 mt-1 border-t border-[#edf2f7]/60">
                      <button type="button" onClick={() => setSelectedSprintDetail(sprint.sprint)} className="text-xs font-semibold text-[#1877f2] hover:text-[#004ac6] flex items-center justify-between w-full group cursor-pointer">
                        <span>View {sprint.sprint}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9]">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-1.5 font-bold text-[13px] text-[#0f172a]">
                  <span>⚠️ Tasks cần chú ý - Open Sprints</span>
                </div>
                <button type="button" onClick={() => onNavigate('progress-tasks')} className="text-[12px] text-[#1877f2] font-semibold hover:underline">View all tasks →</button>
              </div>
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
                    {attentionTasks.map((t) => {
                      const priorityColor = t.priority === 'Critical' ? 'bg-[#fee2e2] text-[#dc2626]' : t.priority === 'High' ? 'bg-[#ffedd5] text-[#ea580c]' : 'bg-[#fef3c7] text-[#d97706]';
                      return (
                        <tr key={t.id} className="hover:bg-[#f8fafc]/80 transition-colors group cursor-pointer">
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${priorityColor}`}>{t.priority}</span></td>
                          <td className="py-2.5 font-medium text-[#0f172a] truncate max-w-[190px]"><span className="hover:text-[#1877f2] transition-colors">{t.title}</span></td>
                          <td className="py-2.5 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1877f2] border border-blue-200">{t.sprint || '-'}</span></td>
                          <td className="py-2.5"><div className="flex flex-col gap-1 w-20"><span className="text-[11px] font-semibold text-[#0f172a]">{t.progress}%</span><div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden"><div className="bg-[#1877f2] h-full rounded-full" style={{ width: `${t.progress}%` }}></div></div></div></td>
                          <td className={`py-2.5 font-semibold ${t.dueDate === 'Today' || t.status === 'Overdue' ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>{t.dueDate}</td>
                          <td className="py-2.5"><div className="flex items-center gap-1.5"><div className={`w-5 h-5 rounded-full ${t.owner.avatarColor} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{t.owner.initials}</div><span className="text-[#475569] text-[11px] truncate">{t.owner.name}</span></div></td>
                          <td className="py-2.5 text-right"><button type="button" onClick={() => setSelectedTaskDetail(t)} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1877f2] hover:text-[#004ac6] bg-[#eff6ff] hover:bg-[#dbeafe] px-2 py-1 rounded transition-colors cursor-pointer">View ↗</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#1877f2]">
                  trending_up
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">Sprint Delivery Trend</h2>
                  <p className="text-[12px] text-[#64748b]">Task created vs. completed across sprints</p>
                </div>
              </div>

              {/* Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAllOpenSprints) setShowTrendMenu(!showTrendMenu);
                  }}
                  className={`flex items-center gap-1 text-[12px] bg-white border border-[#e2e8f0] px-2.5 py-1 rounded-lg ${
                    isAllOpenSprints
                      ? 'text-[#1877f2] font-semibold cursor-default'
                      : 'text-[#64748b] cursor-pointer hover:bg-[#f8fafc]'
                  }`}
                  aria-disabled={isAllOpenSprints}
                >
                  <span>{isAllOpenSprints ? 'All Open Sprints' : trendRange}</span>
                  {!isAllOpenSprints && <span className="material-symbols-outlined text-[15px]">expand_more</span>}
                </button>
                {!isAllOpenSprints && showTrendMenu && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-[#edf2f7] rounded-lg shadow-md p-1 z-20 text-xs">
                    {['Last 4 sprints', 'Last 6 sprints'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setTrendRange(opt);
                          setShowTrendMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md ${
                          trendRange === opt ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
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
                {trendTaskAxisTicks.map((tick) => (
                  <span key={tick}>{Math.round(tick)}</span>
                ))}
              </div>
              <div className="absolute left-9 right-0 top-1 bottom-6 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-dashed border-[#f1f5f9]"></div>
                <div className="w-full border-b border-[#e2e8f0]"></div>
              </div>

              {/* SVG Line for Completion Rate */}
              <svg
                className="absolute left-9 right-0 top-1 bottom-6 w-[calc(100%-36px)] h-[calc(100%-28px)] overflow-visible pointer-events-none z-10"
                preserveAspectRatio="none"
                viewBox="0 0 400 100"
              >
                <path
                  d={sprintTrendData
                    .map((item, index) => {
                      const x = getTrendPointX(index);
                      const y = getTrendPointY(item.completionRate);
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                ></path>
                {sprintTrendData.map((item, index) => {
                  const x = getTrendPointX(index);
                  const y = getTrendPointY(item.completionRate);
                  return (
                    <circle
                      key={item.sprint}
                      cx={x}
                      cy={y}
                      fill="#8b5cf6"
                      r="4.5"
                      stroke="#ffffff"
                      strokeWidth="2"
                    ></circle>
                  );
                })}
              </svg>

              {/* Bars container */}
              <div className="absolute left-9 right-0 top-0 bottom-0 flex items-end justify-around pb-6 pt-1">
                {sprintTrendData.map((item, index) => (
                  <div
                    key={item.sprint}
                    className="flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => onSelectSprint(item.sprint)}
                  >
                    <span
                      className="absolute text-[11px] font-bold text-[#8b5cf6] z-20"
                      style={{ top: `${Math.max(0, getTrendPointY(item.completionRate) + 50)}px` }}
                    >
                      {formatTrendPercent(item.completionRate)}%
                    </span>
                    <div className="flex items-end gap-1.5 h-36">
                      <div
                        className="w-6 bg-[#3b82f6] rounded-t hover:opacity-90 transition-all"
                        style={{ height: `${Math.max((item.created / trendTaskAxisMax) * 100, 4)}%` }}
                        title={`Created: ${item.created}`}
                      ></div>
                      <div
                        className="w-6 bg-[#10b981] rounded-t hover:opacity-90 transition-all"
                        style={{ height: `${Math.max((item.completed / trendTaskAxisMax) * 100, 4)}%` }}
                        title={`Completed: ${item.completed}`}
                      ></div>
                    </div>
                    <span
                      className={`text-[11px] absolute -bottom-6 ${
                        selectedSprint === item.sprint
                          ? 'font-semibold text-[#0f172a]'
                          : 'font-medium text-[#64748b]'
                      }`}
                    >
                      {item.sprint}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk Exposure */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1877f2]">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a] leading-tight">Risk Exposure</h2>
                  <p className="text-[12px] text-[#64748b] mt-0.5">Number of risks by impact and probability</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                  {activeRisks.length} Critical Risks
                </span>
                <button
                  type="button"
                  onClick={() => setShowCriticalRiskTasks(true)}
                  className="text-[12px] text-[#1877f2] font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0"
                >
                  View all →
                </button>
              </div>
            </div>

            {/* Heatmap Matrix Component */}
            <div className="mt-6 pt-1 pb-2 flex flex-col items-center select-none">
              {/* Top Impact Header */}
              <div className="w-full flex items-center">
                <div className="w-20 shrink-0"></div>
                <div className="flex-1 text-center font-bold text-[10px] tracking-wider text-[#94a3b8] uppercase mb-2">
                  IMPACT
                </div>
              </div>

              {/* Column Subheaders (Low, Medium, High, Critical) */}
              <div className="w-full flex items-center mb-2">
                <div className="w-20 shrink-0"></div>
                <div className="flex-1 grid grid-cols-4 gap-2 text-center">
                  <span className="text-[11px] font-medium text-[#64748b]">Low</span>
                  <span className="text-[11px] font-medium text-[#64748b]">Medium</span>
                  <span className="text-[11px] font-medium text-[#64748b]">High</span>
                  <span className="text-[11px] font-medium text-[#64748b]">Critical</span>
                </div>
              </div>

              {/* Rows Container */}
              <div className="w-full flex">
                {/* Vertical Probability Label */}
                <div className="w-6 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase -rotate-90 whitespace-nowrap">
                    PROBABILITY
                  </span>
                </div>

                {/* 3 Rows Grid */}
                <div className="flex-1 flex flex-col gap-2">
                  {riskProbabilityRows.map((probability) => (
                    <div key={probability} className="flex items-center gap-2">
                      <span className="w-14 text-right text-[11px] font-medium text-[#64748b] shrink-0 pr-1">
                        {probability}
                      </span>
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        {riskImpactColumns.map((impact) => {
                          const count = getRiskExposureCount(probability, impact);
                          return (
                            <div
                              key={`${probability}-${impact}`}
                              onClick={() =>
                                count > 0
                                  ? setShowCriticalRiskTasks(true)
                                  : undefined
                              }
                              className={`h-11 rounded-xl text-sm flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform ${getRiskExposureCellClass(
                                probability,
                                impact,
                                count
                              )}`}
                              title={`${count} ${count === 1 ? 'Risk' : 'Risks'}`}
                            >
                              {count}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Sprint 36 Execution Overview & Audit Docs Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {isAllOpenSprints && (
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1877f2]">
                    <span className="material-symbols-outlined text-[19px]">fact_check</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0f172a]">Open Sprints - Execution Overview</h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1877f2]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1877f2]"></span>
                  {openSprintCards.length} Active Sprints
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {openSprintCards.map((sprint) => (
                  <div key={sprint.sprint} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#cbd5e1] hover:shadow-xs transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[13px] text-[#0f172a]">{sprint.sprint}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sprint.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sprint.badge === 'On Track' ? 'bg-emerald-500' : sprint.badge === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                          {sprint.badge}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs text-[#64748b] mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-[#0f172a] text-[13px]">{sprint.progress}%</span>
                      </div>
                      <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${sprint.badge === 'On Track' ? 'bg-emerald-500' : sprint.badge === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sprint.progress}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#edf2f7]">
                        <span className="text-[#64748b]">Tasks: <strong className="text-[#0f172a] font-semibold">{sprint.totalTasks}</strong></span>
                        <span className={`font-semibold ${sprint.overdueTasks > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>Overdue: {sprint.overdueTasks}</span>
                      </div>
                    </div>
                    <div className="pt-3 mt-1 border-t border-[#edf2f7]/60">
                      <button type="button" onClick={() => setSelectedSprintDetail(sprint.sprint)} className="text-xs font-semibold text-[#1877f2] hover:text-[#004ac6] flex items-center justify-between w-full group cursor-pointer">
                        <span>View {sprint.sprint}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9]">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-1.5 font-bold text-[13px] text-[#0f172a]">
                  <span>⚠️ Tasks cần chú ý - Open Sprints</span>
                </div>
                <button type="button" onClick={() => onNavigate('progress-tasks')} className="text-[12px] text-[#1877f2] font-semibold hover:underline">View all tasks →</button>
              </div>
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
                    {attentionTasks.map((t) => {
                      const priorityColor = t.priority === 'Critical' ? 'bg-[#fee2e2] text-[#dc2626]' : t.priority === 'High' ? 'bg-[#ffedd5] text-[#ea580c]' : 'bg-[#fef3c7] text-[#d97706]';
                      return (
                        <tr key={t.id} className="hover:bg-[#f8fafc]/80 transition-colors group cursor-pointer">
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${priorityColor}`}>{t.priority}</span></td>
                          <td className="py-2.5 font-medium text-[#0f172a] truncate max-w-[190px]"><span className="hover:text-[#1877f2] transition-colors">{t.title}</span></td>
                          <td className="py-2.5 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1877f2] border border-blue-200">{t.sprint || '-'}</span></td>
                          <td className="py-2.5"><div className="flex flex-col gap-1 w-20"><span className="text-[11px] font-semibold text-[#0f172a]">{t.progress}%</span><div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden"><div className="bg-[#1877f2] h-full rounded-full" style={{ width: `${t.progress}%` }}></div></div></div></td>
                          <td className={`py-2.5 font-semibold ${t.dueDate === 'Today' || t.status === 'Overdue' ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>{t.dueDate}</td>
                          <td className="py-2.5"><div className="flex items-center gap-1.5"><div className={`w-5 h-5 rounded-full ${t.owner.avatarColor} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{t.owner.initials}</div><span className="text-[#475569] text-[11px] truncate">{t.owner.name}</span></div></td>
                          <td className="py-2.5 text-right"><button type="button" onClick={() => setSelectedTaskDetail(t)} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1877f2] hover:text-[#004ac6] bg-[#eff6ff] hover:bg-[#dbeafe] px-2 py-1 rounded transition-colors cursor-pointer">View ↗</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Left Card: Sprint 36 — Execution Overview */}
        <div className={`${isAllOpenSprints ? 'hidden' : 'lg:col-span-7'} bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between`}>
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1877f2]">
                  <span className="material-symbols-outlined text-[19px]">fact_check</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">
                    {selectedSprint} — Execution Overview
                  </h2>
                  <p className="text-[12px] text-[#64748b]">Task progress and key focus</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  Sprint Health: {currentSprintStats.health}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-[#ecfdf5] text-[#059669]">
                  {currentSprintStats.healthStatus}
                </span>
              </div>
            </div>

            {/* 5 KPI Summary Boxes */}
            <div className="grid grid-cols-5 gap-2.5 py-3 border-y border-[#f1f5f9]">
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#64748b] truncate">Total Tasks</span>
                <span className="text-[20px] font-bold text-[#0f172a] mt-1">
                  {currentSprintStats.totalTasks}
                </span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#64748b] truncate">Completed</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[20px] font-bold text-[#0f172a]">
                    {currentSprintStats.completedTasks}
                  </span>
                  <span className="text-[11px] font-semibold text-[#10b981]">
                    ↓ {currentSprintStats.completedRate}
                  </span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#64748b] truncate">In Progress</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[20px] font-bold text-[#0f172a]">
                    {currentSprintStats.inProgressTasks}
                  </span>
                  <span className="text-[11px] font-semibold text-[#1877f2]">
                    ↓ {currentSprintStats.inProgressRate}
                  </span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#64748b] truncate">Pending</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[20px] font-bold text-[#0f172a]">
                    {currentSprintStats.pendingTasks}
                  </span>
                  <span className="text-[11px] font-semibold text-[#f59e0b]">
                    ↓ {currentSprintStats.pendingRate}
                  </span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#64748b] truncate">Overdue</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[20px] font-bold text-[#ef4444]">
                    {currentSprintStats.overdueTasks}
                  </span>
                  <span className="text-[11px] font-semibold text-[#ef4444]">
                    ↓ {currentSprintStats.overdueRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Tasks cần chú ý */}
            <div className="pt-4">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-1.5 font-bold text-[13px] text-[#0f172a]">
                  <span>⚠️ Tasks cần chú ý</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('progress-tasks')}
                  className="text-[12px] text-[#1877f2] font-semibold hover:underline"
                >
                  View all →
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="text-[#94a3b8] font-semibold border-b border-[#f1f5f9]">
                      <th className="pb-2.5 font-medium w-20">Priority</th>
                      <th className="pb-2.5 font-medium">Task / Feature</th>
                      <th className="pb-2.5 font-medium w-28">Progress</th>
                      <th className="pb-2.5 font-medium w-24">Due Date</th>
                      <th className="pb-2.5 font-medium w-28 text-right sm:text-left">Owner</th>
                      <th className="pb-2.5 font-medium w-16 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f8fafc]">
                    {attentionTasks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#64748b] font-medium">
                          No tasks need attention in this sprint.
                        </td>
                      </tr>
                    )}
                    {attentionTasks.map((t) => {
                      const priorityColor =
                        t.priority === 'Critical'
                          ? 'bg-[#fee2e2] text-[#dc2626]'
                          : t.priority === 'High'
                          ? 'bg-[#ffedd5] text-[#ea580c]'
                          : 'bg-[#fef3c7] text-[#d97706]';

                      return (
                        <tr key={t.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${priorityColor}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-2.5 font-medium text-[#0f172a] truncate max-w-[200px]">
                            {t.title}
                          </td>
                          <td className="py-2.5">
                            <div className="flex flex-col gap-1 w-20">
                              <span className="text-[11px] font-semibold text-[#0f172a]">{t.progress}%</span>
                              <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#1877f2] h-full rounded-full transition-all"
                                  style={{ width: `${t.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className={`py-2.5 font-medium ${t.dueDate === 'Today' ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                            {t.dueDate}
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-5 h-5 rounded-full ${t.owner.avatarColor} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                              >
                                {t.owner.initials}
                              </div>
                              <span className="text-[#475569] text-[11px] truncate">
                                {t.owner.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTaskDetail(t)}
                              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1877f2] hover:text-[#004ac6] bg-[#eff6ff] hover:bg-[#dbeafe] px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              View ↗
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-3 mt-1 border-t border-[#edf2f7]/60">
              <button
                type="button"
                onClick={() => setSelectedSprintDetail(selectedSprint)}
                className="text-xs font-semibold text-[#1877f2] hover:text-[#004ac6] flex items-center justify-between w-full group cursor-pointer"
              >
                <span>View {selectedSprint}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Audit Docs Status */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#edf2f7] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#1877f2]">
                  verified_user
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">Audit Docs Status</h2>
                  <p className="text-[12px] text-[#64748b]">Pass detail of audit documents in current sprint</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-[#64748b] bg-white border border-[#e2e8f0] px-2.5 py-1 rounded-lg cursor-pointer hover:bg-[#f8fafc]">
                <span>{selectedSprint}</span>
                <span className="material-symbols-outlined text-[15px]">expand_more</span>
              </div>
            </div>

            {/* 5 Stat Counters in 1 Row */}
            <div className="grid grid-cols-5 gap-2 py-3 border-y border-[#f1f5f9]">
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 sm:p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#0f172a]">{currentSprintStats.auditTotalDocs}</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">Total Documents</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 sm:p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#10b981]">{currentSprintStats.auditAgentPassed}</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">Agent Audit Passed</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 sm:p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#1877f2]">{currentSprintStats.auditPmApproved}</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">PM Approved</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 sm:p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#f59e0b]">{currentSprintStats.auditPendingPm}</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">Pending PM Check</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#edf2f7] p-2.5 sm:p-3 rounded-xl shadow-xs flex flex-col justify-between">
                <span className="text-[20px] font-bold text-[#ef4444]">{currentSprintStats.auditRejected}</span>
                <span className="text-[11px] font-medium text-[#64748b] leading-tight mt-1">Rejected</span>
              </div>
            </div>

            {/* PM Approval Progress */}
            <div className="py-3">
              <div className="flex items-center justify-between text-[12px] font-semibold mb-1.5">
                <span className="text-[#64748b]">PM Approval Progress</span>
                <span className="text-[#0f172a]">
                  {currentSprintStats.auditPmApproved} / {currentSprintStats.auditTotalDocs} (
                  {Math.round((currentSprintStats.auditPmApproved / currentSprintStats.auditTotalDocs) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1877f2] h-full rounded-full transition-all"
                  style={{
                    width: `${(currentSprintStats.auditPmApproved / currentSprintStats.auditTotalDocs) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Sub-section: Audit Documents Table */}
            <div className="pt-2">
              <div className="text-[13px] font-bold text-[#0f172a] mb-2.5">Audit Documents</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="text-[#94a3b8] font-semibold border-b border-[#f1f5f9]">
                      <th className="pb-2.5 font-medium pr-2">Document</th>
                      <th className="pb-2.5 font-medium px-2 text-center w-14">Sprint</th>
                      <th className="pb-2.5 font-medium px-2 text-center w-24">Agent Audit</th>
                      <th className="pb-2.5 font-medium px-2 text-center w-24">PM Check</th>
                      <th className="pb-2.5 font-medium pl-2 text-right w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f8fafc]">
                    <tr className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-[#0f172a]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                            description
                          </span>
                          <span className="truncate max-w-[130px]" title="Workflow Automation">
                            Workflow Auto...
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#64748b]">S36</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#10b981] text-[11px] font-medium">Passed</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#10b981] text-[11px] font-medium">Approved</span>
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
                          <span className="truncate max-w-[130px]" title="Security Assessment">
                            Security Assessment
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#64748b]">S36</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#10b981] text-[11px] font-medium">Passed</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#10b981] text-[11px] font-medium">Approved</span>
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
                          <span className="truncate max-w-[130px]" title="Data Sync Report">
                            Data Sync Report
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#64748b]">S36</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#10b981] text-[11px] font-medium">Passed</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#d97706] text-[11px]">Pending</span>
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
                          <span className="truncate max-w-[130px]" title="Cloud Ingestion Protocol">
                            Cloud Ingestion Pro...
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#64748b]">S36</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#10b981] text-[11px] font-medium">Passed</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#d97706] text-[11px]">Pending</span>
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
                          <span className="truncate max-w-[130px]" title="API Integration Audit">
                            API Integration Audit
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#64748b]">S36</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[#dc2626] text-[11px] font-medium">Rework</span>
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
          <div className="pt-3 text-right">
            <button
              type="button"
              onClick={() => onNavigate('audit-docs')}
              className="text-[12px] text-[#1877f2] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              View all Audit Docs →
            </button>
          </div>
        </div>
      </div>

      {selectedTaskDetail && (() => {
        const task = selectedTaskDetail;
        const isCritical = task.priority === 'Critical';
        const isOverdue = task.status === 'Overdue';
        const priorityClass =
          task.priority === 'Critical'
            ? 'bg-rose-50 text-rose-600 border-rose-200'
            : task.priority === 'High'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : task.priority === 'Medium'
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

        return createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-[470px] max-h-[calc(100vh-48px)] flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityClass}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">{task.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {task.sprint || selectedSprint}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskDetail(null)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
                    aria-label="Close task detail"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="pr-2">
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-1">
                    {task.project || 'PMA Agent'} • {task.sprint || selectedSprint}
                  </p>
                </div>

                <div className="text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-[22px] text-slate-400">person</span>
                      <span>Owner</span>
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-5 h-5 rounded-full ${task.owner.avatarColor} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                        {task.owner.initials}
                      </div>
                      <span className="text-slate-800 font-semibold truncate">{task.owner.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-[22px] text-slate-400">flag</span>
                      <span>Priority</span>
                    </span>
                    <span className={`font-semibold flex items-center gap-1.5 ${isCritical ? 'text-rose-600' : 'text-blue-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-[22px] text-slate-400">check_circle</span>
                      <span>Status</span>
                    </span>
                    <span className={`font-semibold flex items-center gap-1.5 ${isOverdue ? 'text-rose-600' : 'text-blue-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                      {task.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-[22px] text-slate-400">trending_up</span>
                      <span>Progress</span>
                    </span>
                    <div className="flex items-center gap-2 min-w-[140px] justify-end">
                      <span className="text-slate-800 font-bold text-xs">{task.progress}%</span>
                      <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-[22px] text-slate-400">calendar_today</span>
                      <span>Due Date</span>
                    </span>
                    <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                      {task.dueDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>Recommended Actions</span>
                    <span className="text-[10px] font-normal text-slate-400">Click to execute</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ACTION_BUTTONS.map(([icon, label, actionType]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => openTaskAction(actionType, task)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-[11px] justify-start shadow-2xs transition-colors cursor-pointer hover:bg-slate-50"
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

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTaskDetail(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Update Status</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {selectedSprintDetail && (() => {
        const sprint = getSprintOverview(selectedSprintDetail);
        const statusClass =
          sprint.badge === 'On Track'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : sprint.badge === 'At Risk'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-red-50 text-red-700 border-red-200';
        const barClass =
          sprint.badge === 'On Track'
            ? 'bg-emerald-500'
            : sprint.badge === 'At Risk'
            ? 'bg-amber-500'
            : 'bg-red-500';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">fact_check</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{sprint.sprint} - Execution Detail</h3>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusClass}`}>
                        {sprint.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Sprint execution overview</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSprintDetail(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close sprint detail"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ['Progress', `${sprint.progress}%`, 'trending_up', 'text-blue-600'],
                    ['Total Tasks', sprint.totalTasks, 'task_alt', 'text-slate-700'],
                    ['Overdue', sprint.overdueTasks, 'schedule', sprint.overdueTasks > 0 ? 'text-red-600' : 'text-emerald-600']
                  ].map(([label, value, icon, valueClass]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>{label}</span>
                        <span className="material-symbols-outlined text-[18px] text-slate-400">{icon}</span>
                      </div>
                      <div className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Completion Progress</span>
                    <span>{sprint.completedTasks}/{sprint.totalTasks} completed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${sprint.progress}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Key Tasks In This Sprint</h4>
                    <span className="text-[11px] font-semibold text-slate-400">{sprint.keyTasks.length} tasks</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">Task ID & Name</th>
                          <th className="px-3 py-2.5 font-semibold w-28">Owner</th>
                          <th className="px-3 py-2.5 font-semibold w-24">Status</th>
                          <th className="px-3 py-2.5 font-semibold w-28">Progress</th>
                          <th className="px-3 py-2.5 font-semibold w-20">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sprint.keyTasks.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-6 text-center text-slate-500 font-medium">
                              No open tasks in this sprint.
                            </td>
                          </tr>
                        )}
                        {sprint.keyTasks.map((task) => {
                          const statusTone =
                            task.status === 'Overdue'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : task.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200';

                          return (
                            <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3 py-3">
                                <div className="font-bold text-slate-900">{task.id}</div>
                                <div className="text-slate-500 truncate max-w-[260px]">{task.title}</div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-6 h-6 rounded-full ${task.owner.avatarColor} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                                    {task.owner.initials}
                                  </div>
                                  <span className="font-medium text-slate-700 truncate">{task.owner.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusTone}`}>
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${task.progress}%` }}></div>
                                  </div>
                                  <span className="font-bold text-slate-700">{task.progress}%</span>
                                </div>
                              </td>
                              <td className={`px-3 py-3 font-semibold ${task.status === 'Overdue' ? 'text-red-600' : 'text-slate-600'}`}>
                                {task.dueDate}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">Execution status synchronized</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSprintDetail(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSprint(sprint.sprint);
                      setSelectedSprintDetail(null);
                      onNavigate('progress-tasks');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Open in Progress Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showCriticalRiskTasks && createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Critical Risks Drill-down ({criticalRisks.length} Tasks)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                      Highest Attention
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tasks with Risk Score &gt;= 15 requiring immediate mitigation action
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCriticalRiskTasks(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
                aria-label="Close critical risk tasks"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(85vh-130px)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100 text-[11px]">
                    <th className="pb-3 font-medium">Task ID &amp; Name</th>
                    <th className="pb-3 font-medium text-center w-16">Sprint</th>
                    <th className="pb-3 font-medium w-36">Owner</th>
                    <th className="pb-3 font-medium w-28 text-center">Risk Score</th>
                    <th className="pb-3 font-medium w-24">Due Date</th>
                    <th className="pb-3 font-medium text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalRisks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                        No critical risk tasks found in this sprint.
                      </td>
                    </tr>
                  )}
                  {criticalRisks.map((risk) => {
                    const matchedTask = findTaskForRisk(risk);
                    const taskTitle = matchedTask?.title || risk.riskName || risk.affectedFunction || 'Risk Trigger';

                    return (
                      <tr key={risk.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-3">
                          <div className="font-bold text-slate-900 leading-tight">{taskTitle}</div>
                        </td>
                      <td className="py-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                          {matchedTask?.sprint || risk.sprint || selectedSprint}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full ${
                              risk.ownerAvatarColor || 'bg-[#1877f2]'
                            } text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                          >
                            {risk.ownerInitials || risk.owner.split(' ').map((part) => part[0]).join('')}
                          </div>
                          <span className="font-medium text-slate-700 truncate">
                            {risk.owner}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          {risk.score ?? 0}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            risk.status === 'Overdue' || matchedTask?.status === 'Overdue' ? 'text-red-600' : 'text-slate-600'
                          }`}
                        >
                          {matchedTask?.dueDate || risk.dueDate || 'No due date'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCriticalRiskTasks(false);
                            setSelectedCriticalTask({ task: matchedTask, risk });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Đi tới Task ↗
                        </button>
                      </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Showing all <strong>{criticalRisks.length}</strong> critical risk tasks across active sprints
              </span>
              <button
                type="button"
                onClick={() => setShowCriticalRiskTasks(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedCriticalTask && (() => {
        const task = getRiskTaskDisplay(selectedCriticalTask.risk, selectedCriticalTask.task);
        const isCritical = task.priority === 'Critical';
        const isOverdue = task.status === 'Overdue';

        return createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[92vh] flex flex-col overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCriticalTask(null);
                      setShowCriticalRiskTasks(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-2 py-1 rounded-lg transition-colors mr-1 shadow-2xs"
                    title="Quay lại danh sách Critical Risks"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                    <span>DS Risks</span>
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isCritical
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : task.priority === 'High'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{task.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {task.sprint}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCriticalTask(null)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(92vh-130px)]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {task.project} • {task.sprint}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                      Owner
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-5 h-5 rounded-full ${task.owner.avatarColor} text-white font-bold text-[9px] flex items-center justify-center`}
                      >
                        {task.owner.initials}
                      </div>
                      <span className="text-slate-800 font-semibold">{task.owner.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">flag</span>
                      Priority
                    </span>
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">check_circle</span>
                      Status
                    </span>
                    <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-blue-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                      {task.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">trending_up</span>
                      Progress
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 font-bold text-xs">{task.progress}%</span>
                      <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                      Due Date
                    </span>
                    <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                      {task.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">warning</span>
                      Risk Score
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      {task.riskScore}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                    <span>Recommended Actions</span>
                    <span className="text-[10px] font-normal text-slate-400">Click to execute</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ACTION_BUTTONS.map(([icon, label, actionType]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => openTaskAction(actionType, task)}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-[11px] justify-start shadow-2xs transition-colors cursor-pointer hover:bg-slate-50"
                      >
                        <span className={`material-symbols-outlined text-[15px] ${icon === 'block' ? 'text-rose-500' : 'text-blue-500'}`}>
                          {icon}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-red-50/70 border border-red-100 text-xs text-red-800">
                    <div className="font-bold mb-1">Mitigation Plan</div>
                    <p className="leading-relaxed">{task.mitigationPlan}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCriticalTask(null);
                    onNavigate('progress-tasks');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open in Progress Task</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
};
