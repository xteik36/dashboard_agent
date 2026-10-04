export type NavigationTab = 
  | 'dashboard'
  | 'progress-tasks'
  | 'risk-predictions'
  | 'audit-docs'
  | 'functions'
  | 'meetings-visits'
  | 'settings';

export interface TaskItem {
  id: string;
  st?: number;
  functionId?: string;
  title: string;
  project?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  progress: number;
  dueDate: string;
  owner: {
    name: string;
    initials: string;
    avatarColor: string;
    role?: string;
  };
  status: 'Completed' | 'In Progress' | 'Pending' | 'Overdue' | 'To Do' | 'At Risk' | 'Blocked' | 'Planned';
  sprint?: string;
  agentValidation?: string;
  completed?: boolean;
}

export interface AuditDocument {
  id: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3';
  title: string;
  docType: string;
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
  aiAuditStatus: 'AI Passed' | 'AI Flagged' | 'In Progress' | 'Action Required';
  aiAuditDetails?: string;
  pmReviewStatus: 'Completed' | 'In Progress' | 'PM Review' | 'Rework' | 'Pending';
  pmReviewNote?: string;
  sprint: string;
  lastUpdated?: string;
}

export interface NoteItem {
  id: string;
  author: string;
  role: string;
  initials: string;
  timestamp: string;
  content: string;
  linkedTask?: string;
  isPinned?: boolean;
  replies?: Array<{
    author: string;
    role: string;
    timestamp: string;
    content: string;
  }>;
}

export interface AgentFunction {
  id: string;
  name: string;
  code: string;
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  pendingTasks: number;
  status: 'On Track' | 'At Risk' | 'Offline';
  progress: number;
  lastRun: string;
  owner: {
    name: string;
    role: string;
    initials: string;
  };
  overview: string;
  timeline: Array<{
    title: string;
    version: string;
    date: string;
    status: 'Completed' | 'In Progress' | 'Upcoming';
    description: string;
  }>;
  notes: NoteItem[];
}

export interface MeetingItem {
  id: string;
  title: string;
  type: string;
  dateStr: string;
  monthStr: string;
  timeStr: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  healthStatus: 'On Track' | 'At Risk';
  platform: string;
  platformLink: string;
  attendees: Array<{
    name: string;
    role: string;
    initials: string;
    avatarBg: string;
    avatarColor: string;
  }>;
  agenda: Array<{
    num: string;
    title: string;
    desc?: string;
  }>;
  momNotes: {
    summary: string;
    decisions: string[];
    transcriptSnippets: string[];
  };
  actionItems: Array<{
    id: string;
    task: string;
    assignee: string;
    dueDate: string;
    completed: boolean;
  }>;
}

export interface RiskMatrixItem {
  id: string;
  riskName?: string;
  title: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  impactScore?: number;
  probability: 'Low' | 'Medium' | 'High';
  probabilityPct?: number;
  score?: number;
  status: 'Open' | 'Mitigated' | 'Monitoring' | 'In Progress' | 'Overdue' | 'Planned' | 'On Track';
  owner: string;
  ownerInitials?: string;
  ownerAvatarColor?: string;
  dueDate?: string;
  dueRelative?: string;
  mitigationPlan: string;
  affectedFunction?: string;
  sprint?: string;
}

export interface OwnerRiskExposure {
  rank: number;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  totalRisks: number;
  critCount: number;
  highCount: number;
  medCount: number;
  riskScore: number;
  maxScore: number;
  overdueCount: number;
  topThreatRisk: string;
}
