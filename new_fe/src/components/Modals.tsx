import React, { useState } from 'react';
import {
  CRITICAL_RISK_TASKS,
  AUDIT_PENDING_DOCS,
  SPRINT_LIST,
} from '../data/mockData';
import { SprintInfo, TaskItem } from '../types';

interface CriticalRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onOpenTaskDetail?: (taskId: string) => void;
}

export const CriticalRiskModal: React.FC<CriticalRiskModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onOpenTaskDetail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Critical Risks Drill-down ({CRITICAL_RISK_TASKS.length} Tasks)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                  Highest Attention
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasks with Risk Score ≥ 15 requiring immediate mitigation action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-100 text-[11px]">
                <th className="pb-3 font-medium">Task ID & Name</th>
                <th className="pb-3 font-medium text-center w-16">Sprint</th>
                <th className="pb-3 font-medium w-36">Owner</th>
                <th className="pb-3 font-medium w-28 text-center">Risk Score</th>
                <th className="pb-3 font-medium w-24">Due Date</th>
                <th className="pb-3 font-medium text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CRITICAL_RISK_TASKS.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="font-bold text-slate-900 leading-tight">{task.name}</div>
                    <span className="text-[11px] text-slate-400">
                      {task.id} • {task.description}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                      {task.sprint}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${task.owner.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                      >
                        {task.owner.initials}
                      </div>
                      <span className="font-medium text-slate-700 truncate">
                        {task.owner.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      {task.score} Critical
                    </span>
                  </td>
                  <td
                    className={`py-3 font-semibold ${
                      task.isOverdue ? 'text-red-600' : 'text-slate-600'
                    }`}
                  >
                    {task.dueDate}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        if (onOpenTaskDetail) {
                          onOpenTaskDetail(task.id);
                        } else {
                          onClose();
                          onSelectTask(task.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Đi tới Task ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing all <strong>{CRITICAL_RISK_TASKS.length}</strong> critical risk tasks across active sprints
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface AuditPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateAudit: () => void;
}

export const AuditPendingModal: React.FC<AuditPendingModalProps> = ({
  isOpen,
  onClose,
  onNavigateAudit,
}) => {
  const [docs, setDocs] = useState(AUDIT_PENDING_DOCS);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Pending PM Review Documents ({docs.length} Docs)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                  Need PM Check
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                All 3 documents passed agent validation check. PM decision required.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-100 text-[11px]">
                <th className="pb-3 font-medium">Document Name</th>
                <th className="pb-3 font-medium text-center w-16">Sprint</th>
                <th className="pb-3 font-medium w-36">Prepared By / Owner</th>
                <th className="pb-3 font-medium w-28">Submitted</th>
                <th className="pb-3 font-medium text-center w-36">Status</th>
                <th className="pb-3 font-medium text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((doc) => {
                const isApproved = approvedIds.includes(doc.id);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className={`material-symbols-outlined text-[18px] ${doc.iconColor} shrink-0`}>
                          description
                        </span>
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
                        {doc.sprint}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${doc.owner.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                        >
                          {doc.owner.initials}
                        </div>
                        <span className="font-medium text-slate-700 truncate">
                          {doc.owner.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{doc.submitted}</td>
                    <td className="py-3 text-center">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending PM Check
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {isApproved ? (
                        <span className="text-[11px] font-medium text-emerald-600">✓ Done</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(doc.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateAudit();
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                          >
                            Review ↗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigateAudit();
            }}
            className="text-purple-700 font-semibold hover:underline"
          >
            Go to Audit Docs workspace →
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface SprintDetailModalProps {
  sprint: SprintInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenProgressTask: (sprintName: string) => void;
}

export const SprintDetailModal: React.FC<SprintDetailModalProps> = ({
  sprint,
  isOpen,
  onClose,
  onOpenProgressTask,
}) => {
  if (!isOpen || !sprint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">checklist</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {sprint.name} — Execution Detail
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${sprint.badgeClass}`}>
                  {sprint.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current active sprint execution & milestone tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">Progress</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{sprint.progress}%</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">Total Tasks</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{sprint.totalTasks}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">Overdue</div>
              <div className="text-xl font-bold text-red-600 mt-0.5">{sprint.overdueTasks}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Sprint Goal Completion</span>
              <span className="text-slate-900">{sprint.progress}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  sprint.progress >= 70
                    ? 'bg-emerald-500'
                    : sprint.progress >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${sprint.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-900 mb-2.5">Key Tasks In This Sprint</div>
            <ul className="space-y-2 text-xs">
              {sprint.keyTasks.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100"
                >
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-normal">{item.owner}</span>
                    <span className="font-semibold text-slate-700">{item.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Execution status synchronized</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenProgressTask(sprint.name);
              }}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
            >
              <span>Open in Progress Task</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (meeting: any) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-25');
  const [time, setTime] = useState('10:00 AM – 11:00 AM');
  const [platform, setPlatform] = useState('Microsoft Teams');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSchedule({
      title,
      date: `Thu, ${date.split('-').slice(1).join('/')}`,
      time,
      platform,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Schedule Meeting</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sprint Retrospective & Architecture Review"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM – 11:00 AM"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Conference Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="Microsoft Teams">Microsoft Teams</option>
              <option value="Google Meet">Google Meet</option>
              <option value="Zoom Video">Zoom Video</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Schedule session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
