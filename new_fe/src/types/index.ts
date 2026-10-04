export type NavScreen =
  | 'dashboard'
  | 'progress-task'
  | 'risk-predictions'
  | 'audit-docs'
  | 'functions'
  | 'meetings-visits'
  | 'settings';

export interface UserProfile {
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

export interface TaskItem {
  id: string;
  title: string;
  subtitle?: string;
  project: string;
  sprint: string;
  owner: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Overdue' | 'At Risk' | 'Completed' | 'Planned' | 'Blocked';
  progress: number;
  dueDate: string;
  blockerReason?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export interface RiskItem {
  id: string; // e.g. RSK-023
  name: string;
  description: string;
  probability: 'High' | 'Medium' | 'Low';
  probabilityPercent: number;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  impactScore: number;
  score: number; // 0-25
  owner: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  dueDate: string;
  dueNotice?: string;
  status: 'In Progress' | 'Overdue' | 'Planned' | 'On Track';
  sprint: string;
  mitigationPlan?: string;
}

export interface OwnerExposure {
  rank: number;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  totalRisks: number;
  composition: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  riskScore: number; // e.g. 17 / 25
  overdueCount: number;
  topThreatId: string;
}

export interface AuditDoc {
  id: string;
  name: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3';
  standardType: string;
  owner: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  reviewer: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  aiAudit: 'AI Passed' | 'AI Flagged' | 'In Progress' | 'Action Required' | 'Passed' | 'Missing';
  pmReview: 'Completed' | 'Pending' | 'In Progress' | 'Rework' | 'Passed' | 'Action Required' | '—';
  overallStatus: 'Audit Passed' | 'Completed' | 'In Progress' | 'Action Required' | 'Rejected / Rework' | 'Missing';
  createdDate: string;
  finishDate: string;
  reviewDate?: string;
  passDate?: string;
  sprint?: string;
  note?: string;
}

export interface FunctionItem {
  id: string; // DS-2024
  name: string;
  taskCount: number;
  doneTasks: number;
  runningTasks: number;
  pendingTasks: number;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Critical';
  owner: {
    name: string;
    initials: string;
    role: string;
  };
  lastRun: string;
  notes: {
    id: string;
    author: string;
    authorRole: string;
    time: string;
    content: string;
    pinned?: boolean;
    linkedTaskId?: string;
  }[];
  timeline: {
    id: string;
    title: string;
    date: string;
    version: string;
    status: 'Completed' | 'In Progress' | 'Upcoming';
    description: string;
  }[];
}

export interface MeetingItem {
  id: string;
  title: string;
  category: string;
  date: string; // e.g. Thu, Oct 24
  month: string; // Oct
  time: string; // 10:00 AM – 11:00 AM
  platform: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  health: 'On Track' | 'At Risk' | 'Needs Attention';
  attendees: {
    name: string;
    initials: string;
    role: string;
    avatarBg: string;
  }[];
  agenda: {
    step: string;
    topic: string;
  }[];
  momNotes?: string[];
  actionItems?: {
    id: string;
    task: string;
    assignee: string;
    completed: boolean;
  }[];
}

export interface SprintInfo {
  id: string;
  name: string;
  badge: 'On Track' | 'At Risk' | 'Delay Risk';
  badgeClass: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  atRiskTasks: number;
  daysRemaining: string;
  keyTasks: {
    name: string;
    status: string;
    owner: string;
  }[];
}
