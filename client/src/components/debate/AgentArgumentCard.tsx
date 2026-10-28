import React from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, Hash } from 'lucide-react';
import { AgentArgumentItem } from '../../types';

interface AgentArgumentCardProps {
  argument: AgentArgumentItem;
}

export function AgentArgumentCard({ argument }: AgentArgumentCardProps) {
  const isSupporter = argument.agentType === 'SUPPORTER';

  // Format cited evidence IDs
  const citedIds = (argument.evidenceIds || []).map((ev: any) =>
    typeof ev === 'object' && ev !== null ? ev.id || ev._id : ev
  );

  return (
    <div
      className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        isSupporter
          ? 'bg-slate-900/90 border-emerald-900/40'
          : 'bg-slate-900/90 border-rose-900/40'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isSupporter
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isSupporter ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              {isSupporter ? 'Supporter Agent (Agent 3)' : 'Opponent Agent (Agent 4)'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isSupporter ? 'Evidence Corroboration' : 'Critical Rebuttal & Scrutiny'}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
          Round {argument.roundNumber}
        </span>
      </div>

      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
        {argument.argument}
      </div>

      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Reasoning Summary</span>
        </div>
        <p className="text-slate-300 text-xs italic">
          "{argument.reasoningSummary}"
        </p>

        {citedIds.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400">Cited Evidence:</span>
            {citedIds.map((id: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
              >
                <Hash className="w-3 h-3 text-slate-400" />
                {id.slice(-6)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

