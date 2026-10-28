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
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm md:text-base font-semibold text-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <span>Retrieved Web Evidence</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-300 font-mono">
            {evidence.length}
          </span>
        </h3>

        {/* Curved Glassy Filter Tab Controller */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-white/[0.08] rounded-xl backdrop-blur-xl text-xs font-medium">
          {(['ALL', 'SUPPORTS', 'CONTRADICTS', 'CONTEXT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                filter === tab
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab} ({countFor(tab)})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 glass-card rounded-2xl border border-white/[0.06]">
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

