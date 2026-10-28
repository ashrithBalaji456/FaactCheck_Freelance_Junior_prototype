import React, { useState } from 'react';
import { Hash, ExternalLink, Globe } from 'lucide-react';
import { EvidenceItem } from '../../types';

export function scrollToEvidence(evidenceId: string) {
  const shortId = evidenceId.slice(-6).toLowerCase();
  const el =
    document.getElementById(`evidence-${evidenceId}`) ||
    document.getElementById(`evidence-${shortId}`) ||
    document.querySelector(`[data-evidence-id*="${shortId}"]`) ||
    document.querySelector(`[data-evidence-id*="${evidenceId}"]`);

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add(
      'ring-4',
      'ring-emerald-400',
      'border-emerald-400',
      'shadow-2xl',
      'shadow-emerald-500/40',
      'scale-[1.02]'
    );
    setTimeout(() => {
      el.classList.remove(
        'ring-4',
        'ring-emerald-400',
        'border-emerald-400',
        'shadow-2xl',
        'shadow-emerald-500/40',
        'scale-[1.02]'
      );
    }, 2800);
  }
}

interface InteractiveCitationTextProps {
  text: string;
  evidenceList?: EvidenceItem[];
  className?: string;
}

export function InteractiveCitationText({
  text,
  evidenceList = [],
  className = '',
}: InteractiveCitationTextProps) {
  // Regex to match citation brackets like:
  // [Evidence 06cb96ef15ad10c2bcc97e5e, f4e2ea036706e9cdd4a65c19]
  // [Evidence ID: 06cb96ef15ad10c2bcc97e5e]
  // [06cb96ef15ad10c2bcc97e5e]
  const citationPattern =
    /\[(?:Evidence(?:\s+ID)?:\s*|Evidence\s+)?([a-f0-9]{12,32}(?:\s*,\s*[a-f0-9]{12,32})*)\]/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = citationPattern.exec(text)) !== null) {
    // Add text preceding the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const idsString = match[1];
    const ids = idsString.split(',').map((id) => id.trim()).filter(Boolean);

    // Render interactive citation pills for each ID in the bracket
    parts.push(
      <span key={`citation-group-${match.index}`} className="inline-flex items-center gap-1.5 flex-wrap mx-1 align-baseline">
        {ids.map((id, i) => {
          const matchingEvidence = evidenceList.find((e) => {
            const eId = (e.id || e._id || '').toLowerCase();
            const targetId = id.toLowerCase();
            return eId === targetId || eId.endsWith(targetId) || targetId.endsWith(eId);
          });

          const shortId = id.slice(-6);
          const domain = matchingEvidence?.sourceDomain;
          const title = matchingEvidence?.title || `Evidence #${shortId}`;

          return (
            <CitationPill
              key={`pill-${match?.index}-${i}-${id}`}
              id={id}
              shortId={shortId}
              domain={domain}
              title={title}
              snippet={matchingEvidence?.snippet}
              onNavigate={() => scrollToEvidence(id)}
            />
          );
        })}
      </span>
    );

    lastIndex = citationPattern.lastIndex;
  }

  // Add trailing text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <div className={className}>{parts}</div>;
}

interface CitationPillProps {
  id: string;
  shortId: string;
  domain?: string;
  title: string;
  snippet?: string;
  onNavigate: () => void;
}

function CitationPill({ id, shortId, domain, title, snippet, onNavigate }: CitationPillProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={onNavigate}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/35 hover:bg-emerald-500/25 hover:border-emerald-400/70 hover:scale-[1.04] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm shadow-emerald-950/40 select-none group align-middle"
        aria-label={`Jump to evidence ${shortId}`}
      >
        <Hash className="w-3 h-3 text-emerald-400 group-hover:text-emerald-200 transition-colors shrink-0" />
        <span className="font-mono">{shortId}</span>
        {domain && (
          <span className="text-[10px] text-emerald-300/80 max-w-[120px] truncate border-l border-emerald-400/30 pl-1 font-sans">
            {domain}
          </span>
        )}
        <ExternalLink className="w-2.5 h-2.5 text-emerald-400/70 group-hover:text-emerald-200 shrink-0" />
      </button>

      {/* Floating Hover Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 md:w-80 p-3 rounded-xl glass-card border border-white/20 shadow-2xl backdrop-blur-2xl z-50 pointer-events-none text-left space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1.5">
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Evidence ID: {shortId}
            </span>
            {domain && (
              <span className="flex items-center gap-1 text-slate-300 truncate max-w-[140px]">
                <Globe className="w-3 h-3 text-slate-400" />
                {domain}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
            {title}
          </p>
          {snippet && (
            <p className="text-[11px] text-slate-300/90 line-clamp-3 leading-relaxed border-l-2 border-emerald-500/40 pl-2">
              "{snippet}"
            </p>
          )}
          <div className="text-[10px] text-emerald-400 font-medium text-right pt-0.5">
            Click to highlight source card ↓
          </div>
        </div>
      )}
    </span>
  );
}
