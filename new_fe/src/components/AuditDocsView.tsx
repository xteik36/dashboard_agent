import React, { useState } from 'react';
import { MASTER_AUDIT_DOCS } from '../data/mockData';
import { AuditDoc } from '../types';

export const AuditDocsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'phase-breakdown' | 'all-docs'>('phase-breakdown');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('Phase 2 – Development');
  const [selectedSprintFilter, setSelectedSprintFilter] = useState('All open sprints');
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'pending' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [docsList, setDocsList] = useState<AuditDoc[]>(MASTER_AUDIT_DOCS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Document Viewer & PM Review Modal State (matches screenshot exactly)
  const [viewingDoc, setViewingDoc] = useState<AuditDoc | null>(null);
  const [modalPmDecision, setModalPmDecision] = useState<'Completed' | 'Pending' | 'Rework'>('Completed');
  const [modalPmNote, setModalPmNote] = useState('');

  // Card Overview Modal State (for the 4 KPI cards in Standard Audit Package)
  const [cardModalInfo, setCardModalInfo] = useState<{
    title: string;
    subtitle: string;
    category: 'required' | 'created' | 'passed' | 'pending';
    badgeClass: string;
    icon: string;
    iconColor: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Document Viewer directly from any table or card
  const handleOpenDocViewer = (doc: AuditDoc) => {
    setViewingDoc(doc);
    setModalPmDecision(
      doc.pmReview === 'Completed' || doc.pmReview === 'Passed'
        ? 'Completed'
        : doc.pmReview === 'Rework'
        ? 'Rework'
        : 'Pending'
    );
    setModalPmNote(doc.note || '');
  };

  // Save decision from Document Viewer Modal
  const handleSaveDocDecision = () => {
    if (!viewingDoc) return;

    if (modalPmDecision !== 'Completed' && !modalPmNote.trim()) {
      showToast('Please enter a reason / note for Pending or Rework');
      return;
    }

    const updatedDoc: AuditDoc = {
      ...viewingDoc,
      pmReview: modalPmDecision,
      overallStatus:
        modalPmDecision === 'Completed'
          ? 'Audit Passed'
          : modalPmDecision === 'Rework'
          ? 'Rejected / Rework'
          : 'In Progress',
      note: modalPmNote.trim() || undefined,
    };

    setDocsList((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    setViewingDoc(null);
    showToast(
      `Document ${updatedDoc.id} marked as ${
        modalPmDecision === 'Completed'
          ? 'Approved'
          : modalPmDecision === 'Rework'
          ? 'Rejected (Rework)'
          : 'Pending'
      }`
    );
  };

  // Filtered docs for Master Table and Views based on sprint & phase
  const docsInSprintScope = docsList.filter((doc) => {
    if (selectedSprintFilter === 'All open sprints') return true;
    return doc.sprint?.toLowerCase().includes(selectedSprintFilter.toLowerCase());
  });

  // Calculate card counts based on sprint scope
  const requiredDocsList = docsInSprintScope;
  const createdDocsList = docsInSprintScope.filter((d) => d.overallStatus !== 'Missing' && d.createdDate !== '—');
  const passedDocsList = docsInSprintScope.filter(
    (d) => d.overallStatus === 'Audit Passed' || d.pmReview === 'Completed' || d.pmReview === 'Passed'
  );
  const pendingActionDocsList = docsInSprintScope.filter(
    (d) =>
      d.pmReview === 'Pending' ||
      d.pmReview === 'In Progress' ||
      d.pmReview === 'Rework' ||
      d.overallStatus === 'Missing' ||
      d.overallStatus === 'Rejected / Rework' ||
      d.overallStatus === 'In Progress'
  );

  // Docs for Card Modal
  const getCardModalDocs = () => {
    if (!cardModalInfo) return [];
    if (cardModalInfo.category === 'required') return requiredDocsList;
    if (cardModalInfo.category === 'created') return createdDocsList;
    if (cardModalInfo.category === 'passed') return passedDocsList;
    if (cardModalInfo.category === 'pending') return pendingActionDocsList;
    return [];
  };

  // Filtered docs for Phase 2 / current phase table
  const currentPhaseDocs = docsInSprintScope.filter((doc) => {
    const phaseKey = selectedPhaseFilter.split(' – ')[0] || 'Phase 2';
    return doc.phase.toLowerCase().includes(phaseKey.toLowerCase());
  });

  // Master Table Filtered Docs
  const filteredDocs = docsInSprintScope.filter((doc) => {
    if (activeTab === 'ai' && !doc.aiAudit.includes('Passed')) return false;
    if (activeTab === 'pending' && doc.pmReview !== 'Pending' && doc.pmReview !== 'In Progress')
      return false;
    if (activeTab === 'rejected' && doc.pmReview !== 'Rework' && doc.overallStatus !== 'Rejected / Rework')
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q) ||
        doc.standardType.toLowerCase().includes(q) ||
        doc.owner.name.toLowerCase().includes(q) ||
        (doc.sprint && doc.sprint.toLowerCase().includes(q)) ||
        doc.reviewer.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-90 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DOCUMENT VIEWER & PM DECISION MODAL (Matches user image exactly, z-[70] to overlay on top) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                      {viewingDoc.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{viewingDoc.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingDoc.sprint || 'Sprint 36'} • {viewingDoc.phase} • {viewingDoc.standardType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Document Content & Inspector Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* 4-Column Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    OWNER
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full ${viewingDoc.owner.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                      {viewingDoc.owner.initials}
                    </div>
                    <span className="font-semibold text-slate-800 text-xs truncate">{viewingDoc.owner.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    REVIEWER
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full ${viewingDoc.reviewer.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                      {viewingDoc.reviewer.initials}
                    </div>
                    <span className="font-semibold text-slate-800 text-xs truncate">{viewingDoc.reviewer.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    AI AUDIT STATUS
                  </span>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                      viewingDoc.aiAudit.includes('Passed')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : viewingDoc.aiAudit === 'Missing'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {viewingDoc.aiAudit}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    DATE
                  </span>
                  <span className="font-medium text-slate-700 text-xs block">
                    {viewingDoc.createdDate} {viewingDoc.finishDate !== '—' && `→ ${viewingDoc.finishDate}`}
                  </span>
                </div>
              </div>

              {/* Section 1: Document Abstract & Compliance Summary */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">article</span>
                    </div>
                    <span className="font-bold text-slate-900 text-xs">
                      Document Abstract & Compliance Summary
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified Schema v2.1
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  This audit document outlines the required engineering specifications, architectural integrity assertions, and risk containment measures for <strong>{viewingDoc.name}</strong> under <strong>{viewingDoc.sprint || 'Sprint 36'}</strong>. Automated AI static analysis verified compliance with security policies and API contracts.
                </p>
                {viewingDoc.note && (
                  <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg text-amber-900 text-xs flex items-start gap-2 mt-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">info</span>
                    <div>
                      <strong>Current Review Note:</strong> {viewingDoc.note}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: PM Audit Decision & Recommendation */}
              <div className="border border-blue-200/80 bg-blue-50/20 rounded-xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">rate_review</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">
                      PM Audit Decision & Recommendation
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Select one status</span>
                </div>

                {/* 3 PM Decision Toggle Buttons */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalPmDecision('Completed')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      modalPmDecision === 'Completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalPmDecision('Rework')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      modalPmDecision === 'Rework'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Reject (Rework)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalPmDecision('Pending')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      modalPmDecision === 'Pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                    Pending
                  </button>
                </div>

                {/* Reason / PM Note Textarea */}
                <div className="pt-1">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Reason / PM Note {modalPmDecision !== 'Completed' && <span className="text-rose-500">*</span>}
                  </label>
                  <textarea
                    rows={2}
                    value={modalPmNote}
                    onChange={(e) => setModalPmNote(e.target.value)}
                    placeholder={
                      modalPmDecision === 'Completed'
                        ? 'Optional congratulatory note or signoff code...'
                        : modalPmDecision === 'Rework'
                        ? 'Required: Enter reason for rejection and required fixes for owner...'
                        : 'Required: Enter reason why this document is pending review...'
                    }
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Action will update live in audit cycle
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveDocDecision}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Save PM Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD DETAIL MODAL (Displays all docs for any of the 4 Standard Audit Package Cards) */}
      {cardModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cardModalInfo.iconColor}`}>
                  <span className="material-symbols-outlined text-[18px]">{cardModalInfo.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{cardModalInfo.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cardModalInfo.badgeClass}`}>
                      {getCardModalDocs().length} documents
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cardModalInfo.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setCardModalInfo(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Document Table */}
            <div className="p-4 sm:p-5 overflow-y-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 px-2">Document Name</th>
                    <th className="pb-2.5 px-2">Sprint</th>
                    <th className="pb-2.5 px-2">Phase</th>
                    <th className="pb-2.5 px-2">Created Date</th>
                    <th className="pb-2.5 px-2">Owner</th>
                    <th className="pb-2.5 px-2">AI Audit</th>
                    <th className="pb-2.5 px-2">PM Audit</th>
                    <th className="pb-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {getCardModalDocs().map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-2 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">description</span>
                          <span className="font-semibold">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                          {doc.sprint || 'Sprint 36'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 text-[11px]">{doc.phase}</td>
                      <td className="py-2.5 px-2 text-slate-500 text-[11px]">{doc.createdDate}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full ${doc.owner.avatarBg} text-white font-bold text-[8px] flex items-center justify-center`}>
                            {doc.owner.initials}
                          </div>
                          <span className="text-xs text-slate-800 font-medium">{doc.owner.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                          doc.aiAudit.includes('Passed')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.aiAudit === 'Missing'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.aiAudit}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div>
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                            doc.pmReview === 'Completed' || doc.pmReview === 'Passed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.pmReview === 'Rework'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : doc.pmReview === '—'
                              ? 'text-slate-400 border-transparent'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}>
                            {doc.pmReview}
                          </span>
                          {doc.note && <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px]">{doc.note}</p>}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDocViewer(doc)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          View Docs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Total: <strong className="text-slate-800">{getCardModalDocs().length}</strong> documents in this category
              </span>
              <button
                onClick={() => setCardModalInfo(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Sub-view Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Docs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage and track audit documents across your projects, phases and sprint scope.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('phase-breakdown')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'phase-breakdown'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phase Breakdown
            </button>
            <button
              onClick={() => setViewMode('all-docs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'all-docs'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Docs Master Table
            </button>
          </div>

          <button
            onClick={() => showToast('Exported Audit Package Report')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 3 Filters Row: Project, Sprint Scope (Replaced Audit Package), Phase */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col items-start">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Project
          </label>
          <div className="relative">
            <select className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg shadow-xs hover:border-slate-300 focus:outline-none cursor-pointer min-w-[170px]">
              <option>PMA Project</option>
              <option>Data Sync Project</option>
              <option>Security Project</option>
            </select>
          </div>
        </div>

        {/* Sprint Scope Filter */}
        <div className="flex flex-col items-start">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Sprint Scope
          </label>
          <div className="relative">
            <select
              value={selectedSprintFilter}
              onChange={(e) => setSelectedSprintFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg shadow-xs hover:border-slate-300 focus:outline-none cursor-pointer min-w-[170px]"
            >
              <option>All open sprints</option>
              <option>Sprint 35</option>
              <option>Sprint 36</option>
              <option>Sprint 37</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col items-start">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Phase
          </label>
          <div className="relative">
            <select
              value={selectedPhaseFilter}
              onChange={(e) => setSelectedPhaseFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg shadow-xs hover:border-slate-300 focus:outline-none cursor-pointer min-w-[190px]"
            >
              <option>Phase 2 – Development</option>
              <option>Phase 1 – Planning</option>
              <option>Phase 3 – Deployment</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP 2 COLUMNS: Standard Audit Package (Sprint Scope) Stats & Package Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Standard Audit Package with 4 Interactive Arrow Cards */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Standard Audit Package ({selectedSprintFilter})
                </h3>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Click arrow to view docs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Card 1: Required Documents */}
            <div
              onClick={() =>
                setCardModalInfo({
                  title: 'Required Audit Documents',
                  subtitle: `Viewing all ${requiredDocsList.length} standard required docs in ${selectedSprintFilter}`,
                  category: 'required',
                  badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
                  icon: 'assignment',
                  iconColor: 'text-blue-600 bg-blue-50',
                })
              }
              className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-lg p-2.5 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[15px]">assignment</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900">Required Docs</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  {requiredDocsList.length}
                </div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5 flex items-center gap-0.5">
                  <span>View list</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Card 2: Created */}
            <div
              onClick={() =>
                setCardModalInfo({
                  title: 'Created Documents',
                  subtitle: `Viewing ${createdDocsList.length} created documents (${Math.round((createdDocsList.length / Math.max(requiredDocsList.length, 1)) * 100)}% coverage)`,
                  category: 'created',
                  badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: 'edit_note',
                  iconColor: 'text-emerald-600 bg-emerald-50',
                })
              }
              className="bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-lg p-2.5 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900">Created</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  {createdDocsList.length} <span className="text-xs font-semibold text-slate-500">/ {requiredDocsList.length}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  {Math.round((createdDocsList.length / Math.max(requiredDocsList.length, 1)) * 100)}% coverage
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((createdDocsList.length / Math.max(requiredDocsList.length, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Audit Passed */}
            <div
              onClick={() =>
                setCardModalInfo({
                  title: 'Audit Passed Documents',
                  subtitle: `Viewing ${passedDocsList.length} audit passed documents (${Math.round((passedDocsList.length / Math.max(requiredDocsList.length, 1)) * 100)}% pass rate)`,
                  category: 'passed',
                  badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
                  icon: 'verified',
                  iconColor: 'text-teal-600 bg-teal-50',
                })
              }
              className="bg-slate-50/70 hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 rounded-lg p-2.5 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900">Audit Passed</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  {passedDocsList.length} <span className="text-xs font-semibold text-slate-500">/ {requiredDocsList.length}</span>
                </div>
                <div className="text-[10px] text-teal-700 font-bold mt-0.5">
                  {Math.round((passedDocsList.length / Math.max(requiredDocsList.length, 1)) * 100)}% pass rate
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                  <div
                    className="bg-teal-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((passedDocsList.length / Math.max(requiredDocsList.length, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Pending Action */}
            <div
              onClick={() =>
                setCardModalInfo({
                  title: 'Pending Action Documents',
                  subtitle: `Viewing ${pendingActionDocsList.length} documents requiring PM action or rework`,
                  category: 'pending',
                  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                  icon: 'pending',
                  iconColor: 'text-amber-600 bg-amber-50',
                })
              }
              className="bg-slate-50/70 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300 rounded-lg p-2.5 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[15px]">pending</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900">Pending Action</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  {pendingActionDocsList.length}
                </div>
                <div className="text-[10px] text-amber-700 font-bold mt-0.5 truncate">
                  Action required
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((pendingActionDocsList.length / Math.max(requiredDocsList.length, 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Standard Audit Package Coverage */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Audit Package Phase Coverage
            </h3>
            <button
              onClick={() => setViewMode('all-docs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>View all docs</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>

          <div className="space-y-3 mt-1 text-xs">
            {/* Phase 1 */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 font-medium w-36 shrink-0">
                Phase 1 – Planning
              </span>
              <span className="text-slate-500 font-medium text-[11px] w-10 text-right">
                {docsInSprintScope.filter((d) => d.phase === 'Phase 1' && d.overallStatus !== 'Missing').length} / {docsInSprintScope.filter((d) => d.phase === 'Phase 1').length || 3}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 mx-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium w-9 text-right">
                100%
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Complete
              </span>
            </div>

            {/* Phase 2 */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 font-medium w-36 shrink-0">
                Phase 2 – Development
              </span>
              <span className="text-slate-500 font-medium text-[11px] w-10 text-right">
                {docsInSprintScope.filter((d) => d.phase === 'Phase 2' && d.overallStatus !== 'Missing').length} / {docsInSprintScope.filter((d) => d.phase === 'Phase 2').length || 6}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 mx-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '83%' }} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium w-9 text-right">
                83%
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                In Progress
              </span>
            </div>

            {/* Phase 3 */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 font-medium w-36 shrink-0">
                Phase 3 – Deployment
              </span>
              <span className="text-slate-500 font-medium text-[11px] w-10 text-right">
                {docsInSprintScope.filter((d) => d.phase === 'Phase 3' && d.overallStatus !== 'Missing').length} / {docsInSprintScope.filter((d) => d.phase === 'Phase 3').length || 3}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 mx-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '67%' }} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium w-9 text-right">
                67%
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50/70 text-amber-600 border border-amber-200">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2 BREAKDOWN VIEW */}
      {viewMode === 'phase-breakdown' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          {/* Header of Phase 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {selectedPhaseFilter}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Showing documents for {selectedPhaseFilter} within {selectedSprintFilter}.
                </p>
              </div>
            </div>

            {/* Summary dots */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Total in Phase: <strong className="text-slate-900">{currentPhaseDocs.length}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Passed: <strong className="text-slate-900">{currentPhaseDocs.filter((d) => d.pmReview === 'Completed').length}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending: <strong className="text-slate-900">{currentPhaseDocs.filter((d) => d.pmReview === 'Pending' || d.pmReview === 'In Progress').length}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Rework/Missing: <strong className="text-slate-900">{currentPhaseDocs.filter((d) => d.pmReview === 'Rework' || d.overallStatus === 'Missing').length}</strong>
              </span>
            </div>
          </div>

          {/* 2 Columns: Checklist vs Actual Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            {/* Checklist (Left 4 cols) */}
            <div className="lg:col-span-4 bg-slate-50/70 border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Required Phase Checklist
                  </h4>
                  <p className="text-[10px] text-slate-400">Standard audit package requirements</p>
                </div>
              </div>

              <ul className="space-y-2.5 mt-3 text-xs">
                {currentPhaseDocs.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          item.overallStatus === 'Audit Passed' || item.pmReview === 'Completed'
                            ? 'bg-emerald-500 text-white'
                            : item.overallStatus === 'Missing'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-400 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px] font-bold">
                          {item.overallStatus === 'Missing' ? 'close' : 'check'}
                        </span>
                      </span>
                      <span className="font-medium text-slate-800 text-[11px] truncate max-w-[180px]">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold font-mono">{item.sprint || 'S36'}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actual Table (Right 8 cols with Sprint, Owner & Clean "View Docs" Action) */}
            <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200 rounded-xl p-4 shadow-xs overflow-x-auto">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-bold text-slate-900">
                  Project Documents (Actual)
                </div>
                <span className="text-[10px] text-slate-400">Click "View Docs" to inspect and take PM action</span>
              </div>
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 font-medium">Document Name</th>
                    <th className="pb-2 font-medium">Sprint</th>
                    <th className="pb-2 font-medium">Owner</th>
                    <th className="pb-2 font-medium">Created Date</th>
                    <th className="pb-2 font-medium">AI Audit</th>
                    <th className="pb-2 font-medium">PM Review</th>
                    <th className="pb-2 font-medium">Reviewer</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentPhaseDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/80 transition-colors">
                      <td className="py-2.5 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            description
                          </span>
                          <span className="font-semibold text-slate-800">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                          {doc.sprint || 'Sprint 36'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full ${doc.owner.avatarBg} text-white font-bold text-[8px] flex items-center justify-center`}>
                            {doc.owner.initials}
                          </div>
                          <span className="text-xs text-slate-800 font-medium">{doc.owner.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-500 text-[11px]">{doc.createdDate}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                          doc.aiAudit.includes('Passed')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.aiAudit === 'Missing'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.aiAudit}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                            doc.pmReview === 'Completed' || doc.pmReview === 'Passed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.pmReview === 'Rework'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : doc.pmReview === '—'
                              ? 'text-slate-400 border-transparent'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}>
                            {doc.pmReview}
                          </span>
                          {doc.note && (
                            <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[110px]">{doc.note}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">{doc.reviewer.name}</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDocViewer(doc)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          View Docs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ALL DOCS MASTER TABLE */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar: Tabs & Search */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 pb-2 text-xs transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>All Docs</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                {docsInSprintScope.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 pb-2 text-xs transition-colors cursor-pointer ${
                activeTab === 'ai'
                  ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>AI Audit Passed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                {docsInSprintScope.filter((d) => d.aiAudit.includes('Passed')).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 pb-2 text-xs transition-colors cursor-pointer ${
                activeTab === 'pending'
                  ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Pending PM Review</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                {docsInSprintScope.filter((d) => d.pmReview === 'Pending' || d.pmReview === 'In Progress').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex items-center gap-2 pb-2 text-xs transition-colors cursor-pointer ${
                activeTab === 'rejected'
                  ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Rejected / Rework</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                {docsInSprintScope.filter((d) => d.pmReview === 'Rework' || d.overallStatus === 'Rejected / Rework').length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 pb-1.5">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doc, owner, sprint..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Master Table with Sprint column & Clean "View Docs" Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedDocIds.length === filteredDocs.length && filteredDocs.length > 0
                    }
                    onChange={(e) =>
                      setSelectedDocIds(
                        e.target.checked ? filteredDocs.map((d) => d.id) : []
                      )
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 font-semibold">Sprint</th>
                <th className="py-2.5 px-3 font-semibold">Phase</th>
                <th className="py-2.5 px-3 font-semibold">Document</th>
                <th className="py-2.5 px-3 font-semibold">Standard / Doc Type</th>
                <th className="py-2.5 px-3 font-semibold">Owner / Prepared By</th>
                <th className="py-2.5 px-3 font-semibold">Reviewer</th>
                <th className="py-2.5 px-3 font-semibold">AI Audit</th>
                <th className="py-2.5 px-3 font-semibold">PM Review</th>
                <th className="py-2.5 px-3 font-semibold">Overall Status</th>
                <th className="py-2.5 px-3 font-semibold">Created Date</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={() =>
                        setSelectedDocIds((prev) =>
                          prev.includes(doc.id)
                            ? prev.filter((id) => id !== doc.id)
                            : [...prev, doc.id]
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {doc.sprint || 'Sprint 36'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        doc.phase === 'Phase 1'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : doc.phase === 'Phase 2'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {doc.phase}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        description
                      </span>
                      <span>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{doc.standardType}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full ${doc.owner.avatarBg} font-bold text-[9px] flex items-center justify-center`}
                      >
                        {doc.owner.initials}
                      </span>
                      <span className="text-slate-800 font-medium text-xs">
                        {doc.owner.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full ${doc.reviewer.avatarBg} font-bold text-[9px] flex items-center justify-center`}
                      >
                        {doc.reviewer.initials}
                      </span>
                      <span className="text-slate-800 font-medium text-xs">
                        {doc.reviewer.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        doc.aiAudit === 'AI Passed' || doc.aiAudit === 'Passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doc.aiAudit === 'AI Flagged'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : doc.aiAudit === 'Missing'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {doc.aiAudit}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          doc.pmReview === 'Completed' || doc.pmReview === 'Passed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.pmReview === 'Rework'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : doc.pmReview === '—'
                            ? 'text-slate-400 border-transparent'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {doc.pmReview}
                      </span>
                      {doc.note && (
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[140px]">{doc.note}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        doc.overallStatus === 'Audit Passed' || doc.overallStatus === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doc.overallStatus === 'Rejected / Rework' || doc.overallStatus === 'Missing'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {doc.overallStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">{doc.createdDate}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDocViewer(doc)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      View Docs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredDocs.length}</span>{' '}
              of <span className="font-semibold text-slate-800">{docsInSprintScope.length}</span> documents in scope
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-2.5 py-1 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 border border-blue-600 rounded">
              1
            </button>
            <button className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
