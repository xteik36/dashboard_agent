import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TaskItem } from '../types';

export type TaskActionType = 'reassign' | 'dueDate' | 'comment' | 'blocked';

const FALLBACK_TEAM_MEMBERS = [
  { name: 'Alex Johnson', initials: 'AJ', avatarColor: 'bg-blue-600', role: 'Frontend Lead' },
  { name: 'Sarah Chen', initials: 'SC', avatarColor: 'bg-emerald-600', role: 'QA & Security' },
  { name: 'Maria Kim', initials: 'MK', avatarColor: 'bg-sky-600', role: 'Database Engineer' },
  { name: 'David Tran', initials: 'DT', avatarColor: 'bg-indigo-600', role: 'DevOps / SRE' },
  { name: 'Linh Nguyen', initials: 'LN', avatarColor: 'bg-purple-600', role: 'Backend Dev' }
];

interface TaskActionModalProps {
  action: { type: TaskActionType; task: TaskItem } | null;
  ownerOptions: Array<TaskItem['owner']>;
  onClose: () => void;
  onSave: (task: TaskItem, message: string) => void;
}

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  action,
  ownerOptions,
  onClose,
  onSave
}) => {
  const task = action?.task;
  const type = action?.type;
  const [selectedOwner, setSelectedOwner] = useState(task?.owner.name || '');
  const [handoverNote, setHandoverNote] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState(task?.dueDate || '');
  const [dueDateReason, setDueDateReason] = useState('');
  const [commentText, setCommentText] = useState('');
  const [blockerStatus, setBlockerStatus] = useState<'Blocked' | 'At Risk' | 'Overdue'>('Blocked');
  const [blockerReason, setBlockerReason] = useState('');

  useEffect(() => {
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
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors" aria-label="Close action modal">
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
                      <button key={member.name} type="button" onClick={() => setSelectedOwner(member.name)} className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50/60 shadow-xs' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full ${member.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                            {member.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{member.name}</div>
                            <span className="text-[10px] text-slate-500 font-normal">{member.role || 'Sprint member'}</span>
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
                <input type="text" value={handoverNote} onChange={(event) => setHandoverNote(event.target.value)} placeholder="e.g. Please sync with QA before deploy..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
              </div>
            </>
          )}

          {type === 'dueDate' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Preset Due Dates:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 5 days', 'Next Sprint'].map((date) => (
                    <button key={date} type="button" onClick={() => setSelectedDueDate(date)} className={`py-2 px-2.5 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${selectedDueDate === date ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                      {date}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or Custom Due Date:</label>
                <input type="text" value={selectedDueDate} onChange={(event) => setSelectedDueDate(event.target.value)} placeholder="e.g. 28-10-2026" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Extension Reason (Optional):</label>
                <input type="text" value={dueDateReason} onChange={(event) => setDueDateReason(event.target.value)} placeholder="e.g. Blocked on upstream dependency" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
              </div>
            </>
          )}

          {type === 'comment' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">PM Comment & Action Note:</label>
                <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} rows={4} placeholder="Enter comments, blocker updates or mitigation notes for this task..." className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
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
                    <button key={status} type="button" onClick={() => setBlockerStatus(status)} className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${blockerStatus === status ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blocker Reason & Remediation Details:</label>
                <textarea value={blockerReason} onChange={(event) => setBlockerReason(event.target.value)} rows={3} placeholder="Explain why this task is blocked..." className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
          <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer">
            Update Information
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
