import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('PMA Agent');
  const [sprintLength, setSprintLength] = useState('2 weeks');
  const [autoApproveAi, setAutoApproveAi] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Cài đặt Workspace đã được lưu thành công');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure project parameters, audit criteria, notifications, and team roles.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Card 1: Workspace Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-[20px] text-blue-600">tune</span>
            <h2 className="text-sm font-bold text-slate-900">General Workspace Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Sprint Duration</label>
              <select
                value={sprintLength}
                onChange={(e) => setSprintLength(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
              >
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="3 weeks">3 weeks</option>
                <option value="1 month">1 month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Risk & Audit Governance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-[20px] text-blue-600">verified_user</span>
            <h2 className="text-sm font-bold text-slate-900">Risk & Audit Governance</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">Auto-Pass AI Verified Documents</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically mark documents as passed when agent audit score equals 100%
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoApproveAi}
                onChange={(e) => setAutoApproveAi(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">Slack & Teams Risk Alerts</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Broadcast instant notifications to #pma-alerts when risk score exceeds 15
                </p>
              </div>
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={(e) => setSlackAlerts(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">Daily PM Morning Digest</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Send morning summary of overdue tasks, sprint delivery rate, and audit pending items
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Card 3: Team Roster */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-[20px] text-blue-600">groups</span>
            <h2 className="text-sm font-bold text-slate-900">Workspace Members & Permissions</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { name: 'John Doe', role: 'PM Lead / Workspace Owner', initials: 'JD', bg: 'bg-blue-600' },
              { name: 'Sarah Chen', role: 'Lead Agent Architect', initials: 'SC', bg: 'bg-emerald-600' },
              { name: 'Alex Johnson', role: 'Platform Dev Lead', initials: 'AJ', bg: 'bg-blue-600' },
              { name: 'Maria Kim', role: 'Compliance Lead', initials: 'MK', bg: 'bg-sky-600' },
              { name: 'David Tran', role: 'DevOps / SRE', initials: 'DT', bg: 'bg-indigo-600' },
              { name: 'Linh Nguyen', role: 'QA & Security', initials: 'LN', bg: 'bg-purple-600' },
            ].map((member, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full ${member.bg} text-white font-bold text-[10px] flex items-center justify-center`}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">{member.name}</span>
                    <span className="text-[11px] text-slate-400">{member.role}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
