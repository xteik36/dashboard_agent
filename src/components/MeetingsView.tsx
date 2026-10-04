import React, { useEffect, useState } from 'react';
import { MeetingItem } from '../types';
import { INITIAL_MEETINGS } from '@/data/appData';

interface MeetingsViewProps {
  meetings: MeetingItem[];
  onScheduleMeeting: () => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings,
  onScheduleMeeting
}) => {
  const displayMeetings = meetings.length > 0 ? meetings : INITIAL_MEETINGS;
  const [selectedMeetingId, setSelectedMeetingId] = useState(displayMeetings[0]?.id || 'meet-1');
  const [activeTab, setActiveTab] = useState<'Meeting details' | 'MOM viewer' | 'Action items'>('Meeting details');
  const [localMeetings, setLocalMeetings] = useState<MeetingItem[]>(displayMeetings);
  const [dateRange, setDateRange] = useState('01/10/2024 – 31/10/2024');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedMeeting = localMeetings.find((m) => m.id === selectedMeetingId) || localMeetings[0];

  useEffect(() => {
    const nextMeetings = meetings.length > 0 ? meetings : INITIAL_MEETINGS;
    setLocalMeetings(nextMeetings);
    setSelectedMeetingId((currentId) =>
      nextMeetings.some((meeting) => meeting.id === currentId) ? currentId : nextMeetings[0]?.id || 'meet-1'
    );
  }, [meetings]);

  const handleToggleActionItem = (meetingId: string, actionId: string) => {
    setLocalMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            actionItems: m.actionItems.map((act) =>
              act.id === actionId ? { ...act, completed: !act.completed } : act
            )
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Action Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Meetings &amp; Visits</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Coordinate meetings, visits, and action items across your projects.
          </p>
        </div>

        {/* Date Filter & Schedule Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#e2e8f0] hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span>{dateRange}</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#edf2f7] rounded-xl shadow-lg p-2 z-30 text-xs">
                {['01/10/2024 – 31/10/2024', '01/11/2024 – 30/11/2024', 'Next 30 Days', 'All Upcoming'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setDateRange(range);
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      dateRange === range ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onScheduleMeeting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs shadow-blue-600/20 transition duration-150 ease-in-out active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Schedule meeting
          </button>
        </div>
      </div>

      {/* Master-Detail Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Meetings (Master list) */}
        <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base tracking-tight">Upcoming meetings</h2>
            <button
              aria-label="More list options"
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                ></path>
              </svg>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {localMeetings.map((meet) => {
              const isSelected = meet.id === selectedMeeting.id;
              const isPending = meet.status === 'Pending';

              return (
                <div
                  key={meet.id}
                  onClick={() => setSelectedMeetingId(meet.id)}
                  className={`relative flex items-start gap-4 p-4.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/40 border-l-4 border-blue-600'
                      : 'bg-white hover:bg-slate-50/80 border-l-4 border-transparent'
                  }`}
                >
                  {/* Date Badge Icon */}
                  <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0 text-blue-600 shadow-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-tight mt-0.5 leading-none">
                      {meet.monthStr}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                      {meet.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {meet.dateStr} · {meet.timeStr.split('–')[0]?.trim()}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                            : 'bg-slate-100 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        {meet.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {localMeetings.length} upcoming sessions</span>
            <button type="button" className="text-blue-600 font-semibold hover:underline">
              View archive
            </button>
          </div>
        </section>

        {/* Right Column: Detailed Meeting View */}
        {selectedMeeting && (
          <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-7 flex flex-col relative">
            {/* Detail Header with Badge */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {selectedMeeting.type}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {selectedMeeting.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600">
                  {/* Date & Time info */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span>
                      {selectedMeeting.dateStr} · {selectedMeeting.timeStr}
                    </span>
                  </div>

                  {/* Platform Link */}
                  <a
                    href={selectedMeeting.platformLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.5 4h-15A2.5 2.5 0 002 6.5v11A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0019.5 4zm-9 11.5v-7l6 3.5-6 3.5z"></path>
                    </svg>
                    <span>{selectedMeeting.platform}</span>
                  </a>
                </div>
              </div>

              {/* Status Badge: On Track */}
              <div className="shrink-0">
                <div className="px-4 py-2.5 rounded-lg bg-[#eafaf1] text-[#0e7040] border border-[#c3f0d4] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0e7040]"></span>
                  <span className="text-xs font-bold tracking-wide">
                    {selectedMeeting.healthStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 mt-2 mb-6">
              <nav aria-label="Meeting tabs" className="flex space-x-8 -mb-px">
                {(['Meeting details', 'MOM viewer', 'Action items'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-2.5 px-1 border-b-2 text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab 1: Meeting details */}
            {activeTab === 'Meeting details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                {/* Left Section: Attendees */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Attendees</h3>
                  <div className="space-y-4">
                    {selectedMeeting.attendees.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${att.avatarBg} ${att.avatarColor} font-bold text-xs flex items-center justify-center border border-slate-200`}
                        >
                          {att.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-none">
                            {att.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">{att.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Section: Agenda */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Agenda</h3>
                  <ol className="space-y-3">
                    {selectedMeeting.agenda.map((ag, idx) => (
                      <li key={idx} className="flex items-baseline gap-3 text-sm">
                        <span className="font-bold text-blue-600 font-mono text-xs w-5 shrink-0">
                          {ag.num}
                        </span>
                        <div>
                          <div className="text-slate-700 font-medium leading-relaxed">
                            {ag.title}
                          </div>
                          {ag.desc && (
                            <div className="text-xs text-slate-400 mt-0.5">{ag.desc}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 2: MOM Viewer */}
            {activeTab === 'MOM viewer' && (
              <div className="space-y-5 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Executive Summary
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedMeeting.momNotes.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Formal Decisions Recorded
                  </h4>
                  <ul className="space-y-2">
                    {selectedMeeting.momNotes.decisions.map((dec, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    AI Transcript Highlights
                  </h4>
                  <div className="space-y-2">
                    {selectedMeeting.momNotes.transcriptSnippets.map((snip, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg text-xs text-slate-700 italic"
                      >
                        "{snip}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Action Items */}
            {activeTab === 'Action items' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Meeting Action Items ({selectedMeeting.actionItems.filter((a) => a.completed).length}/
                    {selectedMeeting.actionItems.length} completed)
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedMeeting.actionItems.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleActionItem(selectedMeeting.id, act.id)}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={act.completed}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span
                          className={`text-sm ${
                            act.completed
                              ? 'line-through text-slate-400 font-normal'
                              : 'text-slate-800 font-medium'
                          }`}
                        >
                          {act.task}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {act.assignee}
                        </span>
                        <span>Due: {act.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
