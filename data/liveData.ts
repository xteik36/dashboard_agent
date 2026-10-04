import dashboardData from './Dashboard/transformed.json';
import progressTaskData from './ProgressTask/transformed.json';
import riskPredictionData from './RiskPrediction/transformed.json';
import { OwnerRiskExposure, RiskMatrixItem, TaskItem } from '../src/types';
import { formatDisplayDate } from '../src/utils/dateFormat';

type LiveTask = {
  id: string;
  st?: number;
  function_id?: string | null;
  title: string;
  project?: string;
  priority: TaskItem['priority'];
  progress: number;
  due_date: string;
  owner: {
    name?: string | null;
    initials?: string | null;
    avatar_color?: string | null;
    role?: string | null;
  };
  status: TaskItem['status'];
  sprint?: string | null;
  completed?: boolean;
};

type LiveRisk = {
  id: string;
  risk_name?: string;
  sprint?: string | null;
  title: string;
  impact: RiskMatrixItem['impact'];
  impact_score?: number;
  probability: RiskMatrixItem['probability'];
  probability_pct?: number;
  score?: number;
  status: RiskMatrixItem['status'];
  owner: string;
  owner_initials?: string | null;
  owner_avatar_color?: string | null;
  due_date?: string | null;
  due_relative?: string | null;
  mitigation_plan: string;
  affected_function?: string | null;
};

type LiveOwnerExposure = {
  rank: number;
  name: string;
  role?: string | null;
  initials: string;
  avatar_color?: string | null;
  total_risks: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  risk_score: number;
  max_score: number;
  overdue_count: number;
  top_threat_risk?: string | null;
};

const formatDate = (date: string | null | undefined) => formatDisplayDate(date);

const toTaskItem = (task: LiveTask): TaskItem => ({
  id: task.id,
  st: task.st,
  functionId: task.function_id || undefined,
  title: task.title,
  project: task.project,
  priority: task.priority,
  progress: task.progress,
  dueDate: formatDate(task.due_date),
  owner: {
    name: task.owner.name || 'Unassigned',
    initials: task.owner.initials || 'NA',
    avatarColor: task.owner.avatar_color || 'bg-[#1877f2]',
    role: task.owner.role || undefined
  },
  status: task.status,
  sprint: task.sprint || undefined,
  completed: task.completed
});

const toRiskMatrixItem = (risk: LiveRisk): RiskMatrixItem => ({
  id: risk.id,
  riskName: risk.risk_name,
  title: risk.title,
  impact: risk.impact,
  impactScore: risk.impact_score,
  probability: risk.probability,
  probabilityPct: risk.probability_pct,
  score: risk.score,
  status: risk.status,
  owner: risk.owner,
  ownerInitials: risk.owner_initials || undefined,
  ownerAvatarColor: risk.owner_avatar_color || undefined,
  dueDate: risk.due_date ? formatDisplayDate(risk.due_date) : undefined,
  dueRelative: risk.due_relative || undefined,
  mitigationPlan: risk.mitigation_plan,
  affectedFunction: risk.affected_function || undefined,
  sprint: risk.sprint || undefined
});

const toOwnerRiskExposure = (owner: LiveOwnerExposure): OwnerRiskExposure => ({
  rank: owner.rank,
  name: owner.name,
  role: owner.role || 'Delivery Owner',
  initials: owner.initials,
  avatarColor: owner.avatar_color || 'bg-[#1877f2]',
  totalRisks: owner.total_risks,
  critCount: owner.critical_count,
  highCount: owner.high_count,
  medCount: owner.medium_count,
  riskScore: owner.risk_score,
  maxScore: owner.max_score,
  overdueCount: owner.overdue_count,
  topThreatRisk: owner.top_threat_risk || ''
});

const progress = progressTaskData as {
  selected_sprint: string;
  tasks: LiveTask[];
};

const dashboard = dashboardData as {
  selected_sprint: string;
  sprint_summary: Record<string, number>;
  sprint_health: Record<string, string | number | null>;
  critical_risk: Record<string, string | number | null>;
  delivery_trend: Array<{ sprint: string; created: number; completed: number }>;
};

const riskPrediction = riskPredictionData as {
  selected_sprint: string;
  risks: LiveRisk[];
  owner_exposures: LiveOwnerExposure[];
};

export const LIVE_SELECTED_SPRINT = progress.selected_sprint;

export const INITIAL_TASKS: TaskItem[] = progress.tasks.map(toTaskItem);

export const INITIAL_RISKS: RiskMatrixItem[] = riskPrediction.risks.map(toRiskMatrixItem);

export const OWNER_RISK_EXPOSURE_DATA: OwnerRiskExposure[] =
  riskPrediction.owner_exposures.map(toOwnerRiskExposure);

const rate = (count: number, total: number) => (total ? Math.round((count / total) * 10000) / 100 : 0);

const getSprintNumber = (sprint: string) => {
  const match = sprint.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const allSprintNames = Array.from(new Set(progress.tasks.map((task) => task.sprint).filter(Boolean) as string[])).sort(
  (a, b) => getSprintNumber(a) - getSprintNumber(b)
);

export const SPRINT_DATA = Object.fromEntries(
  allSprintNames.map((sprint) => {
    if (sprint === dashboard.selected_sprint) {
      return [
        sprint,
        {
          health: `${dashboard.sprint_health.value}%`,
          healthStatus: String(dashboard.sprint_health.status || 'On Track'),
          healthDelta: String(dashboard.sprint_health.delta_vs_previous_sprint || '0%'),
          criticalRiskCount: Number(dashboard.critical_risk.value || 0),
          criticalRiskDelta: String(dashboard.critical_risk.delta_vs_previous_sprint || '0'),
          auditPendingCount: 0,
          auditPendingDelta: '0',
          totalTasks: dashboard.sprint_summary.total_tasks,
          completedTasks: dashboard.sprint_summary.completed_count,
          completedRate: `${dashboard.sprint_summary.completed_rate_pct}%`,
          inProgressTasks: dashboard.sprint_summary.in_progress_count,
          inProgressRate: `${dashboard.sprint_summary.in_progress_rate_pct}%`,
          pendingTasks: dashboard.sprint_summary.pending_count,
          pendingRate: `${dashboard.sprint_summary.pending_rate_pct}%`,
          overdueTasks: dashboard.sprint_summary.overdue_count,
          overdueRate: `${dashboard.sprint_summary.overdue_rate_pct}%`,
          auditTotalDocs: 0,
          auditAgentPassed: 0,
          auditPmApproved: 0,
          auditPendingPm: 0,
          auditRejected: 0
        }
      ];
    }

    const sprintTasks = progress.tasks.filter((task) => task.sprint === sprint);
    const totalTasks = sprintTasks.length;
    const completedTasks = sprintTasks.filter((task) => task.status === 'Completed').length;
    const inProgressTasks = sprintTasks.filter((task) => task.status === 'In Progress').length;
    const pendingTasks = sprintTasks.filter((task) => task.status === 'Pending' || task.status === 'To Do').length;
    const overdueTasks = sprintTasks.filter((task) => task.status === 'Overdue').length;
    const completedRate = rate(completedTasks, totalTasks);
    const activeRiskCount = riskPrediction.risks.filter(
      (risk) => risk.sprint === sprint && !['Mitigated', 'Completed'].includes(risk.status)
    ).length;

    return [
      sprint,
      {
        health: `${completedRate}%`,
        healthStatus: overdueTasks > 0 ? 'At Risk' : completedRate >= 70 ? 'On Track' : 'At Risk',
        healthDelta: '0%',
        criticalRiskCount: activeRiskCount,
        criticalRiskDelta: '0',
        auditPendingCount: 0,
        auditPendingDelta: '0',
        totalTasks,
        completedTasks,
        completedRate: `${completedRate}%`,
        inProgressTasks,
        inProgressRate: `${rate(inProgressTasks, totalTasks)}%`,
        pendingTasks,
        pendingRate: `${rate(pendingTasks, totalTasks)}%`,
        overdueTasks,
        overdueRate: `${rate(overdueTasks, totalTasks)}%`,
        auditTotalDocs: 0,
        auditAgentPassed: 0,
        auditPmApproved: 0,
        auditPendingPm: 0,
        auditRejected: 0
      }
    ];
  })
);
