import { SprintInfo, TaskItem } from '../types';
import progressTaskData from '../../data/ProgressTask/transformed_powerautomate.json';
import dashboardData from '../../data/Dashboard/transformed_powerautomate.json';

type DashboardJson = typeof dashboardData;
type ProgressTaskJson = typeof progressTaskData;

const badgeClassByStatus: Record<SprintInfo['badge'], string> = {
  'On Track': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'At Risk': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Delay Risk': 'bg-red-50 text-red-700 border border-red-200',
};

export const POWER_AUTOMATE_PROGRESS: ProgressTaskJson = progressTaskData;
export const POWER_AUTOMATE_DASHBOARD: DashboardJson = dashboardData;

export const POWER_AUTOMATE_TASKS = progressTaskData.tasks as TaskItem[];

export const POWER_AUTOMATE_SPRINTS: SprintInfo[] = dashboardData.sprints.map((sprint) => ({
  ...sprint,
  badgeClass: badgeClassByStatus[sprint.badge as SprintInfo['badge']],
}));

export const POWER_AUTOMATE_ATTENTION_TASKS = dashboardData.attentionTasks as TaskItem[];

export function getPowerAutomateTaskById(taskId: string): TaskItem | undefined {
  return POWER_AUTOMATE_TASKS.find((task) => task.id === taskId);
}
