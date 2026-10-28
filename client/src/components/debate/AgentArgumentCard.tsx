import React from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, Hash, ExternalLink } from 'lucide-react';
import { AgentArgumentItem, EvidenceItem } from '../../types';
import { InteractiveCitationText, scrollToEvidence } from '../common/InteractiveCitationText';

interface AgentArgumentCardProps {
  argument: AgentArgumentItem;
  evidenceList?: EvidenceItem[];
}

export function AgentArgumentCard({ argument, evidenceList = [] }: AgentArgumentCardProps) {
  const isSupporter = argument.agentType === 'SUPPORTER';

  // Format cited evidence IDs
  const citedIds = (argument.evidenceIds || []).map((ev: any) =>
    typeof ev === 'object' && ev !== null ? ev.id || ev._id : ev
  );

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 glass-card relative overflow-hidden transition-all duration-300 space-y-4 border ${
        isSupporter
          ? 'bg-gradient-to-b from-emerald-950/25 via-slate-900/65 to-slate-900/85 border-emerald-500/25 hover:border-emerald-400/40 shadow-emerald-950/20'
          : 'bg-gradient-to-b from-rose-950/25 via-slate-900/65 to-slate-900/85 border-rose-500/25 hover:border-rose-400/40 shadow-rose-950/20'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-md ${
              isSupporter
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 shadow-sm shadow-emerald-500/20'
                : 'bg-rose-500/15 text-rose-300 border border-rose-400/30 shadow-sm shadow-rose-500/20'
            }`}
          >
            {isSupporter ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-100 tracking-tight">
                {isSupporter ? 'Supporter Agent' : 'Opponent Agent'}
              </h4>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isSupporter
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                }`}
              >
                {isSupporter ? 'Agent 3' : 'Agent 4'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSupporter ? 'Evidence Corroboration' : 'Critical Rebuttal & Scrutiny'}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-950/70 border border-white/[0.08] text-slate-300 backdrop-blur-md shadow-xs shrink-0">
          Round {argument.roundNumber}
        </span>
      </div>

      {/* Main Argument Body with Interactive Citations */}
      <InteractiveCitationText
        text={argument.argument}
        evidenceList={evidenceList}
        className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal"
      />

      {/* Curved Glassy Reasoning & Citations Dropbox */}
      <div className="glass-inset rounded-xl p-4 space-y-3 text-xs border border-white/[0.06]">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Reasoning Summary</span>
        </div>

        <InteractiveCitationText
          text={argument.reasoningSummary}
          evidenceList={evidenceList}
          className="text-slate-300/90 text-xs italic leading-relaxed pl-2 border-l-2 border-slate-700/60"
        />

        {citedIds.length > 0 && (
          <div className="pt-2.5 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-slate-400">Cited Evidence:</span>
            {citedIds.map((id: string, idx: number) => {
              const matched = evidenceList.find((e) => {
                const eId = (e.id || e._id || '').toLowerCase();
                const targetId = id.toLowerCase();
                return eId === targetId || eId.endsWith(targetId) || targetId.endsWith(eId);
              });
              const shortId = id.slice(-6);

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => scrollToEvidence(id)}
                  title={matched ? `${matched.title} (${matched.sourceDomain})` : `Jump to Evidence #${shortId}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/[0.1] text-slate-200 hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-300 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer shadow-xs select-none group"
                >
                  <Hash className="w-3 h-3 text-emerald-400/80 group-hover:text-emerald-300 transition-colors" />
                  <span>{shortId}</span>
                  {matched?.sourceDomain && (
                    <span className="text-[10px] text-slate-400 font-sans border-l border-white/10 pl-1 truncate max-w-[100px]">
                      {matched.sourceDomain}
                    </span>
                  )}
                  <ExternalLink className="w-2.5 h-2.5 text-emerald-400/70 group-hover:text-emerald-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

