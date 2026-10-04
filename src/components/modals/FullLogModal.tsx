import React from 'react';
import { AgentFunction } from '../../types';

interface FullLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  func: AgentFunction | null;
}

export const FullLogModal: React.FC<FullLogModalProps> = ({ isOpen, onClose, func }) => {
  if (!isOpen || !func) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#0f172a] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl p-6 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">terminal</span>
            <h2 className="text-sm font-bold text-white">Execution Logs: {func.name} ({func.code})</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mt-4 bg-[#020617] p-4 rounded-xl border border-slate-800/80 h-72 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed text-slate-300">
          <div><span className="text-slate-500">[2026-09-22 08:30:00 UTC]</span> <span className="text-blue-400">INFO</span> Daemon init worker-01 on node-asia-east</div>
          <div><span className="text-slate-500">[2026-09-22 08:30:02 UTC]</span> <span className="text-blue-400">INFO</span> Loaded configuration profile: PMA_SPRINT_36_STRICT</div>
          <div><span className="text-slate-500">[2026-09-22 08:30:14 UTC]</span> <span className="text-emerald-400">SUCCESS</span> Connected to ERP gateway endpoint (latency 24ms)</div>
          <div><span className="text-slate-500">[2026-09-22 08:31:00 UTC]</span> <span className="text-blue-400">INFO</span> Sync interval checkpoint: 148 entities validated</div>
          <div><span className="text-slate-500">[2026-09-22 08:45:00 UTC]</span> <span className="text-amber-400">WARN</span> Slow consumer detected in Data Warehouse ingest queue, batch split into 2 chunks</div>
          <div><span className="text-slate-500">[2026-09-22 08:45:03 UTC]</span> <span className="text-emerald-400">SUCCESS</span> Chunk A processed (74 records)</div>
          <div><span className="text-slate-500">[2026-09-22 08:45:05 UTC]</span> <span className="text-emerald-400">SUCCESS</span> Chunk B processed (74 records)</div>
          <div><span className="text-slate-500">[2026-09-22 09:00:00 UTC]</span> <span className="text-blue-400">INFO</span> Health check passed. Autonomous daemon heartbeat OK.</div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between font-sans">
          <span className="text-[11px] text-slate-400">Stream buffer: Active (listening on ws://localhost:3000)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
};
