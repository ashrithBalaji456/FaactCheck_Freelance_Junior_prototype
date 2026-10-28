import React from 'react';
import {
  ShieldAlert,
  Scale,
  Clock,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { VerificationDetail } from '../../types';
import { VerdictBadge } from '../common/Badge';
import { EvidenceList } from '../evidence/EvidenceList';
import { DebateRoundView } from '../debate/DebateRoundView';
import { formatDate, formatDuration, formatConfidence } from '../../utils/formatters';

interface VerdictReportProps {
  report: VerificationDetail;
}

export function VerdictReport({ report }: VerdictReportProps) {
  const isComplete = report.status === 'COMPLETED';
  const hasCaveats = (report.judgeReport?.caveats || []).length > 0;
  const citationAudit = report.factCheckerReport?.citationIntegrity;

  return (
    <div className="space-y-8">
      {/* 1. Main Verdict Header Glassy Banner */}
      <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            report.verdict === 'TRUE'
              ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
              : report.verdict === 'FALSE'
              ? 'bg-rose-500 shadow-sm shadow-rose-500'
              : report.verdict === 'PARTIALLY_TRUE'
              ? 'bg-amber-500 shadow-sm shadow-amber-500'
              : 'bg-slate-500'
          }`}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
              Final Fact Verification Verdict
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <VerdictBadge verdict={report.verdict} size="lg" />
              {report.confidenceScore != null && (
                <div className="text-xs bg-slate-950/70 px-3.5 py-1.5 rounded-full border border-white/[0.08] text-slate-300 backdrop-blur-md shadow-xs">
                  <span className="text-slate-400">Confidence:</span>{' '}
                  <span className="font-bold text-white font-mono">
                    {formatConfidence(report.confidenceScore)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-white/[0.06]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Duration: {formatDuration(report.processingDurationMs)}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-slate-400">{formatDate(report.completedAt || report.createdAt)}</div>
          </div>
        </div>

        {/* Investigated Claim Card */}
        <div className="mt-6 glass-inset p-5 rounded-2xl border border-white/[0.06] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Investigated Claim
          </span>
          <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
            "{report.claim}"
          </p>
          {report.sourceUrl && (
            <div className="pt-1">
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Submitted source reference: {report.sourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Judicial Summary & Explanation */}
        {report.summary && (
          <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Executive Finding
              </h3>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed font-normal">
                {report.summary}
              </p>
            </div>

            {report.explanation && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Judicial Rationale & Evidence Weighing
                </h3>
                <div className="glass-inset p-4.5 rounded-2xl border border-white/[0.06]">
                  <p className="text-xs md:text-sm text-slate-300/90 leading-relaxed whitespace-pre-line font-normal">
                    {report.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Caveats or Warnings */}
        {hasCaveats && (
          <div className="mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl text-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-2 text-amber-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Important Nuances & Caveats Identified by Judge</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-amber-200/90 pl-1 leading-relaxed text-xs">
              {report.judgeReport?.caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence Notice / Calibration Disclaimer */}
        <div className="mt-6 flex items-start gap-2.5 text-xs text-slate-400 glass-inset p-3.5 rounded-xl border border-white/[0.04]">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Model Confidence Notice: The confidence score represents the AI model's internal assessment of evidence clarity, not a statistically calibrated empirical probability.
          </span>
        </div>
      </div>

      {/* 2. Fact-Checker Audit Panel */}
      {report.factCheckerReport && (
        <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4 border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Agent 5: Fact-Checker Audit & Citation Integrity
                </h3>
                <p className="text-[11px] text-slate-400">
                  Automated Citation Verification & Assertion Scrutiny
                </p>
              </div>
            </div>
            {citationAudit && (
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950/70 border border-white/[0.08] text-slate-300 backdrop-blur-md">
                Citation Validity: {Math.round(citationAudit.citationValidityRatio * 100)}%
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            {report.factCheckerReport.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl glass-inset border border-white/[0.06] space-y-2.5">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle className="w-4 h-4" />
                <span>Supported Assertions</span>
              </div>
              <ul className="text-xs text-slate-300/90 space-y-1.5 list-disc list-inside pl-1 leading-relaxed">
                {(report.factCheckerReport.supportedClaims || []).map((sc, i) => (
                  <li key={i}>{sc}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl glass-inset border border-white/[0.06] space-y-2.5">
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4" />
                <span>Overstated / Contested Points</span>
              </div>
              {(report.factCheckerReport.unsupportedOrOverstatedClaims || []).length > 0 ? (
                <ul className="text-xs text-slate-300/90 space-y-1.5 list-disc list-inside pl-1 leading-relaxed">
                  {report.factCheckerReport.unsupportedOrOverstatedClaims.map((uc, i) => (
                    <li key={i}>{uc}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">None detected.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Multi-Round Debate Arguments */}
      <DebateRoundView argumentsList={report.arguments || []} />

      {/* 4. Complete Evidence List */}
      <EvidenceList evidence={report.evidence || []} />
    </div>
  );
}

