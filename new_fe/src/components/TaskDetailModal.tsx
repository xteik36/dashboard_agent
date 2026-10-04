import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onBackToCriticalRisks?: () => void;
  onUpdateTask?: (updatedTask: TaskItem) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  task,
  onClose,
  onBackToCriticalRisks,
  onUpdateTask,
}) => {
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(task);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Action Sub-States
  const [activeActionModal, setActiveActionModal] = useState<
    'none' | 'reassign' | 'dueDate' | 'comment'
  >('none');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    setCurrentTask(task);
    setActiveActionModal('none');
    setCommentText('');
  }, [task]);

  if (!isOpen || !currentTask) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!currentTask) return;
    const updatedSubtasks = currentTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const completedCount = updatedSubtasks.filter((s) => s.completed).length;
    const newProgress =
      updatedSubtasks.length > 0
        ? Math.round((completedCount / updatedSubtasks.length) * 100)
        : 100;

    const updated = {
      ...currentTask,
      subtasks: updatedSubtasks,
      progress: newProgress,
    };
    setCurrentTask(updated);
    onUpdateTask?.(updated);
  };

  const handleReassign = (name: string, initials: string, avatarBg: string) => {
    if (!currentTask) return;
    const updated = {
      ...currentTask,
      owner: { name, initials, avatarBg },
    };
    setCurrentTask(updated);
    onUpdateTask?.(updated);
    setActiveActionModal('none');
    showToast(`Reassigned to ${name}`);
  };

  const handleUpdateDueDate = (newDate: string) => {
    if (!currentTask) return;
    const updated = {
      ...currentTask,
      dueDate: newDate,
    };
    setCurrentTask(updated);
    onUpdateTask?.(updated);
    setActiveActionModal('none');
    showToast(`Due date updated to ${newDate}`);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    showToast(`Comment added: "${commentText.trim().slice(0, 30)}..."`);
    setCommentText('');
    setActiveActionModal('none');
  };

  const handleToggleBlocked = () => {
    if (!currentTask) return;
    const isNowBlocked = currentTask.status !== 'Blocked';
    const updated: TaskItem = {
      ...currentTask,
      status: isNowBlocked ? 'Blocked' : 'In Progress',
    };
    setCurrentTask(updated);
    onUpdateTask?.(updated);
    showToast(isNowBlocked ? `Task marked as Blocked` : `Task resumed to In Progress`);
  };

  const handleUpdateStatus = () => {
    showToast(`Status for ${currentTask.id} updated successfully!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const completedSubtasksCount = currentTask.subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header with Navigation and Close */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            {onBackToCriticalRisks && (
              <button
                onClick={onBackToCriticalRisks}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-2 py-1 rounded-lg transition-colors mr-1 shadow-2xs"
                title="Quay lại danh sách Critical Risks"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                <span>DS Risks</span>
              </button>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                currentTask.priority === 'Critical'
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : currentTask.priority === 'High'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {currentTask.priority}
            </span>
            <span className="text-xs font-bold text-slate-800">{currentTask.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
              {currentTask.sprint}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(92vh-130px)]">
          {/* Title & Subtitle */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {currentTask.title}
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {currentTask.project} • {currentTask.sprint}
            </p>
          </div>

          {/* Metadata Properties */}
          <div className="space-y-2.5 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            {/* Owner */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                Owner
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full ${currentTask.owner.avatarBg} text-white font-bold text-[9px] flex items-center justify-center`}
                >
                  {currentTask.owner.initials}
                </div>
                <span className="text-slate-800 font-semibold">{currentTask.owner.name}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-slate-400">flag</span>
                Priority
              </span>
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {currentTask.priority}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-slate-400">check_circle</span>
                Status
              </span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  currentTask.status === 'Overdue' || currentTask.status === 'Blocked'
                    ? 'text-rose-600'
                    : currentTask.status === 'At Risk'
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentTask.status === 'Overdue' || currentTask.status === 'Blocked'
                      ? 'bg-rose-500'
                      : currentTask.status === 'At Risk'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                ></span>
                {currentTask.status}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-slate-400">trending_up</span>
                Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-bold text-xs">{currentTask.progress}%</span>
                <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${currentTask.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                Due Date
              </span>
              <span
                className={`font-semibold ${
                  currentTask.dueDate === 'Today' || currentTask.dueDate.includes('Overdue')
                    ? 'text-rose-600'
                    : 'text-slate-700'
                }`}
              >
                {currentTask.dueDate}
              </span>
            </div>

          </div>

          {/* Recommended Actions Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
              <span>Recommended Actions</span>
              <span className="text-[10px] font-normal text-slate-400">Click to execute</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() =>
                  setActiveActionModal(activeActionModal === 'reassign' ? 'none' : 'reassign')
                }
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-slate-700 font-medium text-[11px] justify-start shadow-2xs transition-colors cursor-pointer ${
                  activeActionModal === 'reassign'
                    ? 'border-blue-500 bg-blue-50/60 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-blue-500">
                  person_add
                </span>
                Reassign Owner
              </button>

              <button
                onClick={() =>
                  setActiveActionModal(activeActionModal === 'dueDate' ? 'none' : 'dueDate')
                }
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-slate-700 font-medium text-[11px] justify-start shadow-2xs transition-colors cursor-pointer ${
                  activeActionModal === 'dueDate'
                    ? 'border-blue-500 bg-blue-50/60 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-blue-500">
                  edit_calendar
                </span>
                Update Due Date
              </button>

              <button
                onClick={() =>
                  setActiveActionModal(activeActionModal === 'comment' ? 'none' : 'comment')
                }
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-slate-700 font-medium text-[11px] justify-start shadow-2xs transition-colors cursor-pointer ${
                  activeActionModal === 'comment'
                    ? 'border-blue-500 bg-blue-50/60 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-blue-500">
                  chat_bubble
                </span>
                Add Comment
              </button>

              <button
                onClick={handleToggleBlocked}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border font-medium text-[11px] justify-start shadow-2xs transition-colors cursor-pointer ${
                  currentTask.status === 'Blocked'
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-200 hover:bg-rose-50/50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-rose-500">
                  {currentTask.status === 'Blocked' ? 'play_arrow' : 'block'}
                </span>
                {currentTask.status === 'Blocked' ? 'Unblock Task' : 'Mark as Blocked'}
              </button>
            </div>

            {/* Quick action popover drawers */}
            {activeActionModal === 'reassign' && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  Select new owner:
                </span>
                {[
                  { name: 'Alex Johnson', initials: 'AJ', bg: 'bg-blue-600' },
                  { name: 'Sarah Chen', initials: 'SC', bg: 'bg-emerald-600' },
                  { name: 'Maria Kim', initials: 'MK', bg: 'bg-sky-600' },
                  { name: 'David Tran', initials: 'DT', bg: 'bg-indigo-600' },
                  { name: 'Linh Nguyen', initials: 'LN', bg: 'bg-purple-600' },
                ].map((member) => (
                  <button
                    key={member.name}
                    onClick={() => handleReassign(member.name, member.initials, member.bg)}
                    className="w-full flex items-center justify-between p-1.5 hover:bg-white rounded-md text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full ${member.bg} text-white font-bold text-[9px] flex items-center justify-center`}
                      >
                        {member.initials}
                      </div>
                      <span className="font-medium text-slate-800">{member.name}</span>
                    </div>
                    {currentTask.owner.name === member.name && (
                      <span className="text-[10px] text-blue-600 font-bold">Current</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeActionModal === 'dueDate' && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  Select due date:
                </span>
                {['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'Next Sprint'].map((date) => (
                  <button
                    key={date}
                    onClick={() => handleUpdateDueDate(date)}
                    className="w-full flex items-center justify-between p-1.5 hover:bg-white rounded-md text-left transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-slate-800">{date}</span>
                    {currentTask.dueDate === date && (
                      <span className="text-[10px] text-blue-600 font-bold">Current</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeActionModal === 'comment' && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 text-xs">
                <span className="font-semibold text-slate-700 block">Add task comment:</span>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type note or blocker update here..."
                  rows={2}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setActiveActionModal('none')}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleUpdateStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Update Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
