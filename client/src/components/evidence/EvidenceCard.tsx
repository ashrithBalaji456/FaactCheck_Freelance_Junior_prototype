import React from 'react';
import { ExternalLink, Calendar, Globe, Hash } from 'lucide-react';
import { EvidenceItem } from '../../types';
import { StanceBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const displayId = evidence.id || evidence._id || '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-colors space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StanceBadge stance={evidence.stance} />
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <Hash className="w-3 h-3 text-slate-400" />
              ID: {displayId ? displayId.slice(-6) : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {evidence.contentAccessLevel === 'SEARCH_SNIPPET' ? 'Search Snippet' : 'Full Page'}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors line-clamp-2">
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <span>{evidence.title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
            </a>
          </h4>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
        "{evidence.snippet}"
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{evidence.sourceDomain}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formatDate(evidence.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}

