import React from 'react';
import { VerificationVerdict, EvidenceStance } from '../../types';

interface VerdictBadgeProps {
  verdict?: VerificationVerdict | null;
  size?: 'sm' | 'md' | 'lg';
}

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  if (!verdict) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        PENDING
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
    lg: 'px-4 py-1.5 text-base font-bold',
  }[size];

  switch (verdict) {
    case 'TRUE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-900/30 ${sizeClasses}`}
        >
          ✓ TRUE
        </span>
      );
    case 'FALSE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-900/30 ${sizeClasses}`}
        >
          ✕ FALSE
        </span>
      );
    case 'PARTIALLY_TRUE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-900/30 ${sizeClasses}`}
        >
          ⚠ PARTIALLY TRUE
        </span>
      );
    case 'UNCERTAIN':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-600 shadow-sm ${sizeClasses}`}
        >
          ? UNCERTAIN
        </span>
      );
  }
}

interface StanceBadgeProps {
  stance: EvidenceStance;
}

export function StanceBadge({ stance }: StanceBadgeProps) {
  switch (stance) {
    case 'SUPPORTS':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
          SUPPORTS
        </span>
      );
    case 'CONTRADICTS':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
          CONTRADICTS
        </span>
      );
    case 'CONTEXT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/80">
          CONTEXT
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          UNKNOWN
        </span>
      );
  }
}

