import React, { useState } from 'react';
import { AgentFunction } from '../../types';

interface NewFunctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFunction: (fn: AgentFunction) => void;
}

export const NewFunctionModal: React.FC<NewFunctionModalProps> = ({
  isOpen,
  onClose,
  onAddFunction
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('AF-2024');
  const [owner, setOwner] = useState('Sarah Chen');
  const [overview, setOverview] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newFn: AgentFunction = {
      id: `func-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      totalTasks: 12,
      completedTasks: 8,
      runningTasks: 3,
      pendingTasks: 1,
      status: 'On Track',
      progress: 67,
      lastRun: 'Just now',
      owner: {
        name: owner,
        role: 'Autonomous Function Lead',
        initials: owner
          .split(' ')
          .map((n) => n[0])
          .join('')
      },
      overview: overview || 'Autonomous agent worker routine.',
      timeline: [
        {
          title: 'Initialization',
          version: 'v1.0',
          date: 'Today',
          status: 'Completed',
          description: 'Baseline agent container provisioned.'
        }
      ],
      notes: []
    };

    onAddFunction(newFn);
    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Create Agent Function</h2>
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
            <label className="block font-semibold text-slate-700 mb-1">Function Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Audit Log Aggregator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#1877f2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code / Identifier</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Goal</label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Describe what this function will autonomously monitor or orchestrate..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 resize-none focus:outline-none focus:border-[#1877f2]"
            ></textarea>
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
              className="px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg font-semibold shadow-xs"
            >
              Deploy Function
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
