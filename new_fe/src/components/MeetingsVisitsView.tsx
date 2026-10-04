import React, { useState } from 'react';
import { MEETINGS_DATA } from '../data/mockData';
import { MeetingItem } from '../types';
import { ScheduleMeetingModal } from './Modals';

export const MeetingsVisitsView: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingItem[]>(MEETINGS_DATA);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meet-1');
  const [activeTab, setActiveTab] = useState<'details' | 'mom' | 'actions'>('details');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [newActionItem, setNewActionItem] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeMeeting =
    meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const handleToggleAction = (actionId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === activeMeeting.id && m.actionItems) {
          return {
            ...m,
            actionItems: m.actionItems.map((act) =>
              act.id === actionId ? { ...act, completed: !act.completed } : act
            ),
          };
        }
        return m;
      })
    );
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionItem.trim()) return;

    const newItem = {
      id: `act-${Date.now()}`,
      task: newActionItem.trim(),
      assignee: 'John Doe',
      completed: false,
    };

    setMeetings((prev) =>
      prev.map((m) =>
        m.id === activeMeeting.id
          ? { ...m, actionItems: [...(m.actionItems || []), newItem] }
          : m
      )
    );
    setNewActionItem('');
    showToast('Đã thêm Action Item mới cho cuộc họp');
  };

  const handleScheduleNew = (newM: any) => {
    const created: MeetingItem = {
      id: `meet-${Date.now()}`,
      title: newM.title,
      category: 'Project checkpoint',
      date: newM.date,
      month: 'Oct',
      time: newM.time,
      platform: newM.platform,
      status: 'Confirmed',
      health: 'On Track',
      attendees: [
        { name: 'John Doe', initials: 'JD', role: 'Meeting organizer', avatarBg: 'bg-blue-100 text-blue-600 border border-blue-200' },
      ],
      agenda: [
        { step: '01', topic: 'Project status and milestones' },
        { step: '02', topic: 'Open issues and blocker mitigation' },
      ],
      momNotes: ['Meeting scheduled.'],
      actionItems: [],
    };

    setMeetings([created, ...meetings]);
    setSelectedMeetingId(created.id);
    showToast(`Cuộc họp "${created.title}" đã được lên lịch`);
  };

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

      {/* Header Action Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Meetings & Visits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate meetings, visits, and action items across your projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-slate-500">
              calendar_today
            </span>
            <span>01/10/2024 – 31/10/2024</span>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Schedule meeting</span>
          </button>
        </div>
      </div>

      {/* Master-Detail Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upcoming Meetings List (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Upcoming meetings</h2>
            <span className="text-xs text-slate-400 font-medium">
              {meetings.length} sessions
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {meetings.map((item) => {
              const isSelected = item.id === activeMeeting.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMeetingId(item.id)}
                  className={`flex items-start gap-3.5 p-4.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/40 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  {/* Date Badge Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span className="text-[9px] font-bold uppercase tracking-tight mt-0.5 leading-none">
                      {item.month}
                    </span>
                  </div>

                  {/* Meeting Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {item.date} · {item.time}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                          item.status === 'Confirmed'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.platform}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {meetings.length} upcoming sessions</span>
            <button
              onClick={() => showToast('Archived sessions loaded')}
              className="text-blue-600 font-semibold hover:underline"
            >
              View archive
            </button>
          </div>
        </section>

        {/* Right: Detailed Meeting View (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col">
          {/* Detail Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {activeMeeting.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeMeeting.title}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    schedule
                  </span>
                  <span>{activeMeeting.date} · {activeMeeting.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                  <span className="material-symbols-outlined text-[16px]">video_call</span>
                  <span>{activeMeeting.platform}</span>
                </div>
              </div>
            </div>

            {/* Health Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-[#eafaf1] text-[#0e7040] border border-[#c3f0d4] flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#0e7040]"></span>
              <span className="text-xs font-bold">{activeMeeting.health}</span>
            </div>
          </div>

          {/* Underlined Tab Navigation */}
          <div className="border-b border-slate-200 mt-2 mb-6">
            <nav className="flex space-x-8 -mb-px text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2.5 border-b-2 font-bold transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Meeting details
              </button>
              <button
                onClick={() => setActiveTab('mom')}
                className={`py-2.5 border-b-2 font-bold transition-colors ${
                  activeTab === 'mom'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                MOM viewer
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`py-2.5 border-b-2 font-bold transition-colors ${
                  activeTab === 'actions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Action items ({activeMeeting.actionItems?.length || 0})
              </button>
            </nav>
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              {/* Attendees */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Attendees ({activeMeeting.attendees.length})
                </h3>
                <div className="space-y-3">
                  {activeMeeting.attendees.map((attendee, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${attendee.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}
                      >
                        {attendee.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-none">
                          {attendee.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">{attendee.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agenda */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Agenda
                </h3>
                <ol className="space-y-3">
                  {activeMeeting.agenda.map((item, idx) => (
                    <li key={idx} className="flex items-baseline gap-3 text-xs">
                      <span className="font-bold text-blue-600 font-mono text-xs w-5 shrink-0">
                        {item.step}
                      </span>
                      <span className="text-slate-700 font-medium leading-relaxed">
                        {item.topic}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: MOM VIEWER */}
          {activeTab === 'mom' && (
            <div className="space-y-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900">
                  Minutes of Meeting (MOM) Summary:
                </h4>
                {activeMeeting.momNotes && activeMeeting.momNotes.length > 0 ? (
                  <ul className="space-y-2 text-slate-700">
                    {activeMeeting.momNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span className="leading-relaxed">{note}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">
                    Chưa có biên bản họp nào được ghi lại cho phiên này.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTION ITEMS */}
          {activeTab === 'actions' && (
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                {activeMeeting.actionItems && activeMeeting.actionItems.length > 0 ? (
                  activeMeeting.actionItems.map((act) => (
                    <label
                      key={act.id}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={act.completed}
                        onChange={() => handleToggleAction(act.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                      />
                      <div className="flex-1">
                        <span
                          className={`font-medium ${
                            act.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {act.task}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Assignee: {act.assignee}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Chưa có action item nào.</p>
                )}
              </div>

              {/* Add Action Item form */}
              <form onSubmit={handleAddAction} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  placeholder="+ Add new action item..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Synchronized with calendar hub</span>
            <button
              onClick={() => showToast('Opening meeting in external calendar')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Add to Google Calendar ↗
            </button>
          </div>
        </section>
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSchedule={handleScheduleNew}
      />
    </div>
  );
};
