import React, { useState } from 'react';
import { AuditDocument } from '../../types';

interface UploadAuditDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoc: (doc: AuditDocument) => void;
}

export const UploadAuditDocModal: React.FC<UploadAuditDocModalProps> = ({
  isOpen,
  onClose,
  onAddDoc
}) => {
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<'Phase 1' | 'Phase 2' | 'Phase 3'>('Phase 1');
  const [docType, setDocType] = useState('Compliance Checklist');
  const [ownerName, setOwnerName] = useState('Sarah Chen');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const initials = ownerName
      .split(' ')
      .map((n) => n[0])
      .join('');

    const newDoc: AuditDocument = {
      id: `doc-${Date.now()}`,
      phase,
      title: title.trim(),
      docType,
      owner: {
        name: ownerName,
        initials,
        avatarBg: 'bg-[#004ac6]'
      },
      reviewer: {
        name: 'John Doe',
        initials: 'JD',
        avatarBg: 'bg-[#1877f2]'
      },
      aiAuditStatus: 'In Progress',
      aiAuditDetails: 'Autonomous compliance audit started.',
      pmReviewStatus: 'Pending',
      sprint: 'S36',
      lastUpdated: 'Just now'
    };

    onAddDoc(newDoc);
    onClose();
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Upload Audit Document</h2>
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
            <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Infrastructure Penetration Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Milestone Phase</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard / Doc Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="Compliance Checklist">Compliance Checklist</option>
                <option value="Security Review">Security Review</option>
                <option value="Architecture Review">Architecture Review</option>
                <option value="Test Report">Test Report</option>
                <option value="Operational Plan">Operational Plan</option>
                <option value="Technical Spec">Technical Spec</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Prepared By (Owner)</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[26px] text-slate-400">upload_file</span>
            <p className="font-semibold text-slate-700 mt-1">Click to attach file or drag &amp; drop</p>
            <p className="text-[10px] text-slate-400">PDF, DOCX, Markdown, or JSON spec (Max 25MB)</p>
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
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-lg font-semibold shadow-xs"
            >
              Upload &amp; Trigger AI Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
