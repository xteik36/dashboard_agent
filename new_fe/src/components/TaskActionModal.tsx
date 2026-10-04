import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';

export type ActionModalType =
  | 'none'
  | 'reassign'
  | 'dueDate'
  | 'comment'
  | 'blocked'
  | 'status';

interface TaskActionModalProps {
  isOpen: boolean;
  type: ActionModalType;
  task: TaskItem | null;
  onClose: () => void;
  onSave: (updatedTask: TaskItem, toastMsg: string) => void;
}

const TEAM_MEMBERS = [
  { name: 'Alex Johnson', initials: 'AJ', bg: 'bg-blue-600', role: 'Frontend Lead' },
  { name: 'Sarah Chen', initials: 'SC', bg: 'bg-emerald-600', role: 'QA & Security' },
  { name: 'Maria Kim', initials: 'MK', bg: 'bg-sky-600', role: 'Database Engineer' },
  { name: 'David Tran', initials: 'DT', bg: 'bg-indigo-600', role: 'DevOps / SRE' },
  { name: 'Linh Nguyen', initials: 'LN', bg: 'bg-purple-600', role: 'Backend Dev' },
];

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  isOpen,
  type,
  task,
  onClose,
  onSave,
}) => {
  if (!isOpen || !task || type === 'none') return null;

  // Reassign state
  const [selectedOwner, setSelectedOwner] = useState(task.owner.name);
  const [handoverNote, setHandoverNote] = useState('');

  // Due Date state
  const [selectedDueDate, setSelectedDueDate] = useState(task.dueDate);
  const [dueDateReason, setDueDateReason] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');

  // Blocked state
  const [blockerReason, setBlockerReason] = useState(task.blockerReason || '');
  const [blockerStatus, setBlockerStatus] = useState<'Blocked' | 'At Risk' | 'Overdue'>(
    task.status === 'Overdue' ? 'Overdue' : 'Blocked'
  );

  // Status state
  const [newStatus, setNewStatus] = useState<TaskItem['status']>(task.status);
  const [newProgress, setNewProgress] = useState<number>(task.progress);

  useEffect(() => {
    if (task) {
      setSelectedOwner(task.owner.name);
      setSelectedDueDate(task.dueDate);
      setBlockerReason(task.blockerReason || '');
      setNewStatus(task.status);
      setNewProgress(task.progress);
      setHandoverNote('');
      setDueDateReason('');
      setCommentText('');
    }
  }, [task, type]);

  const handleConfirm = () => {
    if (!task) return;

    if (type === 'reassign') {
      const member = TEAM_MEMBERS.find((m) => m.name === selectedOwner);
      if (!member) return;
      const updated: TaskItem = {
        ...task,
        owner: {
          name: member.name,
          initials: member.initials,
          avatarBg: member.bg,
        },
      };
      onSave(updated, `Reassigned ${task.id} to ${member.name}`);
    } else if (type === 'dueDate') {
      const updated: TaskItem = {
        ...task,
        dueDate: selectedDueDate,
      };
      onSave(updated, `Updated due date for ${task.id} to ${selectedDueDate}`);
    } else if (type === 'comment') {
      if (!commentText.trim()) return;
      onSave(task, `Comment added to ${task.id}`);
    } else if (type === 'blocked') {
      const updated: TaskItem = {
        ...task,
        status: blockerStatus,
        blockerReason: blockerReason || 'Marked as blocked by PM',
      };
      onSave(updated, `${task.id} marked as ${blockerStatus}`);
    } else if (type === 'status') {
      const updated: TaskItem = {
        ...task,
        status: newStatus,
        progress: newProgress,
      };
      onSave(updated, `Status of ${task.id} updated to ${newStatus} (${newProgress}%)`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                {type === 'reassign' && 'person_add'}
                {type === 'dueDate' && 'edit_calendar'}
                {type === 'comment' && 'chat_bubble'}
                {type === 'blocked' && 'block'}
                {type === 'status' && 'tune'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {type === 'reassign' && 'Reassign Task Owner'}
                {type === 'dueDate' && 'Update Due Date'}
                {type === 'comment' && 'Add PM Comment'}
                {type === 'blocked' && 'Mark Task as Blocked'}
                {type === 'status' && 'Update Task Status'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {task.id} • {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content depending on type */}
        <div className="p-5 space-y-4 text-xs">
          {/* 1. REASSIGN */}
          {type === 'reassign' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select New Owner:
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {TEAM_MEMBERS.map((member) => {
                    const isSelected = selectedOwner === member.name;
                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => setSelectedOwner(member.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-full ${member.bg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                          >
                            {member.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {member.name}
                            </div>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[18px] text-blue-600">
                            check_circle
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Handover Note (Optional):
                </label>
                <input
                  type="text"
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  placeholder="e.g. Please sync with QA before deploy..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 2. UPDATE DUE DATE */}
          {type === 'dueDate' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Preset Due Dates:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 5 days', 'Next Sprint'].map(
                    (d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDueDate(d)}
                        className={`py-2 px-2.5 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          selectedDueDate === d
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Or Custom Due Date:
                </label>
                <input
                  type="text"
                  value={selectedDueDate}
                  onChange={(e) => setSelectedDueDate(e.target.value)}
                  placeholder="e.g. Oct 28, 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Extension Reason (Optional):
                </label>
                <input
                  type="text"
                  value={dueDateReason}
                  onChange={(e) => setDueDateReason(e.target.value)}
                  placeholder="e.g. Blocked on upstream gateway dependency"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 3. ADD COMMENT */}
          {type === 'comment' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  PM Comment & Action Note:
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  placeholder="Enter comments, blocker updates or mitigation notes for this task..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
              <p className="text-[11px] text-slate-400">
                Comment will be logged to task activity history and notified to owner.
              </p>
            </>
          )}

          {/* 4. MARK AS BLOCKED */}
          {type === 'blocked' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Status Flag:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Blocked', 'At Risk', 'Overdue'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setBlockerStatus(st)}
                      className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        blockerStatus === st
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Blocker Reason & Remediation Details:
                </label>
                <textarea
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this task is blocked (e.g. waiting for 3rd party API endpoint specs)..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                ></textarea>
              </div>
            </>
          )}

          {/* 5. UPDATE STATUS */}
          {type === 'status' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In Progress', 'At Risk', 'Overdue', 'Completed', 'Blocked'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewStatus(st)}
                        className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          newStatus === st
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Progress:</label>
                  <span className="font-bold text-blue-600">{newProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
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
    </div>
  );
};
