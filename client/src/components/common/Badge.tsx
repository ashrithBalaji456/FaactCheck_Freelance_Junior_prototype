import React from 'react';
import { VerificationVerdict, EvidenceStance } from '../../types';

interface VerdictBadgeProps {
  verdict?: VerificationVerdict | null;
  size?: 'sm' | 'md' | 'lg';
}

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  if (!verdict) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-white/10 backdrop-blur-md whitespace-nowrap">
        PENDING
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs font-semibold gap-1.5',
    md: 'px-4 py-1.5 text-sm font-bold gap-2',
    lg: 'px-6 py-2 text-base font-extrabold gap-2.5',
  }[size];

  switch (verdict) {
    case 'TRUE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 backdrop-blur-xl shadow-lg shadow-emerald-950/40 whitespace-nowrap box-border ${sizeClasses}`}
        >
          ✓ TRUE
        </span>
      );
    case 'FALSE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-300 border border-rose-400/40 backdrop-blur-xl shadow-lg shadow-rose-950/40 whitespace-nowrap box-border ${sizeClasses}`}
        >
          ✕ FALSE
        </span>
      );
    case 'PARTIALLY_TRUE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40 backdrop-blur-xl shadow-lg shadow-amber-950/40 whitespace-nowrap box-border ${sizeClasses}`}
        >
          ⚠ PARTIALLY TRUE
        </span>
      );
    case 'UNCERTAIN':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-800/60 text-slate-300 border border-white/20 backdrop-blur-xl shadow-md whitespace-nowrap box-border ${sizeClasses}`}
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-xs">
          SUPPORTS
        </span>
      );
    case 'CONTRADICTS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-400/30 backdrop-blur-md shadow-xs">
          CONTRADICTS
        </span>
      );
    case 'CONTEXT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 backdrop-blur-md shadow-xs">
          CONTEXT
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase bg-slate-800/60 text-slate-400 border border-white/10 backdrop-blur-md">
          UNKNOWN
        </span>
      );
  }
}

