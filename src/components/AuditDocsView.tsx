import React, { useMemo, useState } from 'react';
import { AuditDocument } from '../types';
import { INITIAL_AUDIT_DOCS } from '@/data/appData';

interface AuditDocsViewProps {
  documents: AuditDocument[];
  onUploadDoc?: () => void;
  onExportReport: () => void;
  onToggleStatus?: (docId: string, newStatus: AuditDocument['pmReviewStatus']) => void;
}

const PHASES: Array<{ key: AuditDocument['phase']; label: string; shortLabel: string }> = [
  { key: 'Phase 1', label: 'Phase 1 – Planning', shortLabel: 'Planning' },
  { key: 'Phase 2', label: 'Phase 2 – Development', shortLabel: 'Development' },
  { key: 'Phase 3', label: 'Phase 3 – Deployment', shortLabel: 'Deployment' }
];

const isAiPassed = (doc: AuditDocument) => doc.aiAuditStatus === 'AI Passed';
const isPmPassed = (doc: AuditDocument) => doc.pmReviewStatus === 'Completed';
const isPending = (doc: AuditDocument) =>
  doc.pmReviewStatus === 'Pending' || doc.pmReviewStatus === 'PM Review' || doc.pmReviewStatus === 'In Progress';
const needsAction = (doc: AuditDocument) => doc.pmReviewStatus === 'Rework' || doc.aiAuditStatus === 'Action Required' || isPending(doc);

export const AuditDocsView: React.FC<AuditDocsViewProps> = ({
  documents,
  onExportReport,
  onToggleStatus
}) => {
  const docs = documents.length > 0 ? documents : INITIAL_AUDIT_DOCS;
  const [viewMode, setViewMode] = useState<'phase-breakdown' | 'all-docs'>('phase-breakdown');
  const [selectedProject, setSelectedProject] = useState('PMA Project');
  const [selectedSprint, setSelectedSprint] = useState('All open sprints');
  const [selectedPhase, setSelectedPhase] = useState<AuditDocument['phase']>('Phase 2');
  const [selectedDoc, setSelectedDoc] = useState<AuditDocument | null>(null);
  const [masterTab, setMasterTab] = useState<'all' | 'ai' | 'pending' | 'rework'>('all');
  const [masterSearch, setMasterSearch] = useState('');

  const sprintOptions = useMemo(() => {
    const values = Array.from(new Set(docs.map((doc) => doc.sprint).filter(Boolean)));
    return ['All open sprints', ...values];
  }, [docs]);

  const scopedDocs = docs.filter((doc) => selectedSprint === 'All open sprints' || doc.sprint === selectedSprint);
  const phaseDocs = scopedDocs.filter((doc) => doc.phase === selectedPhase);
  const createdDocs = scopedDocs.filter((doc) => doc.aiAuditStatus !== 'Action Required');
  const passedDocs = scopedDocs.filter((doc) => isAiPassed(doc) || isPmPassed(doc));
  const pendingDocs = scopedDocs.filter(needsAction);
  const reworkDocs = scopedDocs.filter((doc) => doc.pmReviewStatus === 'Rework' || doc.aiAuditStatus === 'Action Required');
  const selectedPhaseMeta = PHASES.find((phase) => phase.key === selectedPhase) || PHASES[1];
  const masterDocs = scopedDocs.filter((doc) => {
    if (masterTab === 'ai' && !isAiPassed(doc)) return false;
    if (masterTab === 'pending' && !isPending(doc)) return false;
    if (masterTab === 'rework' && !reworkDocs.some((item) => item.id === doc.id)) return false;
    if (!masterSearch.trim()) return true;

    const query = masterSearch.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.owner.name.toLowerCase().includes(query) ||
      doc.reviewer.name.toLowerCase().includes(query) ||
      doc.docType.toLowerCase().includes(query) ||
      doc.sprint.toLowerCase().includes(query)
    );
  });

  const phaseStats = PHASES.map((phase) => {
    const phaseItems = scopedDocs.filter((doc) => doc.phase === phase.key);
    const passed = phaseItems.filter((doc) => isAiPassed(doc) || isPmPassed(doc)).length;
    const percent = phaseItems.length ? Math.round((passed / phaseItems.length) * 100) : 0;
    const status = percent >= 100 ? 'Complete' : percent >= 75 ? 'In Progress' : 'Pending';
    return { ...phase, total: phaseItems.length, passed, percent, status };
  });

  const getStatusDot = (doc: AuditDocument) => {
    if (doc.pmReviewStatus === 'Rework' || doc.aiAuditStatus === 'Action Required') return 'bg-rose-500';
    if (isAiPassed(doc) || isPmPassed(doc)) return 'bg-emerald-500';
    return 'bg-amber-500';
  };

  const getAiBadgeClass = (status: AuditDocument['aiAuditStatus']) => {
    if (status === 'AI Passed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Action Required') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (status === 'AI Flagged') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getPmBadgeClass = (status: AuditDocument['pmReviewStatus']) => {
    if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Rework') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'PM Review') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-orange-50 text-orange-700 border-orange-200';
  };

  const handleApproveDoc = (doc: AuditDocument) => {
    onToggleStatus?.(doc.id, 'Completed');
    setSelectedDoc(null);
  };

  const getOverallStatus = (doc: AuditDocument) => {
    if (doc.pmReviewStatus === 'Completed') return 'Audit Passed';
    if (doc.pmReviewStatus === 'Rework' || doc.aiAuditStatus === 'Action Required') return 'Rejected / Rework';
    return 'In Progress';
  };

  const getOverallBadgeClass = (doc: AuditDocument) => {
    const overall = getOverallStatus(doc);
    if (overall === 'Audit Passed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (overall === 'Rejected / Rework') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const renderDocTable = (tableDocs: AuditDocument[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
          <tr>
            <th className="px-3 py-3 font-bold min-w-[260px]">Document Name</th>
            <th className="px-3 py-3 font-bold w-24">Sprint</th>
            <th className="px-3 py-3 font-bold w-36">Owner</th>
            <th className="px-3 py-3 font-bold w-28">Created Date</th>
            <th className="px-3 py-3 font-bold w-28">AI Audit</th>
            <th className="px-3 py-3 font-bold w-32">PM Review</th>
            <th className="px-3 py-3 font-bold w-32">Reviewer</th>
            <th className="px-3 py-3 font-bold text-right w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tableDocs.map((doc) => (
            <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-3 py-3.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[19px] text-slate-400">description</span>
                  <span className="font-bold text-slate-900 truncate">{doc.title}</span>
                </div>
              </td>
              <td className="px-3 py-3.5">
                <span className="px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold">
                  {doc.sprint}
                </span>
              </td>
              <td className="px-3 py-3.5">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full ${doc.owner.avatarBg} text-white text-[9px] font-bold flex items-center justify-center`}>
                    {doc.owner.initials}
                  </div>
                  <span className="font-semibold text-slate-800 whitespace-nowrap">{doc.owner.name}</span>
                </div>
              </td>
              <td className="px-3 py-3.5 text-slate-500">{doc.lastUpdated || '—'}</td>
              <td className="px-3 py-3.5">
                <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getAiBadgeClass(doc.aiAuditStatus)}`}>
                  {doc.aiAuditStatus.replace('AI ', '')}
                </span>
              </td>
              <td className="px-3 py-3.5">
                <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getPmBadgeClass(doc.pmReviewStatus)}`}>
                  {doc.pmReviewStatus}
                </span>
                {doc.pmReviewNote && <div className="text-[9px] text-slate-400 truncate max-w-[120px] mt-0.5">{doc.pmReviewNote}</div>}
              </td>
              <td className="px-3 py-3.5 text-slate-700">{doc.reviewer.name}</td>
              <td className="px-3 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  View Docs
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMasterDocsTable = () => (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-5 text-xs font-bold">
          {[
            ['all', 'All Docs', scopedDocs.length],
            ['ai', 'AI Audit Passed', scopedDocs.filter(isAiPassed).length],
            ['pending', 'Pending PM Review', pendingDocs.length],
            ['rework', 'Rejected / Rework', reworkDocs.length]
          ].map(([id, label, count]) => (
            <button
              key={String(id)}
              type="button"
              onClick={() => setMasterTab(id as typeof masterTab)}
              className={`relative pb-2 transition-colors ${
                masterTab === id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px]">{count as number}</span>
              {masterTab === id && <span className="absolute left-0 right-0 -bottom-3 h-0.5 bg-blue-600 rounded-full"></span>}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            value={masterSearch}
            onChange={(event) => setMasterSearch(event.target.value)}
            placeholder="Search by doc, owner, sprint..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold w-24">Sprint</th>
              <th className="px-3 py-3 font-bold w-24">Phase</th>
              <th className="px-3 py-3 font-bold min-w-[260px]">Document</th>
              <th className="px-3 py-3 font-bold min-w-[150px]">Standard / Doc Type</th>
              <th className="px-3 py-3 font-bold min-w-[150px]">Owner / Prepared By</th>
              <th className="px-3 py-3 font-bold min-w-[130px]">Reviewer</th>
              <th className="px-3 py-3 font-bold w-28">AI Audit</th>
              <th className="px-3 py-3 font-bold w-32">PM Review</th>
              <th className="px-3 py-3 font-bold w-32">Overall Status</th>
              <th className="px-3 py-3 font-bold w-28">Created Date</th>
              <th className="px-4 py-3 font-bold text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {masterDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold">
                    {doc.sprint}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                    doc.phase === 'Phase 1'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : doc.phase === 'Phase 2'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {doc.phase}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[19px] text-slate-400">description</span>
                    <span className="font-bold text-slate-900 truncate">{doc.title}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-slate-600">{doc.docType}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full ${doc.owner.avatarBg} text-white text-[9px] font-bold flex items-center justify-center`}>
                      {doc.owner.initials}
                    </div>
                    <span className="font-semibold text-slate-800 whitespace-nowrap">{doc.owner.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full ${doc.reviewer.avatarBg} text-white text-[9px] font-bold flex items-center justify-center`}>
                      {doc.reviewer.initials}
                    </div>
                    <span className="font-semibold text-slate-800 whitespace-nowrap">{doc.reviewer.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getAiBadgeClass(doc.aiAuditStatus)}`}>
                    {doc.aiAuditStatus.replace('AI ', '')}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getPmBadgeClass(doc.pmReviewStatus)}`}>
                    {doc.pmReviewStatus}
                  </span>
                  {doc.pmReviewNote && <div className="text-[9px] text-slate-400 truncate max-w-[130px] mt-0.5">{doc.pmReviewNote}</div>}
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getOverallBadgeClass(doc)}`}>
                    {getOverallStatus(doc)}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-slate-500">{doc.lastUpdated || '—'}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    View Docs
                  </button>
                </td>
              </tr>
            ))}
            {masterDocs.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-slate-400 font-medium">
                  No documents match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Audit Docs</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage and track audit documents across your projects, phases and sprint scope.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('phase-breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'phase-breakdown' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Phase Breakdown
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all-docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'all-docs' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Docs Master Table
            </button>
          </div>

          <button
            type="button"
            onClick={onExportReport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-xs text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Project
          <select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)} className="min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-900 shadow-xs">
            <option>PMA Project</option>
            <option>Data Sync Project</option>
            <option>Security Project</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Sprint Scope
          <select value={selectedSprint} onChange={(event) => setSelectedSprint(event.target.value)} className="min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-900 shadow-xs">
            {sprintOptions.map((sprint) => <option key={sprint}>{sprint}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Phase
          <select value={selectedPhase} onChange={(event) => setSelectedPhase(event.target.value as AuditDocument['phase'])} className="min-w-[195px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-900 shadow-xs">
            {PHASES.map((phase) => <option key={phase.key} value={phase.key}>{phase.label}</option>)}
          </select>
        </label>
      </div>

      {viewMode === 'phase-breakdown' ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <section className="xl:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-950">Standard Audit Package ({selectedSprint})</h2>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Click arrow to view docs</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  ['assignment', 'Required Docs', scopedDocs.length, scopedDocs.length, 'View list →', 'blue', scopedDocs],
                  ['playlist_add_check', 'Created', createdDocs.length, scopedDocs.length, `${scopedDocs.length ? Math.round((createdDocs.length / scopedDocs.length) * 100) : 0}% coverage`, 'emerald', createdDocs],
                  ['verified', 'Audit Passed', passedDocs.length, scopedDocs.length, `${scopedDocs.length ? Math.round((passedDocs.length / scopedDocs.length) * 100) : 0}% pass rate`, 'teal', passedDocs],
                  ['pending_actions', 'Pending Action', pendingDocs.length, 0, 'Action required', 'amber', pendingDocs]
                ].map(([icon, label, value, denominator, helper, tone, cardDocs]) => (
                  <button
                    key={String(label)}
                    type="button"
                    onClick={() => setViewMode('all-docs')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-left hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`material-symbols-outlined text-[22px] ${tone === 'amber' ? 'text-amber-500' : tone === 'emerald' ? 'text-emerald-600' : tone === 'teal' ? 'text-teal-600' : 'text-blue-600'}`}>{icon}</span>
                      <span className="material-symbols-outlined text-[22px] text-slate-400">arrow_forward</span>
                    </div>
                    <div className="mt-4 text-[11px] font-bold text-slate-950">{label}</div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-950">
                      {value as number}
                      {Number(denominator) > 0 && <span className="text-xs font-bold text-slate-400"> / {denominator as number}</span>}
                    </div>
                    <div className={`mt-1 text-[10px] font-bold ${tone === 'amber' ? 'text-amber-600' : 'text-emerald-600'}`}>{helper}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`${tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full`} style={{ width: `${scopedDocs.length ? Math.min(100, (Number(value) / Math.max(1, Number(denominator) || scopedDocs.length)) * 100) : 0}%` }}></div>
                    </div>
                    <span className="sr-only">{(cardDocs as AuditDocument[]).length} documents</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="xl:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-slate-950">Audit Package Phase Coverage</h2>
                <button type="button" onClick={() => setViewMode('all-docs')} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                  View all docs <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
              <div className="space-y-5">
                {phaseStats.map((phase) => (
                  <button key={phase.key} type="button" onClick={() => setSelectedPhase(phase.key)} className="w-full grid grid-cols-[150px_44px_1fr_42px_88px] items-center gap-3 text-left">
                    <span className="text-xs font-semibold text-slate-900">{phase.label}</span>
                    <span className="text-[11px] text-slate-500">{phase.passed} / {phase.total || 0}</span>
                    <span className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <span className={`block h-full rounded-full ${phase.percent >= 100 ? 'bg-emerald-500' : phase.percent >= 75 ? 'bg-blue-600' : 'bg-amber-500'}`} style={{ width: `${phase.percent}%` }}></span>
                    </span>
                    <span className="text-[11px] text-slate-600 text-right">{phase.percent}%</span>
                    <span className={`justify-self-end rounded-md border px-2 py-0.5 text-[10px] font-bold ${phase.status === 'Complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : phase.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {phase.status}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">
                  {selectedPhase.replace('Phase ', '')}
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-950">{selectedPhaseMeta.label}</h2>
                  <p className="text-[11px] text-slate-500">Showing documents for {selectedPhaseMeta.label} within {selectedSprint}.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span>Total in Phase: <strong>{phaseDocs.length}</strong></span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Passed: <strong>{phaseDocs.filter((doc) => isAiPassed(doc) || isPmPassed(doc)).length}</strong></span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Pending: <strong>{phaseDocs.filter(isPending).length}</strong></span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Rework/Missing: <strong>{phaseDocs.filter((doc) => doc.pmReviewStatus === 'Rework' || doc.aiAuditStatus === 'Action Required').length}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pt-4">
              <aside className="xl:col-span-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">checklist</span>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-950">Required Phase Checklist</h3>
                    <p className="text-[10px] text-slate-400">Standard audit package requirements</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {phaseDocs.map((doc) => (
                    <button key={doc.id} type="button" onClick={() => setSelectedDoc(doc)} className="w-full flex items-center justify-between gap-3 text-left">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`w-4 h-4 rounded-full shrink-0 ${getStatusDot(doc)}`}></span>
                        <span className="text-xs font-semibold text-slate-800 truncate">{doc.title}</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 whitespace-nowrap">{doc.sprint}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="xl:col-span-8 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-950">Project Documents (Actual)</h3>
                  <span className="text-[10px] text-slate-400">Click "View Docs" to inspect and take PM action</span>
                </div>
                {renderDocTable(phaseDocs)}
              </div>
            </div>
          </section>

          {renderMasterDocsTable()}
        </>
      ) : (
        renderMasterDocsTable()
      )}

      {selectedDoc && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">{selectedDoc.id}</span>
                  <h3 className="font-extrabold text-slate-950">{selectedDoc.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedDoc.sprint} • {selectedDoc.phase} • {selectedDoc.docType}</p>
              </div>
              <button type="button" onClick={() => setSelectedDoc(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Owner</div>
                  <div className="font-bold text-slate-900">{selectedDoc.owner.name}</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Reviewer</div>
                  <div className="font-bold text-slate-900">{selectedDoc.reviewer.name}</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">AI Audit</div>
                  <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getAiBadgeClass(selectedDoc.aiAuditStatus)}`}>{selectedDoc.aiAuditStatus}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">PM Review</div>
                  <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${getPmBadgeClass(selectedDoc.pmReviewStatus)}`}>{selectedDoc.pmReviewStatus}</span>
                </div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-slate-700 leading-relaxed">
                {selectedDoc.aiAuditDetails || 'Audit details are ready for PM inspection.'}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setSelectedDoc(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100">Close</button>
              <button type="button" onClick={() => handleApproveDoc(selectedDoc)} className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
