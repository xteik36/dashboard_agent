import { AgentFunction, AuditDocument, MeetingItem, RiskMatrixItem, TaskItem, OwnerRiskExposure } from '../src/types';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TSK-2002',
    st: 2,
    title: 'Security-audit-log-synchronization',
    project: 'Cloud Compliance',
    priority: 'Medium',
    progress: 100,
    dueDate: 'Yesterday 08/09/2026',
    owner: {
      name: 'John Doe',
      initials: 'JD',
      avatarColor: 'bg-[#1877f2]',
      role: 'Lead Program Manager'
    },
    status: 'Completed',
    sprint: 'Sprint 36',
    agentValidation: 'Validated by SOC2 Agent',
    completed: true
  },
  {
    id: 'TSK-2001',
    st: 1,
    title: 'Real-time WebSocket Fallback for Mobile Disconnections',
    project: 'PMA Core Engine',
    priority: 'Critical',
    progress: 88,
    dueDate: '09/09/2026',
    owner: {
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarColor: 'bg-[#0284c7]',
      role: 'Integration Lead'
    },
    status: 'Overdue',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2003',
    st: 3,
    title: 'Migrate Transaction Ledger DB to Distributed SQL Cluster',
    project: 'Cloud Compliance',
    priority: 'High',
    progress: 45,
    dueDate: '10/09/2026',
    owner: {
      name: 'Maria Kim',
      initials: 'MK',
      avatarColor: 'bg-[#059669]',
      role: 'Database Specialist'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2004',
    st: 4,
    title: 'Penetration Testing & PCI-DSS Compliance Review',
    project: 'Security & Audit',
    priority: 'High',
    progress: 60,
    dueDate: '11/09/2026',
    owner: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarColor: 'bg-[#6366f1]',
      role: 'Cloud Lead Architect'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2005',
    st: 5,
    title: 'Refactor Payment Gateway OAuth 2.1 Handshake',
    project: 'PMA Core Engine',
    priority: 'Medium',
    progress: 75,
    dueDate: '12/09/2026',
    owner: {
      name: 'Tom Davis',
      initials: 'TD',
      avatarColor: 'bg-[#0ea5e9]',
      role: 'Senior Backend Engineer'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2006',
    st: 6,
    title: 'Automated Failover Plan Verification & Recovery Drills',
    project: 'Operational Plan',
    priority: 'Low',
    progress: 15,
    dueDate: '13/09/2026',
    owner: {
      name: 'Nam Tran',
      initials: 'NT',
      avatarColor: 'bg-[#64748b]',
      role: 'Site Reliability Lead'
    },
    status: 'To Do',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2007',
    st: 7,
    title: 'Audit Trail Logger storage threshold optimization',
    project: 'Cloud Compliance',
    priority: 'Critical',
    progress: 85,
    dueDate: '08/09/2026',
    owner: {
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarColor: 'bg-[#0284c7]',
      role: 'Integration Lead'
    },
    status: 'Overdue',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2008',
    st: 8,
    title: 'API Endpoint Versioning & Deprecation Notice Dispatch',
    project: 'PMA Core Engine',
    priority: 'Low',
    progress: 100,
    dueDate: '09/09/2026',
    owner: {
      name: 'John Doe',
      initials: 'JD',
      avatarColor: 'bg-[#1877f2]',
      role: 'Lead Program Manager'
    },
    status: 'Completed',
    sprint: 'Sprint 36',
    completed: true
  },
  {
    id: 'TSK-2009',
    st: 9,
    title: 'Cross-region Data Synchronization & Kafka Partitioning',
    project: 'Cloud Compliance',
    priority: 'High',
    progress: 52,
    dueDate: '14/09/2026',
    owner: {
      name: 'Michael Torres',
      initials: 'MT',
      avatarColor: 'bg-[#0d9488]',
      role: 'Backend Architect'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2010',
    st: 10,
    title: 'Zero Trust Network Access (ZTNA) Policy Enforcement',
    project: 'Security & Audit',
    priority: 'Critical',
    progress: 70,
    dueDate: '15/09/2026',
    owner: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarColor: 'bg-[#6366f1]',
      role: 'Cloud Lead Architect'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2011',
    st: 11,
    title: 'GraphQL Schema Federation & Apollo Gateway Config',
    project: 'PMA Core Engine',
    priority: 'Medium',
    progress: 65,
    dueDate: '15/09/2026',
    owner: {
      name: 'David Tran',
      initials: 'DT',
      avatarColor: 'bg-[#4f46e5]',
      role: 'DevOps Engineer'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2012',
    st: 12,
    title: 'Automated Disaster Recovery Runbook Testing',
    project: 'Operational Plan',
    priority: 'Medium',
    progress: 0,
    dueDate: '16/09/2026',
    owner: {
      name: 'Nam Tran',
      initials: 'NT',
      avatarColor: 'bg-[#64748b]',
      role: 'Site Reliability Lead'
    },
    status: 'To Do',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2013',
    st: 13,
    title: 'Kubernetes Cluster Autoscaler Threshold Fine-tuning',
    project: 'Cloud Compliance',
    priority: 'High',
    progress: 40,
    dueDate: '16/09/2026',
    owner: {
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarColor: 'bg-[#0284c7]',
      role: 'Integration Lead'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2014',
    st: 14,
    title: 'OAuth Refresh Token Rotation & Session Invalidation',
    project: 'Security & Audit',
    priority: 'Critical',
    progress: 90,
    dueDate: '08/09/2026',
    owner: {
      name: 'Tom Davis',
      initials: 'TD',
      avatarColor: 'bg-[#0ea5e9]',
      role: 'Senior Backend Engineer'
    },
    status: 'Overdue',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2015',
    st: 15,
    title: 'Observability Metrics & OpenTelemetry Trace Exporter',
    project: 'PMA Core Engine',
    priority: 'Low',
    progress: 100,
    dueDate: '07/09/2026',
    owner: {
      name: 'Linh Nguyen',
      initials: 'LN',
      avatarColor: 'bg-[#9333ea]',
      role: 'QA Automation Lead'
    },
    status: 'Completed',
    sprint: 'Sprint 36',
    completed: true
  },
  {
    id: 'TSK-2016',
    st: 16,
    title: 'Distributed Cache Eviction Policy & Redis Sentinel Drill',
    project: 'Cloud Compliance',
    priority: 'Medium',
    progress: 55,
    dueDate: '17/09/2026',
    owner: {
      name: 'Maria Kim',
      initials: 'MK',
      avatarColor: 'bg-[#059669]',
      role: 'Database Specialist'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2017',
    st: 17,
    title: 'GDPR Subject Access Request Export Automation Pipeline',
    project: 'Security & Audit',
    priority: 'High',
    progress: 35,
    dueDate: '18/09/2026',
    owner: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarColor: 'bg-[#6366f1]',
      role: 'Cloud Lead Architect'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2018',
    st: 18,
    title: 'Microservices Circuit Breaker Threshold Calibration',
    project: 'PMA Core Engine',
    priority: 'Low',
    progress: 10,
    dueDate: '19/09/2026',
    owner: {
      name: 'Michael Torres',
      initials: 'MT',
      avatarColor: 'bg-[#0d9488]',
      role: 'Backend Architect'
    },
    status: 'To Do',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2019',
    st: 19,
    title: 'Automated Regression Suite for Payment Webhooks',
    project: 'Operational Plan',
    priority: 'Medium',
    progress: 80,
    dueDate: '19/09/2026',
    owner: {
      name: 'Linh Nguyen',
      initials: 'LN',
      avatarColor: 'bg-[#9333ea]',
      role: 'QA Automation Lead'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2020',
    st: 20,
    title: 'API Rate Limiter & Token Bucket Algorithmic Refactor',
    project: 'PMA Core Engine',
    priority: 'Critical',
    progress: 88,
    dueDate: '07/09/2026',
    owner: {
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarColor: 'bg-[#0284c7]',
      role: 'Integration Lead'
    },
    status: 'Overdue',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2021',
    st: 21,
    title: 'SOC2 Type II Evidence Collector Agent Scripting',
    project: 'Cloud Compliance',
    priority: 'High',
    progress: 100,
    dueDate: '06/09/2026',
    owner: {
      name: 'John Doe',
      initials: 'JD',
      avatarColor: 'bg-[#1877f2]',
      role: 'Lead Program Manager'
    },
    status: 'Completed',
    sprint: 'Sprint 36',
    agentValidation: 'Validated by SOC2 Agent',
    completed: true
  },
  {
    id: 'TSK-2022',
    st: 22,
    title: 'Database Connection Pooler Tuning for High-Concurrency Spikes',
    project: 'Cloud Compliance',
    priority: 'Medium',
    progress: 45,
    dueDate: '20/09/2026',
    owner: {
      name: 'Maria Kim',
      initials: 'MK',
      avatarColor: 'bg-[#059669]',
      role: 'Database Specialist'
    },
    status: 'In Progress',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2023',
    st: 23,
    title: 'SLA Monitoring Dashboard & PagerDuty Webhook Integration',
    project: 'Operational Plan',
    priority: 'Low',
    progress: 0,
    dueDate: '21/09/2026',
    owner: {
      name: 'Nam Tran',
      initials: 'NT',
      avatarColor: 'bg-[#64748b]',
      role: 'Site Reliability Lead'
    },
    status: 'To Do',
    sprint: 'Sprint 36',
    completed: false
  },
  {
    id: 'TSK-2024',
    st: 24,
    title: 'Continuous Deployment Pipeline Canary Strategy Rollout',
    project: 'Operational Plan',
    priority: 'High',
    progress: 100,
    dueDate: '05/09/2026',
    owner: {
      name: 'David Tran',
      initials: 'DT',
      avatarColor: 'bg-[#4f46e5]',
      role: 'DevOps Engineer'
    },
    status: 'Completed',
    sprint: 'Sprint 36',
    completed: true
  }
];

export const INITIAL_FUNCTIONS: AgentFunction[] = [
  {
    id: 'func-1',
    name: 'Data Sync Agent',
    code: 'DS-2024',
    totalTasks: 48,
    completedTasks: 37,
    runningTasks: 8,
    pendingTasks: 3,
    status: 'On Track',
    progress: 78,
    lastRun: '12 min ago (09/09/2026)',
    owner: {
      name: 'Sarah Chen',
      role: 'Lead Agent Architect',
      initials: 'SC'
    },
    overview: 'Autonomous pipeline orchestrator managing data synchronization across ERP, legacy CRM, and cloud data warehouses with proactive schema drift validation.',
    timeline: [
      {
        title: 'Initial deployment',
        version: 'v1.0.0',
        date: '01/09/2026',
        status: 'Completed',
        description: 'Core sync pipelines active with ERP connector baseline.'
      },
      {
        title: 'Version 2 rollout',
        version: 'v2.0-rc',
        date: '08/09/2026',
        status: 'In Progress',
        description: 'Incremental sync support and auto-retry policy integration.'
      },
      {
        title: 'Compliance audit',
        version: 'Audit Review',
        date: '15/09/2026',
        status: 'Upcoming',
        description: 'Security logs validation and data governance compliance check.'
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'John Doe (PM)',
        role: 'Program Manager',
        initials: 'JD',
        timestamp: 'Hôm nay, 08:45 AM',
        content: 'Ưu tiên xử lý schema validation cho nhánh Data Warehouse trước 15:00. Đội Data Analytics cần kết quả đồng bộ dữ liệu khách hàng sạch để chốt báo cáo quý 3.',
        linkedTask: 'TSK-1048',
        isPinned: true
      },
      {
        id: 'note-2',
        author: 'John Doe (PM)',
        role: 'Program Manager',
        initials: 'JD',
        timestamp: 'Hôm qua, 04:15 PM',
        content: 'Đã kiểm tra log ban đêm, không phát hiện lỗi timeout. Duy trì tần suất đồng bộ 15 phút/lần cho tới khi có thông báo mới từ Sarah.',
        linkedTask: 'TSK-1031',
        isPinned: false
      }
    ]
  },
  {
    id: 'func-2',
    name: 'Risk Scanner',
    code: 'RS-2024',
    totalTasks: 36,
    completedTasks: 23,
    runningTasks: 7,
    pendingTasks: 6,
    status: 'At Risk',
    progress: 64,
    lastRun: '28 min ago (09/09/2026)',
    owner: {
      name: 'Alex Johnson',
      role: 'Risk Analysis Lead',
      initials: 'AJ'
    },
    overview: 'Predictive anomaly detector analyzing sprint velocity deviations, merge conflict patterns, and resource bottlenecks.',
    timeline: [
      {
        title: 'Model calibration',
        version: 'v1.4',
        date: '02/09/2026',
        status: 'Completed',
        description: 'Heuristic weights adjusted for critical sprint milestone alerts.'
      },
      {
        title: 'Cross-repo dependency scan',
        version: 'v1.5-beta',
        date: '10/09/2026',
        status: 'In Progress',
        description: 'Scanning 14 upstream repos for blocking schema commits.'
      }
    ],
    notes: [
      {
        id: 'note-rs-1',
        author: 'John Doe (PM)',
        role: 'Program Manager',
        initials: 'JD',
        timestamp: 'Hôm qua, 11:20 AM',
        content: 'Cần cập nhật ngưỡng cảnh báo xác suất rủi ro cao cho nhánh Database Fallback.',
        linkedTask: 'TSK-1025',
        isPinned: false
      }
    ]
  },
  {
    id: 'func-3',
    name: 'Report Generator',
    code: 'RG-2024',
    totalTasks: 62,
    completedTasks: 31,
    runningTasks: 18,
    pendingTasks: 13,
    status: 'At Risk',
    progress: 51,
    lastRun: '45 min ago (09/09/2026)',
    owner: {
      name: 'Maria Kim',
      role: 'BI & Reporting Lead',
      initials: 'MK'
    },
    overview: 'Automated executive brief generation compiling sprint deliverables, QA pass ratios, and compliance reports.',
    timeline: [
      {
        title: 'Template automation',
        version: 'v2.1',
        date: '04/09/2026',
        status: 'Completed',
        description: 'Sprint 36 standard executive presentation template configured.'
      },
      {
        title: 'PDF & Sheet export pipeline',
        version: 'v2.2',
        date: '12/09/2026',
        status: 'In Progress',
        description: 'Resolving multi-currency rounding discrepancies in ledger summary.'
      }
    ],
    notes: [
      {
        id: 'note-rg-1',
        author: 'John Doe (PM)',
        role: 'Program Manager',
        initials: 'JD',
        timestamp: 'Hôm nay, 07:15 AM',
        content: 'Yêu cầu xuất thử nghiệm bản tóm tắt Audit Docs dạng PDF cho Ban Giám Đốc trước thứ Sáu.',
        isPinned: true
      }
    ]
  },
  {
    id: 'func-4',
    name: 'Compliance Checker',
    code: 'CC-2024',
    totalTasks: 24,
    completedTasks: 23,
    runningTasks: 1,
    pendingTasks: 0,
    status: 'On Track',
    progress: 95,
    lastRun: '5 min ago (09/09/2026)',
    owner: {
      name: 'Michael Torres',
      role: 'Security & Compliance Lead',
      initials: 'MT'
    },
    overview: 'Continuous verification engine matching project artifacts against SOC2, ISO27001, and enterprise internal control criteria.',
    timeline: [
      {
        title: 'SOC2 Rule pack setup',
        version: 'v3.0',
        date: '01/09/2026',
        status: 'Completed',
        description: 'All 42 automated validation controls passed successfully.'
      },
      {
        title: 'Quarterly Audit readiness seal',
        version: 'v3.1',
        date: '09/09/2026',
        status: 'Completed',
        description: 'Final signing completed by lead security officer.'
      }
    ],
    notes: [
      {
        id: 'note-cc-1',
        author: 'John Doe (PM)',
        role: 'Program Manager',
        initials: 'JD',
        timestamp: '08/09/2026, 02:00 PM',
        content: 'Tuân thủ đạt 95%, chỉ còn một điều khoản xác thực schema API Gateway cần Alex bổ sung.',
        linkedTask: 'TSK-1048',
        isPinned: false
      }
    ]
  }
];

export const INITIAL_MEETINGS: MeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Cloud Migration Checkpoint',
    type: 'Project checkpoint',
    dateStr: 'Thu, Oct 24',
    monthStr: 'Oct',
    timeStr: '10:00 AM – 11:00 AM',
    status: 'Confirmed',
    healthStatus: 'On Track',
    platform: 'Microsoft Teams',
    platformLink: 'https://teams.microsoft.com/l/meetup-join/cloud-migration-checkpoint',
    attendees: [
      {
        name: 'Alex Johnson',
        role: 'Meeting organizer',
        initials: 'AJ',
        avatarBg: 'bg-blue-100',
        avatarColor: 'text-blue-600'
      },
      {
        name: 'John Doe',
        role: 'Program manager',
        initials: 'JD',
        avatarBg: 'bg-emerald-100',
        avatarColor: 'text-emerald-700'
      },
      {
        name: 'Sarah Chen',
        role: 'Cloud Lead Architect',
        initials: 'SC',
        avatarBg: 'bg-purple-100',
        avatarColor: 'text-purple-700'
      }
    ],
    agenda: [
      {
        num: '01',
        title: 'Project status and milestones',
        desc: 'Review 88% completion of API Gateway & schema validation'
      },
      {
        num: '02',
        title: 'Review open risks',
        desc: 'Address high impact latency risk in failover database zone'
      },
      {
        num: '03',
        title: 'Decisions and next steps',
        desc: 'Final sign-off on Sprint 36 cutover schedule and fallback window'
      }
    ],
    momNotes: {
      summary: 'Reviewed migration milestones for Sprint 36. Primary gateway is operating reliably with under 35ms latency. All key dependencies for the cloud transition are green.',
      decisions: [
        'Cutover window approved for Saturday 02:00 AM UTC.',
        'Data Sync Agent will run at 5-minute intervals during maintenance.',
        'Sarah Chen designated as technical incident commander during release.'
      ],
      transcriptSnippets: [
        'Alex: The gateway mock tests completed with 99.98% uptime across all endpoints.',
        'Sarah: Database fallback replica is fully synced, replication lag is under 180ms.',
        'John: Approved. Let us make sure PM audit review documents are submitted before Friday.'
      ]
    },
    actionItems: [
      {
        id: 'act-1',
        task: 'Confirm database snapshot backup before 23:00',
        assignee: 'Maria Kim',
        dueDate: 'Oct 23',
        completed: true
      },
      {
        id: 'act-2',
        task: 'Issue PM sign-off certificate for API Gateway',
        assignee: 'John Doe',
        dueDate: 'Oct 24',
        completed: true
      },
      {
        id: 'act-3',
        task: 'Conduct simulated network failover drill',
        assignee: 'Sarah Chen',
        dueDate: 'Oct 25',
        completed: false
      }
    ]
  },
  {
    id: 'meet-2',
    title: 'Portfolio Steering Committee',
    type: 'Executive review',
    dateStr: 'Fri, Oct 25',
    monthStr: 'Oct',
    timeStr: '2:00 PM – 3:30 PM',
    status: 'Confirmed',
    healthStatus: 'On Track',
    platform: 'Google Meet',
    platformLink: 'https://meet.google.com/pma-steering-review',
    attendees: [
      {
        name: 'John Doe',
        role: 'Program manager',
        initials: 'JD',
        avatarBg: 'bg-emerald-100',
        avatarColor: 'text-emerald-700'
      },
      {
        name: 'Michael Torres',
        role: 'Director of Technology',
        initials: 'MT',
        avatarBg: 'bg-blue-100',
        avatarColor: 'text-blue-600'
      },
      {
        name: 'Linh Nguyen',
        role: 'Quality Assurance VP',
        initials: 'LN',
        avatarBg: 'bg-purple-100',
        avatarColor: 'text-purple-700'
      }
    ],
    agenda: [
      {
        num: '01',
        title: 'Portfolio health & budget tracking'
      },
      {
        num: '02',
        title: 'Critical risk exposure overview (8 items)'
      },
      {
        num: '03',
        title: 'Q4 roadmap priorities and staffing allocations'
      }
    ],
    momNotes: {
      summary: 'Executive committee reviewed overall portfolio health standing at 94.2%. Budget variance is well within the 3% target margin.',
      decisions: [
        'Allocated additional senior DevOps contractor to assist cloud storage optimization.',
        'Fast-track approval granted for Q3 Compliance Audit artifacts.'
      ],
      transcriptSnippets: [
        'John: Our sprint delivery rate improved from 78% in S33 to 94.2% in S36.',
        'Michael: Let us ensure risk exposure in High impact tier is mitigated before Q4.'
      ]
    },
    actionItems: [
      {
        id: 'act-4',
        task: 'Deliver consolidated portfolio deck to steering board',
        assignee: 'John Doe',
        dueDate: 'Oct 25',
        completed: false
      }
    ]
  },
  {
    id: 'meet-3',
    title: 'ERP Vendor Review',
    type: 'Vendor checkpoint',
    dateStr: 'Mon, Oct 28',
    monthStr: 'Oct',
    timeStr: '11:30 AM – 12:30 PM',
    status: 'Pending',
    healthStatus: 'At Risk',
    platform: 'Zoom',
    platformLink: 'https://zoom.us/j/erp-vendor-review',
    attendees: [
      {
        name: 'Sarah Chen',
        role: 'Cloud Lead Architect',
        initials: 'SC',
        avatarBg: 'bg-purple-100',
        avatarColor: 'text-purple-700'
      },
      {
        name: 'John Doe',
        role: 'Program manager',
        initials: 'JD',
        avatarBg: 'bg-emerald-100',
        avatarColor: 'text-emerald-700'
      },
      {
        name: 'David Tran',
        role: 'Vendor Technical Liaison',
        initials: 'DT',
        avatarBg: 'bg-blue-100',
        avatarColor: 'text-blue-600'
      }
    ],
    agenda: [
      {
        num: '01',
        title: 'ERP Connector throughput SLA discussion'
      },
      {
        num: '02',
        title: 'Rate limiting thresholds & retry timeouts'
      }
    ],
    momNotes: {
      summary: 'Agenda draft prepared. Waiting for vendor technical director confirmation.',
      decisions: [],
      transcriptSnippets: []
    },
    actionItems: [
      {
        id: 'act-5',
        task: 'Send benchmark latency metrics to vendor support',
        assignee: 'David Tran',
        dueDate: 'Oct 27',
        completed: false
      }
    ]
  },
  {
    id: 'meet-4',
    title: 'Quarterly Compliance Sync',
    type: 'Audit & Compliance',
    dateStr: 'Thu, Nov 02',
    monthStr: 'Nov',
    timeStr: '9:00 AM – 10:30 AM',
    status: 'Confirmed',
    healthStatus: 'On Track',
    platform: 'Microsoft Teams',
    platformLink: 'https://teams.microsoft.com/l/meetup-join/quarterly-compliance',
    attendees: [
      {
        name: 'Michael Torres',
        role: 'Compliance Lead',
        initials: 'MT',
        avatarBg: 'bg-blue-100',
        avatarColor: 'text-blue-600'
      },
      {
        name: 'John Doe',
        role: 'Program manager',
        initials: 'JD',
        avatarBg: 'bg-emerald-100',
        avatarColor: 'text-emerald-700'
      }
    ],
    agenda: [
      {
        num: '01',
        title: 'Review 12 standard audit documents'
      },
      {
        num: '02',
        title: 'Sign-off on AI Audit verification logs'
      }
    ],
    momNotes: {
      summary: 'Quarterly sync pre-checks scheduled.',
      decisions: [],
      transcriptSnippets: []
    },
    actionItems: []
  }
];

export const INITIAL_AUDIT_DOCS: AuditDocument[] = [
  {
    id: 'doc-1',
    phase: 'Phase 1',
    title: 'Q3 Agent Compliance Audit',
    docType: 'Compliance Checklist',
    owner: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarBg: 'bg-[#004ac6]'
    },
    reviewer: {
      name: 'John Doe',
      initials: 'JD',
      avatarBg: 'bg-[#1877f2]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'Autonomous compliance checks passed across 24 rules.',
    pmReviewStatus: 'In Progress',
    pmReviewNote: 'AI flagged for PM review',
    sprint: 'S36',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'doc-2',
    phase: 'Phase 1',
    title: 'Security Assessment – Data Sync Agent',
    docType: 'Security Review',
    owner: {
      name: 'Michael Torres',
      initials: 'MT',
      avatarBg: 'bg-[#006591]'
    },
    reviewer: {
      name: 'Linh Nguyen',
      initials: 'LN',
      avatarBg: 'bg-[#4f46e5]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'Zero high severity vulnerabilities found in container scan.',
    pmReviewStatus: 'Completed',
    sprint: 'S36',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'doc-3',
    phase: 'Phase 2',
    title: 'Risk Scanner Architecture Review',
    docType: 'Architecture Review',
    owner: {
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarBg: 'bg-[#434655]'
    },
    reviewer: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarBg: 'bg-[#006242]'
    },
    aiAuditStatus: 'AI Flagged',
    aiAuditDetails: 'Cross-repo latency threshold exceeded by 14%.',
    pmReviewStatus: 'In Progress',
    pmReviewNote: 'Awaiting PM review',
    sprint: 'S36',
    lastUpdated: 'Yesterday'
  },
  {
    id: 'doc-4',
    phase: 'Phase 2',
    title: 'Data Sync Agent Test Report',
    docType: 'Test Report',
    owner: {
      name: 'David Tran',
      initials: 'DT',
      avatarBg: 'bg-[#1877f2]'
    },
    reviewer: {
      name: 'Linh Nguyen',
      initials: 'LN',
      avatarBg: 'bg-[#006591]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: '148 integration test suites passed with 100% assertion success.',
    pmReviewStatus: 'Completed',
    sprint: 'S36',
    lastUpdated: 'Yesterday'
  },
  {
    id: 'doc-5',
    phase: 'Phase 3',
    title: 'Failover Plan Document',
    docType: 'Operational Plan',
    owner: {
      name: 'Maria Kim',
      initials: 'MK',
      avatarBg: 'bg-[#006591]'
    },
    reviewer: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarBg: 'bg-[#006242]'
    },
    aiAuditStatus: 'AI Flagged',
    aiAuditDetails: 'RPO threshold meets criteria, RTO requires failover rehearsal.',
    pmReviewStatus: 'In Progress',
    pmReviewNote: 'AI flagged for PM review',
    sprint: 'S36',
    lastUpdated: '2 days ago'
  },
  {
    id: 'doc-6',
    phase: 'Phase 1',
    title: 'API Specification & Schema Audit',
    docType: 'Technical Spec',
    owner: {
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarBg: 'bg-[#434655]'
    },
    reviewer: {
      name: 'John Doe',
      initials: 'JD',
      avatarBg: 'bg-[#1877f2]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'OpenAPI 3.1 schema matches all deployed gateway endpoints.',
    pmReviewStatus: 'Completed',
    sprint: 'S36',
    lastUpdated: '3 days ago'
  },
  {
    id: 'doc-7',
    phase: 'Phase 2',
    title: 'Integration Test Plan & Gateway Review',
    docType: 'Verification Report',
    owner: {
      name: 'Tom Davis',
      initials: 'TD',
      avatarBg: 'bg-[#006591]'
    },
    reviewer: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarBg: 'bg-[#006242]'
    },
    aiAuditStatus: 'In Progress',
    aiAuditDetails: 'Test execution running in staging cluster.',
    pmReviewStatus: 'Pending',
    sprint: 'S36',
    lastUpdated: '4 days ago'
  },
  {
    id: 'doc-8',
    phase: 'Phase 3',
    title: 'Disaster Recovery & Redundancy Plan',
    docType: 'Security Policy',
    owner: {
      name: 'Nam Tran',
      initials: 'NT',
      avatarBg: 'bg-[#006591]'
    },
    reviewer: {
      name: 'Michael Torres',
      initials: 'MT',
      avatarBg: 'bg-[#006591]'
    },
    aiAuditStatus: 'Action Required',
    aiAuditDetails: 'Missing secondary region replication verification test.',
    pmReviewStatus: 'Rework',
    pmReviewNote: 'Requires update from security team',
    sprint: 'S36',
    lastUpdated: '5 days ago'
  },
  {
    id: 'doc-9',
    phase: 'Phase 1',
    title: 'Workflow Automation Protocols',
    docType: 'Compliance Checklist',
    owner: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarBg: 'bg-[#004ac6]'
    },
    reviewer: {
      name: 'John Doe',
      initials: 'JD',
      avatarBg: 'bg-[#1877f2]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'Verified automated CI/CD pipeline integrity.',
    pmReviewStatus: 'Completed',
    sprint: 'S36',
    lastUpdated: '5 days ago'
  },
  {
    id: 'doc-10',
    phase: 'Phase 2',
    title: 'Cloud Ingestion Protocol Specification',
    docType: 'Technical Spec',
    owner: {
      name: 'David Tran',
      initials: 'DT',
      avatarBg: 'bg-[#1877f2]'
    },
    reviewer: {
      name: 'John Doe',
      initials: 'JD',
      avatarBg: 'bg-[#1877f2]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'Streaming ingestion rate verified at 50,000 events/sec.',
    pmReviewStatus: 'PM Review',
    sprint: 'S36',
    lastUpdated: '6 days ago'
  },
  {
    id: 'doc-11',
    phase: 'Phase 2',
    title: 'Data Sync Anomaly Report',
    docType: 'Incident Log',
    owner: {
      name: 'Sarah Chen',
      initials: 'SC',
      avatarBg: 'bg-[#004ac6]'
    },
    reviewer: {
      name: 'Linh Nguyen',
      initials: 'LN',
      avatarBg: 'bg-[#4f46e5]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'No unhandled sync exceptions found in 72-hour window.',
    pmReviewStatus: 'Completed',
    sprint: 'S36',
    lastUpdated: '1 week ago'
  },
  {
    id: 'doc-12',
    phase: 'Phase 3',
    title: 'External Gateway Penetration Report',
    docType: 'Security Review',
    owner: {
      name: 'Michael Torres',
      initials: 'MT',
      avatarBg: 'bg-[#006591]'
    },
    reviewer: {
      name: 'John Doe',
      initials: 'JD',
      avatarBg: 'bg-[#1877f2]'
    },
    aiAuditStatus: 'AI Passed',
    aiAuditDetails: 'Clean audit certificate issued by independent auditor.',
    pmReviewStatus: 'Completed',
    sprint: 'S36',
    lastUpdated: '1 week ago'
  }
];

export const OWNER_RISK_EXPOSURE_DATA: OwnerRiskExposure[] = [
  {
    rank: 1,
    name: 'Alex Johnson',
    role: 'Platform Eng / Lead Dev',
    initials: 'AJ',
    avatarColor: 'bg-[#1877f2]',
    totalRisks: 7,
    critCount: 2,
    highCount: 3,
    medCount: 2,
    riskScore: 17,
    maxScore: 25,
    overdueCount: 2,
    topThreatRisk: 'RSK-022'
  },
  {
    rank: 2,
    name: 'Maria Kim',
    role: 'Compliance Lead',
    initials: 'MK',
    avatarColor: 'bg-[#059669]',
    totalRisks: 5,
    critCount: 2,
    highCount: 2,
    medCount: 1,
    riskScore: 14,
    maxScore: 25,
    overdueCount: 1,
    topThreatRisk: 'RSK-019'
  },
  {
    rank: 3,
    name: 'Sarah Chen',
    role: 'SRE Architect',
    initials: 'SC',
    avatarColor: 'bg-[#6366f1]',
    totalRisks: 4,
    critCount: 1,
    highCount: 1,
    medCount: 1,
    riskScore: 12,
    maxScore: 25,
    overdueCount: 0,
    topThreatRisk: 'RSK-008'
  },
  {
    rank: 4,
    name: 'Tom Davis',
    role: 'Core Contributor / Backend',
    initials: 'TD',
    avatarColor: 'bg-[#0ea5e9]',
    totalRisks: 3,
    critCount: 0,
    highCount: 1,
    medCount: 2,
    riskScore: 10,
    maxScore: 25,
    overdueCount: 0,
    topThreatRisk: 'RSK-015'
  },
  {
    rank: 5,
    name: 'Nam Tran',
    role: 'Data Pipeline Eng',
    initials: 'NT',
    avatarColor: 'bg-[#64748b]',
    totalRisks: 3,
    critCount: 0,
    highCount: 1,
    medCount: 2,
    riskScore: 6,
    maxScore: 25,
    overdueCount: 0,
    topThreatRisk: 'RSK-011'
  }
];

export const INITIAL_RISKS: RiskMatrixItem[] = [
  {
    id: 'RSK-022',
    riskName: 'Risk Scanner',
    title: 'API fallback and pair with integration tests',
    probability: 'High',
    probabilityPct: 76,
    impact: 'High',
    impactScore: 4.0,
    score: 16,
    owner: 'Alex Johnson',
    ownerInitials: 'AJ',
    ownerAvatarColor: 'bg-[#1877f2]',
    dueDate: '09/15/2026',
    dueRelative: 'In 6 days',
    status: 'In Progress',
    mitigationPlan: 'Implement circuit breaker fallback and mock integration test suites.',
    affectedFunction: 'Risk Scanner'
  },
  {
    id: 'RSK-019',
    riskName: 'Audit Trail Logger',
    title: 'Missing logs for some transactions',
    probability: 'High',
    probabilityPct: 75,
    impact: 'High',
    impactScore: 4.0,
    score: 15,
    owner: 'Maria Kim',
    ownerInitials: 'MK',
    ownerAvatarColor: 'bg-[#059669]',
    dueDate: '09/18/2026',
    dueRelative: 'In 9 days',
    status: 'Overdue',
    mitigationPlan: 'Buffer asynchronous disk writes and add backpressure alerts.',
    affectedFunction: 'Compliance Checker'
  },
  {
    id: 'RSK-017',
    riskName: 'Report Generator',
    title: 'Delay in report delivery',
    probability: 'Medium',
    probabilityPct: 60,
    impact: 'High',
    impactScore: 3.5,
    score: 12,
    owner: 'Tom Davis',
    ownerInitials: 'TD',
    ownerAvatarColor: 'bg-[#0ea5e9]',
    dueDate: '09/20/2026',
    dueRelative: 'In 11 days',
    status: 'Planned',
    mitigationPlan: 'Pre-aggregate metrics every hour to offload runtime PDF rendering.',
    affectedFunction: 'Report Generator'
  },
  {
    id: 'RSK-014',
    riskName: 'Compliance Checker',
    title: 'Probability of regression during QA',
    probability: 'Medium',
    probabilityPct: 42,
    impact: 'Medium',
    impactScore: 2.6,
    score: 6,
    owner: 'Sarah Lee',
    ownerInitials: 'SL',
    ownerAvatarColor: 'bg-[#6366f1]',
    dueDate: '09/22/2026',
    dueRelative: 'In 13 days',
    status: 'On Track',
    mitigationPlan: 'Run automated regression suite on all release candidate branches.',
    affectedFunction: 'Compliance Checker'
  },
  {
    id: 'RSK-011',
    riskName: 'Data Pipeline',
    title: 'Data quality issues in ingestion',
    probability: 'Low',
    probabilityPct: 26,
    impact: 'Medium',
    impactScore: 2.4,
    score: 5,
    owner: 'Nam Tran',
    ownerInitials: 'NT',
    ownerAvatarColor: 'bg-[#64748b]',
    dueDate: '09/25/2026',
    dueRelative: 'In 16 days',
    status: 'On Track',
    mitigationPlan: 'Validate schema at ingestion boundary with strict DLQ dead-letter routing.',
    affectedFunction: 'Data Sync Agent'
  },
  {
    id: 'RSK-008',
    riskName: 'DB Sync Agent',
    title: 'Replication lag exceeding SLA threshold',
    probability: 'High',
    probabilityPct: 81,
    impact: 'Critical',
    impactScore: 4.8,
    score: 20,
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
    ownerAvatarColor: 'bg-[#6366f1]',
    dueDate: '09/10/2026',
    dueRelative: 'Overdue 2 days',
    status: 'Overdue',
    mitigationPlan: 'Provision dedicated read replica in primary region with cross-zone sync.',
    affectedFunction: 'Data Sync Agent'
  },
  {
    id: 'RSK-005',
    riskName: 'Auth Gateway',
    title: 'OAuth token revocation sync latency across edge regions',
    probability: 'High',
    probabilityPct: 70,
    impact: 'Medium',
    impactScore: 3.0,
    score: 9,
    owner: 'Linh Nguyen',
    ownerInitials: 'LN',
    ownerAvatarColor: 'bg-[#9333ea]',
    dueDate: '09/17/2026',
    dueRelative: 'In 8 days',
    status: 'In Progress',
    mitigationPlan: 'Deploy Redis cluster blacklisting for revoked JWT JTI IDs.',
    affectedFunction: 'Risk Scanner'
  },
  {
    id: 'RSK-003',
    riskName: 'Notification Hub',
    title: 'Email deliverability throttling on batch alerts',
    probability: 'Low',
    probabilityPct: 20,
    impact: 'Low',
    impactScore: 1.5,
    score: 3,
    owner: 'David Tran',
    ownerInitials: 'DT',
    ownerAvatarColor: 'bg-[#4f46e5]',
    dueDate: '09/28/2026',
    dueRelative: 'In 19 days',
    status: 'Planned',
    mitigationPlan: 'Rate-limit outbound SMTP dispatch with priority queues.',
    affectedFunction: 'Report Generator'
  },
  {
    id: 'RSK-002',
    riskName: 'Security Monitor',
    title: 'DDoS simulation causing rate limiter saturation',
    probability: 'High',
    probabilityPct: 84,
    impact: 'High',
    impactScore: 4.1,
    score: 14,
    owner: 'Michael Torres',
    ownerInitials: 'MT',
    ownerAvatarColor: 'bg-[#0d9488]',
    dueDate: '09/16/2026',
    dueRelative: 'In 7 days',
    status: 'In Progress',
    mitigationPlan: 'Configure Cloudflare WAF bot mitigation and tier 1 IP throttling.',
    affectedFunction: 'Compliance Checker'
  },
  {
    id: 'RSK-001',
    riskName: 'Backup Controller',
    title: 'Snapshot restoration duration exceeds RTO targets',
    probability: 'Medium',
    probabilityPct: 50,
    impact: 'Medium',
    impactScore: 2.5,
    score: 8,
    owner: 'Priya Sharma',
    ownerInitials: 'PS',
    ownerAvatarColor: 'bg-[#ea580c]',
    dueDate: '09/29/2026',
    dueRelative: 'In 20 days',
    status: 'On Track',
    mitigationPlan: 'Implement incremental snapshots and automated test recovery drills.',
    affectedFunction: 'Data Sync Agent'
  },
  {
    id: 'RSK-010',
    riskName: 'Cache Cluster Invalidation',
    title: 'Race condition on cache stampede during promotion event',
    probability: 'High',
    probabilityPct: 78,
    impact: 'High',
    impactScore: 3.8,
    score: 15,
    owner: 'Alex Johnson',
    ownerInitials: 'AJ',
    ownerAvatarColor: 'bg-[#1877f2]',
    dueDate: '09/14/2026',
    dueRelative: 'Overdue 1 day',
    status: 'Overdue',
    mitigationPlan: 'Apply probabilistic early expiration (XFetch algorithm) to cache keys.',
    affectedFunction: 'Risk Scanner'
  },
  {
    id: 'RSK-015',
    riskName: 'Payment Gateway Sandbox',
    title: '3DS 2.0 challenge flow timeout in staging environment',
    probability: 'Medium',
    probabilityPct: 55,
    impact: 'High',
    impactScore: 3.6,
    score: 11,
    owner: 'Tom Davis',
    ownerInitials: 'TD',
    ownerAvatarColor: 'bg-[#0ea5e9]',
    dueDate: '09/21/2026',
    dueRelative: 'In 12 days',
    status: 'In Progress',
    mitigationPlan: 'Simulate mock merchant frictionless flow for CI webhook tests.',
    affectedFunction: 'Report Generator'
  },
  {
    id: 'RSK-007',
    riskName: 'Kafka Consumer Group',
    title: 'Partition rebalancing pause during worker autoscaling',
    probability: 'Medium',
    probabilityPct: 52,
    impact: 'Medium',
    impactScore: 2.9,
    score: 9,
    owner: 'Alex Johnson',
    ownerInitials: 'AJ',
    ownerAvatarColor: 'bg-[#1877f2]',
    dueDate: '09/23/2026',
    dueRelative: 'In 14 days',
    status: 'In Progress',
    mitigationPlan: 'Upgrade to cooperative sticky assignor protocol.',
    affectedFunction: 'Data Sync Agent'
  },
  {
    id: 'RSK-009',
    riskName: 'Kubernetes Ingress Controller',
    title: 'TLS handshake latency spikes on HTTP/2 concurrent streams',
    probability: 'Low',
    probabilityPct: 24,
    impact: 'High',
    impactScore: 3.5,
    score: 5,
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
    ownerAvatarColor: 'bg-[#6366f1]',
    dueDate: '09/26/2026',
    dueRelative: 'In 17 days',
    status: 'On Track',
    mitigationPlan: 'Enable session tickets and zero-round-trip session resumption.',
    affectedFunction: 'Compliance Checker'
  },
  {
    id: 'RSK-012',
    riskName: 'Elasticsearch Index Sharding',
    title: 'Unbalanced shard allocation causing GC pauses on primary node',
    probability: 'Medium',
    probabilityPct: 48,
    impact: 'Medium',
    impactScore: 2.8,
    score: 8,
    owner: 'Maria Kim',
    ownerInitials: 'MK',
    ownerAvatarColor: 'bg-[#059669]',
    dueDate: '09/24/2026',
    dueRelative: 'In 15 days',
    status: 'Planned',
    mitigationPlan: 'Re-index onto 5 uniform shards with index lifecycle management rules.',
    affectedFunction: 'Risk Scanner'
  },
  {
    id: 'RSK-013',
    riskName: 'GraphQL Federation Router',
    title: 'Entity resolution circular query depth vulnerability',
    probability: 'High',
    probabilityPct: 65,
    impact: 'Medium',
    impactScore: 3.2,
    score: 10,
    owner: 'Maria Kim',
    ownerInitials: 'MK',
    ownerAvatarColor: 'bg-[#059669]',
    dueDate: '09/19/2026',
    dueRelative: 'In 10 days',
    status: 'In Progress',
    mitigationPlan: 'Implement query complexity limit and maximum depth validation plugin.',
    affectedFunction: 'Report Generator'
  },
  {
    id: 'RSK-016',
    riskName: 'Dead Letter Queue Monitor',
    title: 'Unprocessed poison pills accumulating without alert dispatch',
    probability: 'Low',
    probabilityPct: 18,
    impact: 'Low',
    impactScore: 1.8,
    score: 2,
    owner: 'Nam Tran',
    ownerInitials: 'NT',
    ownerAvatarColor: 'bg-[#64748b]',
    dueDate: '09/30/2026',
    dueRelative: 'In 21 days',
    status: 'On Track',
    mitigationPlan: 'Deploy automated CloudWatch metric alarm on SQS DLQ message count > 10.',
    affectedFunction: 'Data Sync Agent'
  },
  {
    id: 'RSK-018',
    riskName: 'Secrets Manager Daemon',
    title: 'Rotation hook failures on database master user credentials',
    probability: 'Medium',
    probabilityPct: 35,
    impact: 'High',
    impactScore: 4.2,
    score: 7,
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
    ownerAvatarColor: 'bg-[#6366f1]',
    dueDate: '09/27/2026',
    dueRelative: 'In 18 days',
    status: 'Planned',
    mitigationPlan: 'Test dual-user alternating credential rotation Lambda function.',
    affectedFunction: 'Compliance Checker'
  },
  {
    id: 'RSK-020',
    riskName: 'WebSocket Connection Pool',
    title: 'Mobile client reconnect storms after pod redeployment',
    probability: 'High',
    probabilityPct: 72,
    impact: 'Medium',
    impactScore: 3.3,
    score: 11,
    owner: 'Alex Johnson',
    ownerInitials: 'AJ',
    ownerAvatarColor: 'bg-[#1877f2]',
    dueDate: '09/16/2026',
    dueRelative: 'In 7 days',
    status: 'In Progress',
    mitigationPlan: 'Add exponential backoff with full jitter to client reconnect SDKs.',
    affectedFunction: 'Risk Scanner'
  },
  {
    id: 'RSK-021',
    riskName: 'Log Shipper Agent',
    title: 'High CPU throttling on log collection daemon under burst debug flags',
    probability: 'Low',
    probabilityPct: 22,
    impact: 'Low',
    impactScore: 1.6,
    score: 3,
    owner: 'Nam Tran',
    ownerInitials: 'NT',
    ownerAvatarColor: 'bg-[#64748b]',
    dueDate: '10/02/2026',
    dueRelative: 'In 23 days',
    status: 'On Track',
    mitigationPlan: 'Cap container CPU limit and configure FluentBit sampling filters.',
    affectedFunction: 'Report Generator'
  },
  {
    id: 'RSK-023',
    riskName: 'PCI-DSS Token Vault',
    title: 'Audit trail truncation on cardholder data query logs',
    probability: 'Medium',
    probabilityPct: 40,
    impact: 'High',
    impactScore: 4.5,
    score: 10,
    owner: 'Maria Kim',
    ownerInitials: 'MK',
    ownerAvatarColor: 'bg-[#059669]',
    dueDate: '09/21/2026',
    dueRelative: 'In 12 days',
    status: 'In Progress',
    mitigationPlan: 'Route all vault audit events directly to write-once WORM S3 bucket.',
    affectedFunction: 'Compliance Checker'
  },
  {
    id: 'RSK-024',
    riskName: 'Blob Storage Lifecycle',
    title: 'Glacier transition policy archiving active thumbnail assets',
    probability: 'Low',
    probabilityPct: 15,
    impact: 'Low',
    impactScore: 1.4,
    score: 2,
    owner: 'David Tran',
    ownerInitials: 'DT',
    ownerAvatarColor: 'bg-[#4f46e5]',
    dueDate: '10/05/2026',
    dueRelative: 'In 26 days',
    status: 'On Track',
    mitigationPlan: 'Exclude thumbnail prefix patterns from deep archive lifecycle rules.',
    affectedFunction: 'Report Generator'
  },
  {
    id: 'RSK-025',
    riskName: 'Distributed Tracing Exporter',
    title: 'Span dropped rate exceeding 5% on high throughput endpoints',
    probability: 'Low',
    probabilityPct: 28,
    impact: 'Low',
    impactScore: 2.0,
    score: 4,
    owner: 'Alex Johnson',
    ownerInitials: 'AJ',
    ownerAvatarColor: 'bg-[#1877f2]',
    dueDate: '09/28/2026',
    dueRelative: 'In 19 days',
    status: 'Planned',
    mitigationPlan: 'Implement adaptive head-based sampling to reduce span volume by 60%.',
    affectedFunction: 'Risk Scanner'
  },
  {
    id: 'RSK-026',
    riskName: 'Async Task Worker Queue',
    title: 'Celery worker prefetch multiplier starving long-running ETL jobs',
    probability: 'Medium',
    probabilityPct: 45,
    impact: 'Medium',
    impactScore: 2.5,
    score: 6,
    owner: 'Tom Davis',
    ownerInitials: 'TD',
    ownerAvatarColor: 'bg-[#0ea5e9]',
    dueDate: '09/25/2026',
    dueRelative: 'In 16 days',
    status: 'In Progress',
    mitigationPlan: 'Set worker_prefetch_multiplier=1 and dedicated queues for ETL tasks.',
    affectedFunction: 'Data Sync Agent'
  }
];

export const SPRINT_DATA = {
  'Sprint 36': {
    health: '94.2%',
    healthStatus: 'On Track',
    healthDelta: '+2.8%',
    criticalRiskCount: 8,
    criticalRiskDelta: '+2',
    auditPendingCount: 3,
    auditPendingDelta: '+1',
    totalTasks: 274,
    completedTasks: 186,
    completedRate: '75%',
    inProgressTasks: 62,
    inProgressRate: '25%',
    pendingTasks: 14,
    pendingRate: '5.1%',
    overdueTasks: 12,
    overdueRate: '4.8%',
    auditTotalDocs: 12,
    auditAgentPassed: 9,
    auditPmApproved: 6,
    auditPendingPm: 3,
    auditRejected: 0
  },
  'Sprint 35': {
    health: '91.4%',
    healthStatus: 'On Track',
    healthDelta: '+5.4%',
    criticalRiskCount: 6,
    criticalRiskDelta: '-1',
    auditPendingCount: 2,
    auditPendingDelta: '0',
    totalTasks: 250,
    completedTasks: 162,
    completedRate: '68%',
    inProgressTasks: 60,
    inProgressRate: '24%',
    pendingTasks: 18,
    pendingRate: '7.2%',
    overdueTasks: 10,
    overdueRate: '4.0%',
    auditTotalDocs: 11,
    auditAgentPassed: 8,
    auditPmApproved: 6,
    auditPendingPm: 2,
    auditRejected: 1
  },
  'Sprint 34': {
    health: '86.0%',
    healthStatus: 'On Track',
    healthDelta: '+4.0%',
    criticalRiskCount: 7,
    criticalRiskDelta: '+1',
    auditPendingCount: 4,
    auditPendingDelta: '+2',
    totalTasks: 235,
    completedTasks: 145,
    completedRate: '61%',
    inProgressTasks: 65,
    inProgressRate: '27%',
    pendingTasks: 15,
    pendingRate: '6.4%',
    overdueTasks: 10,
    overdueRate: '4.2%',
    auditTotalDocs: 10,
    auditAgentPassed: 7,
    auditPmApproved: 5,
    auditPendingPm: 4,
    auditRejected: 0
  },
  'Sprint 33': {
    health: '82.0%',
    healthStatus: 'At Risk',
    healthDelta: '+1.5%',
    criticalRiskCount: 6,
    criticalRiskDelta: '0',
    auditPendingCount: 2,
    auditPendingDelta: '-1',
    totalTasks: 210,
    completedTasks: 120,
    completedRate: '57%',
    inProgressTasks: 70,
    inProgressRate: '33%',
    pendingTasks: 12,
    pendingRate: '5.7%',
    overdueTasks: 8,
    overdueRate: '3.8%',
    auditTotalDocs: 9,
    auditAgentPassed: 6,
    auditPmApproved: 4,
    auditPendingPm: 2,
    auditRejected: 1
  }
};
