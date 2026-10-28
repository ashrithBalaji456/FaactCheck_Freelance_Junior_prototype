import React from 'react';
import { ExternalLink, Calendar, Globe, Hash, Quote } from 'lucide-react';
import { EvidenceItem } from '../../types';
import { StanceBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const displayId = evidence.id || evidence._id || '';

  const accentBorderColor =
    evidence.stance === 'SUPPORTS'
      ? 'border-l-emerald-400/70'
      : evidence.stance === 'CONTRADICTS'
      ? 'border-l-rose-400/70'
      : 'border-l-cyan-400/70';

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Header Tags Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <StanceBadge stance={evidence.stance} />
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-950/70 px-2.5 py-0.5 rounded-full border border-white/[0.08] backdrop-blur-md">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{displayId ? displayId.slice(-6) : 'N/A'}</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {evidence.contentAccessLevel === 'SEARCH_SNIPPET' ? 'Search Snippet' : 'Full Page'}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm md:text-[15px] font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <span>{evidence.title}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0 inline transition-colors" />
          </a>
        </h4>

        {/* Glassy Snippet Container (Clean typography, no harsh monospace) */}
        <div
          className={`glass-inset rounded-xl p-3.5 border-l-2 ${accentBorderColor} relative`}
        >
          <p className="text-xs md:text-[13px] text-slate-300/90 leading-relaxed font-normal">
            "{evidence.snippet}"
          </p>
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 truncate max-w-[210px] text-slate-400 hover:text-slate-200 transition-colors">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px] font-medium">{evidence.sourceDomain}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formatDate(evidence.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}

