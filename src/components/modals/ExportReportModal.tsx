import React, { useState } from 'react';
import { AuditDocument } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: AuditDocument[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  documents
}) => {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Create and trigger download
      const filename = `PMA_Audit_Report_Sprint36.${format}`;
      let content = '';

      if (format === 'json') {
        content = JSON.stringify(documents, null, 2);
      } else if (format === 'csv') {
        const header = 'ID,Phase,Title,Type,Owner,Reviewer,AI Audit,PM Review\n';
        const rows = documents
          .map(
            (d) =>
              `"${d.id}","${d.phase}","${d.title}","${d.docType}","${d.owner.name}","${d.reviewer.name}","${d.aiAuditStatus}","${d.pmReviewStatus}"`
          )
          .join('\n');
        content = header + rows;
      } else {
        content = `PMA AGENT WORKSPACE - AUDIT REPORT\nGenerated for Sprint 36\nTotal Documents: ${documents.length}\nPassed: ${
          documents.filter((d) => d.aiAuditStatus === 'AI Passed').length
        }\nPM Approved: ${
          documents.filter((d) => d.pmReviewStatus === 'Completed').length
        }\n\nArtifacts Summary:\n${documents.map((d) => `- [${d.phase}] ${d.title} (${d.pmReviewStatus})`).join('\n')}`;
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Export Audit Report</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Generate and export the formal compliance audit report including autonomous AI validation
            check results, reviewer signatures, and open remediation items.
          </p>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Choose Export Format:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['pdf', 'csv', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`p-3 rounded-xl border text-center font-bold uppercase transition-all ${
                    format === fmt
                      ? 'border-[#004ac6] bg-[#eff6ff] text-[#004ac6]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
            Package: <span className="font-semibold text-slate-800">Standard Package (12 Documents)</span>
            <br />
            Report Cycle: <span className="font-semibold text-slate-800">Sprint 36 · Cycle 2026.Q4</span>
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
              type="button"
              disabled={downloading}
              onClick={handleDownload}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
            >
              {downloading ? 'Generating...' : `Download ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
