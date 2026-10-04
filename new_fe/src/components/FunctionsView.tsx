import React, { useState } from 'react';
import { FUNCTIONS_DATA } from '../data/mockData';
import { FunctionItem } from '../types';

export const FunctionsView: React.FC = () => {
  const [functions, setFunctions] = useState<FunctionItem[]>(FUNCTIONS_DATA);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>('DS-2024');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'docs' | 'notes'>('notes');
  const [newNoteText, setNewNoteText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeFunction =
    functions.find((f) => f.id === selectedFunctionId) || functions[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `fn-note-${Date.now()}`,
      author: 'John Doe',
      authorRole: 'PM',
      time: 'Vừa xong',
      pinned: isPinned,
      linkedTaskId: 'TSK-1048',
      content: newNoteText.trim(),
    };

    setFunctions((prev) =>
      prev.map((f) =>
        f.id === activeFunction.id ? { ...f, notes: [newNote, ...f.notes] } : f
      )
    );

    setNewNoteText('');
    setIsPinned(false);
    showToast('Đã đăng ghi chú PM mới');
  };

  const handleRunFunction = () => {
    showToast(`Triggered execution run for ${activeFunction.name}`);
  };

  const filteredFunctions = functions.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.owner.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Functions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage agent functions for your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              calendar_today
            </span>
            <span>01/09/2026 – 30/09/2026</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-slate-400">flag</span>
            <span>Sprint 36</span>
          </div>
          <button
            onClick={() => showToast('Mở cửa sổ tạo Agent Function mới')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New function</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Functions List Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search */}
        <div className="p-3.5 border-b border-slate-100">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search functions by name or code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Function Items List */}
        <div className="divide-y divide-slate-100">
          {filteredFunctions.map((fn) => {
            const isSelected = activeFunction.id === fn.id;
            return (
              <div
                key={fn.id}
                onClick={() => setSelectedFunctionId(fn.id)}
                className={`p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-blue-50/40 border-l-4 border-blue-600'
                    : 'hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] mt-0.5 ${
                        isSelected ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      build
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {fn.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fn.id} · {fn.taskCount} tasks
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      fn.status === 'On Track'
                        ? 'bg-[#e6f7ef] text-[#006242]'
                        : 'bg-[#fff4e5] text-[#b45309]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        fn.status === 'On Track' ? 'bg-[#007d55]' : 'bg-[#d97706]'
                      }`}
                    ></span>
                    {fn.status}
                  </span>
                </div>

                <div className="w-full pl-8 pr-2 flex items-center gap-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fn.status === 'On Track' ? 'bg-blue-600' : 'bg-[#d97706]'
                      }`}
                      style={{ width: `${fn.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-800 min-w-[32px] text-right">
                    {fn.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600">
              touch_app
            </span>
            <span>Chọn function để xem chi tiết bên dưới</span>
          </div>
          <span>Showing {filteredFunctions.length} of {functions.length} active agent functions</span>
        </div>
      </div>

      {/* SECTION 2: FUNCTION DETAIL (for active function) */}
      <section className="space-y-4 pt-2">
        {/* Function Detail Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[28px]">sync</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">{activeFunction.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      activeFunction.status === 'On Track'
                        ? 'bg-[#e6f7ef] text-[#006242]'
                        : 'bg-[#fff4e5] text-[#b45309]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeFunction.status === 'On Track' ? 'bg-[#007d55]' : 'bg-[#d97706]'
                      }`}
                    ></span>
                    {activeFunction.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="font-semibold text-blue-600">{activeFunction.id}</span>
                  <span>·</span>
                  <span>Last run: {activeFunction.lastRun}</span>
                  <span>·</span>
                  <span>Owner: {activeFunction.owner.name} ({activeFunction.owner.role})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRunFunction}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Run Trigger</span>
              </button>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold pt-1 -mb-5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-3 transition-colors ${
                activeTab === 'tasks'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tasks ({activeFunction.taskCount})
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`pb-3 transition-colors ${
                activeTab === 'docs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 transition-colors ${
                activeTab === 'notes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Note from PM ({activeFunction.notes.length})
            </button>
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Progress</span>
            <div className="my-2">
              <span className="text-3xl font-bold text-slate-900">
                {activeFunction.progress}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Sprint milestone completion</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
            <div className="my-2">
              <span className="text-3xl font-bold text-slate-900">
                {activeFunction.taskCount}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {activeFunction.doneTasks} Done, {activeFunction.runningTasks} Running,{' '}
              {activeFunction.pendingTasks} Pending
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Function Owner</span>
            <div className="my-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                {activeFunction.owner.initials}
              </div>
              <span className="font-bold text-sm text-slate-900">
                {activeFunction.owner.name}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{activeFunction.owner.role}</span>
          </div>
        </div>

        {/* Two Columns: Note from PM (8 cols) & Execution Timeline (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Note from PM */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">
                  edit_note
                </span>
                <h3 className="font-bold text-base text-slate-900">Note from PM</h3>
              </div>
            </div>

            {/* Note Input Box */}
            <form onSubmit={handleAddNote} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="+ Add a note or instruction for this function task..."
                rows={3}
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                      isPinned
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'text-slate-600 hover:bg-slate-200/60 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">push_pin</span>
                    <span>Pin to Top</span>
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Post Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {activeFunction.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                        JD
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-900">
                          {note.author} ({note.authorRole})
                        </span>
                        <span className="text-[10px] text-slate-400">{note.time}</span>
                      </div>
                    </div>
                    {note.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        <span className="material-symbols-outlined text-[13px]">push_pin</span>
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed mt-1">
                    {note.content}
                  </p>
                  {note.linkedTaskId && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-blue-600 font-semibold text-[10px]">
                        <span className="material-symbols-outlined text-[13px]">link</span>
                        Liên kết task: {note.linkedTaskId}
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast('Đang mở luồng phản hồi note...')}
                        className="text-slate-400 hover:text-slate-600 text-[11px] font-medium"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Execution Timeline */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">
                  history
                </span>
                <h3 className="font-bold text-base text-slate-900">Execution Timeline</h3>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeFunction.timeline.map((item) => (
                <div key={item.id} className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                      item.status === 'Completed'
                        ? 'bg-emerald-500'
                        : item.status === 'In Progress'
                        ? 'bg-blue-600'
                        : 'bg-slate-300'
                    }`}
                  ></div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{item.title}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          item.status === 'Completed'
                            ? 'text-emerald-700'
                            : item.status === 'In Progress'
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {item.date} · {item.version}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total 3 releases recorded</span>
              <button
                onClick={() => showToast('Full execution logs exported')}
                className="text-blue-600 font-semibold hover:underline"
              >
                View full log
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
