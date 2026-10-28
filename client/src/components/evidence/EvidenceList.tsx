import React, { useState } from 'react';
import { EvidenceItem } from '../../types';
import { EvidenceCard } from './EvidenceCard';
import { Layers } from 'lucide-react';

interface EvidenceListProps {
  evidence: EvidenceItem[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  const [filter, setFilter] = useState<'ALL' | 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXT'>('ALL');

  const filtered = evidence.filter((item) => {
    if (filter === 'ALL') return true;
    return item.stance === filter;
  });

  const countFor = (st: string) =>
    st === 'ALL' ? evidence.length : evidence.filter((e) => e.stance === st).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Retrieved Web Evidence ({evidence.length})</span>
        </h3>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          {(['ALL', 'SUPPORTS', 'CONTRADICTS', 'CONTEXT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === tab
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} ({countFor(tab)})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 border border-slate-800 rounded-xl">
          No evidence items in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <EvidenceCard key={item.id || item._id || idx} evidence={item} />
          ))}
        </div>
      )}
    </div>
  );
}

