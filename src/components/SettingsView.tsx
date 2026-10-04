import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [userName, setUserName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@enterprise.com');
  const [role, setRole] = useState('Lead Program Manager');
  const [autoApproveRules, setAutoApproveRules] = useState(false);
  const [riskAlertThreshold, setRiskAlertThreshold] = useState('High');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Workspace Settings</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">
          Configure profile attributes, PM review thresholds, and agent notification triggers.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#0f172a]">Program Manager Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1877f2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1877f2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Workspace Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1877f2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Active Project</label>
              <input
                type="text"
                disabled
                value="PMA Agent (Sprint 36)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#e2e8f0] rounded-lg text-[#64748b]"
              />
            </div>
          </div>
        </div>

        {/* AI Agent & Audit Thresholds */}
        <div className="bg-white p-6 rounded-xl border border-[#edf2f7] shadow-xs flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#0f172a]">Autonomous Agent Policies</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] border border-[#edf2f7]">
              <div>
                <div className="text-xs font-bold text-[#0f172a]">Autonomous PM Sign-off</div>
                <div className="text-[11px] text-[#64748b]">
                  Automatically approve standard test reports if AI Audit verification passes with 100% assertions.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoApproveRules}
                onChange={(e) => setAutoApproveRules(e.target.checked)}
                className="w-4 h-4 rounded text-[#1877f2] focus:ring-[#1877f2]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] border border-[#edf2f7]">
              <div>
                <div className="text-xs font-bold text-[#0f172a]">Risk Alert Notification Threshold</div>
                <div className="text-[11px] text-[#64748b]">
                  Trigger urgent notifications when predicted probability exceeds selected tier.
                </div>
              </div>
              <select
                value={riskAlertThreshold}
                onChange={(e) => setRiskAlertThreshold(e.target.value)}
                className="text-xs border border-[#e2e8f0] rounded-lg px-2.5 py-1.5 bg-white text-[#0f172a]"
              >
                <option value="Critical">Critical Only</option>
                <option value="High">High &amp; Critical</option>
                <option value="Medium">Medium &amp; Above</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
