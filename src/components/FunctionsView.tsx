import React, { useEffect, useState } from 'react';
import { AgentFunction, NoteItem } from '../types';
import { INITIAL_FUNCTIONS } from '@/data/appData';

interface FunctionsViewProps {
  functions: AgentFunction[];
  onAddFunction?: () => void;
  onViewLogs?: (func: AgentFunction) => void;
}

export const FunctionsView: React.FC<FunctionsViewProps> = ({
  functions,
  onAddFunction,
  onViewLogs
}) => {
  const displayFunctions = functions.length > 0 ? functions : INITIAL_FUNCTIONS;
  const [selectedFuncId, setSelectedFuncId] = useState(displayFunctions[0]?.id || 'func-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Overview' | 'Tasks' | 'Documents' | 'Note from PM'>('Note from PM');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isPinnedChecked, setIsPinnedChecked] = useState(false);
  const [taggedTask, setTaggedTask] = useState('TSK-1048');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [localFunctions, setLocalFunctions] = useState<AgentFunction[]>(displayFunctions);

  useEffect(() => {
    const nextFunctions = functions.length > 0 ? functions : INITIAL_FUNCTIONS;
    setLocalFunctions(nextFunctions);
    setSelectedFuncId((currentId) => nextFunctions.some((fn) => fn.id === currentId) ? currentId : nextFunctions[0]?.id || 'func-1');
  }, [functions]);

  const selectedFunction = localFunctions.find((f) => f.id === selectedFuncId) || localFunctions[0];

  const filteredFunctions = localFunctions.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedFunction) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      author: 'John Doe (PM)',
      role: 'Program Manager',
      initials: 'JD',
      timestamp: 'Vừa xong',
      content: newNoteContent.trim(),
      linkedTask: taggedTask,
      isPinned: isPinnedChecked,
      replies: []
    };

    setLocalFunctions((prev) =>
      prev.map((f) => {
        if (f.id === selectedFunction.id) {
          const updatedNotes = isPinnedChecked
            ? [newNote, ...f.notes]
            : [...f.notes, newNote];
          return { ...f, notes: updatedNotes };
        }
        return f;
      })
    );

    setNewNoteContent('');
    setIsPinnedChecked(false);
  };

  const handlePostReply = (noteId: string) => {
    if (!replyContent.trim()) return;

    setLocalFunctions((prev) =>
      prev.map((f) => {
        if (f.id === selectedFunction.id) {
          const updatedNotes = f.notes.map((n) => {
            if (n.id === noteId) {
              const currentReplies = n.replies || [];
              return {
                ...n,
                replies: [
                  ...currentReplies,
                  {
                    author: 'John Doe (PM)',
                    role: 'Program Manager',
                    timestamp: 'Vừa xong',
                    content: replyContent.trim()
                  }
                ]
              };
            }
            return n;
          });
          return { ...f, notes: updatedNotes };
        }
        return f;
      })
    );

    setReplyContent('');
    setReplyingNoteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SECTION 1: TOP - FUNCTIONS LIST SECTION */}
      <section className="flex flex-col gap-4">
        {/* Header Title & Date Range / Sprint / Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Functions</h1>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              Create and manage agent functions for your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#0f172a] hover:bg-[#f8fafc] transition-colors shadow-xs text-[13px] font-medium"
            >
              <span className="material-symbols-outlined text-[18px] text-[#94a3b8]">calendar_today</span>
              <span>01/09/2026 – 30/09/2026</span>
              <span className="material-symbols-outlined text-[17px] text-[#94a3b8]">expand_more</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#0f172a] hover:bg-[#f8fafc] transition-colors shadow-xs text-[13px] font-medium"
            >
              <span className="material-symbols-outlined text-[18px] text-[#94a3b8]">flag</span>
              <span>Sprint 36</span>
              <span className="material-symbols-outlined text-[17px] text-[#94a3b8]">expand_more</span>
            </button>

            <button
              type="button"
              onClick={onAddFunction}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg font-semibold text-[13px] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[19px]">add</span>
              <span>New function</span>
            </button>
          </div>
        </div>

        {/* Functions List Container */}
        <div className="bg-white rounded-xl border border-[#edf2f7] shadow-xs overflow-hidden">
          {/* Search bar inside container */}
          <div className="p-4 border-b border-[#f1f5f9]">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search functions..."
                className="w-full pl-10 pr-4 py-2 text-[13px] rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
              />
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-[#f8fafc]">
            {filteredFunctions.map((fn) => {
              const isSelected = fn.id === selectedFunction.id;
              const isOnTrack = fn.status === 'On Track';

              const barColor =
                fn.code === 'DS-2024'
                  ? 'bg-[#1877f2]'
                  : fn.code === 'CC-2024'
                  ? 'bg-[#007d55]'
                  : 'bg-[#d97706]';

              return (
                <div
                  key={fn.id}
                  onClick={() => setSelectedFuncId(fn.id)}
                  className={`p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-[#eff6ff]/50 border-l-4 border-[#1877f2]'
                      : 'bg-white hover:bg-[#f8fafc] border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#64748b] text-[20px] mt-0.5">
                        build
                      </span>
                      <div>
                        <h3 className="text-[14px] font-bold text-[#0f172a]">{fn.name}</h3>
                        <p className="text-[12px] text-[#64748b]">
                          {fn.code} · {fn.totalTasks} tasks
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isOnTrack ? 'bg-[#e6f7ef] text-[#006242]' : 'bg-[#fff4e5] text-[#b45309]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnTrack ? 'bg-[#007d55]' : 'bg-[#d97706]'
                        }`}
                      ></span>
                      {fn.status}
                    </span>
                  </div>

                  <div className="w-full pl-8 pr-2 flex items-center gap-3">
                    <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all`}
                        style={{ width: `${fn.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[12px] font-semibold text-[#0f172a] min-w-[32px] text-right">
                      {fn.progress}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer help indicator */}
          <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between text-[#64748b] text-[12px]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#1877f2]">touch_app</span>
              <span>Chọn function để xem chi tiết bên dưới</span>
            </div>
            <span className="text-[11px] text-[#94a3b8]">
              Showing {filteredFunctions.length} of {localFunctions.length} active agent functions
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: BOTTOM - FUNCTION DETAIL CARD */}
      {selectedFunction && (
        <section className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col gap-5">
            {/* Header with name, status, last run */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1877f2] shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[28px]">sync</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-[#0f172a]">{selectedFunction.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        selectedFunction.status === 'On Track'
                          ? 'bg-[#e6f7ef] text-[#006242]'
                          : 'bg-[#fff4e5] text-[#b45309]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedFunction.status === 'On Track' ? 'bg-[#007d55]' : 'bg-[#d97706]'
                        }`}
                      ></span>
                      {selectedFunction.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#64748b] mt-1 flex-wrap">
                    <span className="font-semibold text-[#1877f2]">{selectedFunction.code}</span>
                    <span className="text-[#94a3b8]">·</span>
                    <span>Last run: {selectedFunction.lastRun}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <span className="text-[11px] font-semibold text-[#64748b]">Active daemon</span>
                  <div className="w-9 h-5 bg-[#1877f2] rounded-full p-0.5 cursor-pointer flex items-center justify-end">
                    <div className="w-4 h-4 bg-white rounded-full shadow-xs"></div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onViewLogs && onViewLogs(selectedFunction)}
                  className="px-3.5 py-1.5 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f172a] rounded-lg text-[12px] font-semibold transition-colors"
                >
                  View Logs
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-6 border-b border-[#f1f5f9] pt-2 -mb-2">
              {(['Overview', 'Tasks', 'Documents', 'Note from PM'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 text-[13px] font-semibold transition-all relative ${
                    activeTab === tab
                      ? 'text-[#1877f2] border-b-2 border-[#1877f2]'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Quick KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col justify-between">
              <span className="text-[13px] font-semibold text-[#64748b]">Overall Progress</span>
              <div className="my-1.5">
                <span className="text-[28px] font-bold text-[#0f172a]">{selectedFunction.progress}%</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                <span>Sprint milestone completion</span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col justify-between">
              <span className="text-[13px] font-semibold text-[#64748b]">Total Tasks</span>
              <div className="my-1.5">
                <span className="text-[28px] font-bold text-[#0f172a]">{selectedFunction.totalTasks}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                <span>
                  {selectedFunction.completedTasks} Done, {selectedFunction.runningTasks} Running,{' '}
                  {selectedFunction.pendingTasks} Pending
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col justify-between">
              <span className="text-[13px] font-semibold text-[#64748b]">Function Owner</span>
              <div className="my-1.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#006591] text-white text-xs flex items-center justify-center font-bold">
                  {selectedFunction.owner.initials}
                </div>
                <span className="text-base font-bold text-[#0f172a]">
                  {selectedFunction.owner.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                <span>{selectedFunction.owner.role}</span>
              </div>
            </div>
          </div>

          {/* Main Content Area based on Active Tab */}
          {activeTab === 'Note from PM' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Note from PM */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[22px] text-[#1877f2]">
                        edit_note
                      </span>
                      <h3 className="text-base font-bold text-[#0f172a]">Note from PM</h3>
                    </div>
                  </div>

                  {/* Form to enter new note */}
                  <form
                    onSubmit={handlePostNote}
                    className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-2.5"
                  >
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="+ Add a note or instruction for this function task..."
                      rows={3}
                      className="w-full bg-transparent text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] resize-none focus:outline-none"
                    ></textarea>

                    <div className="flex items-center justify-between pt-2 border-t border-[#edf2f7] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {/* Tag Task button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowTagSelector(!showTagSelector)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#475569] hover:bg-white rounded-lg transition-colors border border-[#e2e8f0] font-medium"
                          >
                            <span className="material-symbols-outlined text-[15px]">tag</span>
                            <span>{taggedTask ? `Task: ${taggedTask}` : 'Tag Task'}</span>
                          </button>
                          {showTagSelector && (
                            <div className="absolute left-0 mt-1 w-44 bg-white border border-[#edf2f7] rounded-lg shadow-md p-1 z-20 text-xs">
                              {['TSK-1048', 'TSK-1031', 'TSK-1025', 'TSK-1019'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => {
                                    setTaggedTask(t);
                                    setShowTagSelector(false);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-700"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pin to top toggle button */}
                        <button
                          type="button"
                          onClick={() => setIsPinnedChecked(!isPinnedChecked)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg transition-colors border ${
                            isPinnedChecked
                              ? 'bg-blue-50 text-[#1877f2] border-blue-200 font-semibold'
                              : 'text-[#475569] hover:bg-white border-[#e2e8f0] font-medium'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">push_pin</span>
                          <span>{isPinnedChecked ? 'Pinned' : 'Pin to Top'}</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!newNoteContent.trim()}
                        className="px-4 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 text-white rounded-lg font-semibold text-[13px] transition-all shadow-xs"
                      >
                        Post Note
                      </button>
                    </div>
                  </form>

                  {/* List of notes */}
                  <div className="flex flex-col gap-3">
                    {selectedFunction.notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-xl border flex flex-col gap-2 shadow-xs transition-colors ${
                          note.isPinned
                            ? 'bg-white border-[#cbd5e1]/80 ring-1 ring-blue-100'
                            : 'bg-white border-[#e2e8f0]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-xs select-none">
                              {note.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-semibold text-[#0f172a]">
                                {note.author}
                              </span>
                              <span className="text-[11px] text-[#94a3b8]">{note.timestamp}</span>
                            </div>
                          </div>
                          {note.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1877f2] bg-[#eff6ff] px-2 py-0.5 rounded">
                              <span className="material-symbols-outlined text-[13px]">push_pin</span>
                              Pinned
                            </span>
                          )}
                        </div>

                        <p className="text-[13px] text-[#0f172a] leading-relaxed mt-1">
                          {note.content}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#f8fafc]">
                          {note.linkedTask ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#eff6ff] text-[#1877f2] font-medium text-[11px]">
                              <span className="material-symbols-outlined text-[13px]">link</span>
                              Liên kết task: {note.linkedTask}
                            </span>
                          ) : (
                            <span></span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingNoteId(replyingNoteId === note.id ? null : note.id)
                            }
                            className="text-[#64748b] hover:text-[#1877f2] text-[12px] font-semibold"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Inline replies */}
                        {note.replies && note.replies.length > 0 && (
                          <div className="ml-4 pl-3 border-l-2 border-[#e2e8f0] space-y-2 mt-2 pt-1">
                            {note.replies.map((rep, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-bold text-[#0f172a]">{rep.author}: </span>
                                <span className="text-[#334155]">{rep.content}</span>
                                <span className="text-[10px] text-[#94a3b8] ml-2">({rep.timestamp})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply box */}
                        {replyingNoteId === note.id && (
                          <div className="mt-2 pt-2 border-t border-[#f1f5f9] flex gap-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-xs focus:outline-none focus:border-[#1877f2]"
                            />
                            <button
                              type="button"
                              onClick={() => handlePostReply(note.id)}
                              className="px-3 py-1.5 bg-[#1877f2] text-white rounded-lg text-xs font-semibold"
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Execution Timeline */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#1877f2]">
                        history
                      </span>
                      <h3 className="text-base font-bold text-[#0f172a]">Execution Timeline</h3>
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#edf2f7]">
                    {selectedFunction.timeline.map((step, idx) => {
                      const dotColor =
                        step.status === 'Completed'
                          ? 'bg-[#007d55]'
                          : step.status === 'In Progress'
                          ? 'bg-[#1877f2]'
                          : 'bg-[#94a3b8]';

                      const statusColor =
                        step.status === 'Completed'
                          ? 'text-[#006242]'
                          : step.status === 'In Progress'
                          ? 'text-[#1877f2]'
                          : 'text-[#64748b]';

                      return (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ${dotColor} ring-4 ring-white`}
                          ></div>
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-semibold text-[#0f172a]">
                                {step.title}
                              </span>
                              <span className={`text-[11px] font-semibold ${statusColor}`}>
                                {step.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#94a3b8]">
                              {step.date} · {step.version}
                            </span>
                            <p className="text-[12px] text-[#64748b] mt-1">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-[#f8fafc] rounded-lg mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#64748b]">Real-time worker daemon sync</span>
                    <button
                      type="button"
                      onClick={() => onViewLogs && onViewLogs(selectedFunction)}
                      className="text-[12px] font-semibold text-[#1877f2] hover:underline"
                    >
                      View full log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Overview' && (
            <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs">
              <h3 className="text-base font-bold text-[#0f172a] mb-2">Agent Function Architecture</h3>
              <p className="text-[13px] text-[#475569] leading-relaxed mb-4">
                {selectedFunction.overview}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#edf2f7]">
                  <div className="text-xs font-bold text-[#0f172a] mb-1">Trigger Cadence</div>
                  <div className="text-xs text-[#64748b]">Every 15 minutes + Webhook on upstream commit</div>
                </div>
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#edf2f7]">
                  <div className="text-xs font-bold text-[#0f172a] mb-1">Assigned Cluster</div>
                  <div className="text-xs text-[#64748b]">production-agent-zone-asia-se1</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Tasks' && (
            <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0f172a]">Managed Tasks</h3>
                <span className="text-xs text-[#64748b]">{selectedFunction.totalTasks} total tasks tracked</span>
              </div>
              <div className="divide-y divide-[#f8fafc] text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-[#0f172a]">TSK-1048: API Integration & Gateway Service</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Running</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-[#0f172a]">TSK-1031: Security Assessment Report</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">Pending Review</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-[#0f172a]">TSK-0994: Core Sync Pipeline with ERP Connector Baseline</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Done</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs">
              <h3 className="text-base font-bold text-[#0f172a] mb-3">Linked Audit Documents</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 border border-[#edf2f7] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#1877f2]">description</span>
                    <span className="font-semibold text-[#0f172a]">Security Assessment – Data Sync Agent</span>
                  </div>
                  <span className="text-[#059669] font-semibold">AI Passed · PM Approved</span>
                </div>
                <div className="p-3 border border-[#edf2f7] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#1877f2]">description</span>
                    <span className="font-semibold text-[#0f172a]">Data Sync Agent Test Report</span>
                  </div>
                  <span className="text-[#059669] font-semibold">AI Passed · PM Approved</span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
