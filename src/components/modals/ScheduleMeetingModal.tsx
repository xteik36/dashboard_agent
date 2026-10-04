import React, { useState } from 'react';
import { MeetingItem } from '../../types';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeeting: (meeting: MeetingItem) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onAddMeeting
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Project checkpoint');
  const [dateStr, setDateStr] = useState('Thu, Oct 31');
  const [timeStr, setTimeStr] = useState('10:00 AM – 11:00 AM');
  const [platform, setPlatform] = useState('Microsoft Teams');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting: MeetingItem = {
      id: `meet-${Date.now()}`,
      title: title.trim(),
      type,
      dateStr,
      monthStr: 'Oct',
      timeStr,
      status: 'Confirmed',
      healthStatus: 'On Track',
      platform,
      platformLink: 'https://teams.microsoft.com',
      attendees: [
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
        { num: '01', title: 'Sprint Review & Sync' },
        { num: '02', title: 'Open action items sign-off' }
      ],
      momNotes: {
        summary: 'Scheduled checkpoint.',
        decisions: ['Sign-off confirmed.'],
        transcriptSnippets: []
      },
      actionItems: []
    };

    onAddMeeting(newMeeting);
    onClose();
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Schedule New Meeting</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Architecture Security Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="Project checkpoint">Project checkpoint</option>
                <option value="Executive review">Executive review</option>
                <option value="Vendor checkpoint">Vendor checkpoint</option>
                <option value="Audit & Compliance">Audit &amp; Compliance</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Window</label>
              <input
                type="text"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
