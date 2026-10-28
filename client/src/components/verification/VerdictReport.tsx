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
      {/* 1. Main Verdict Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            report.verdict === 'TRUE'
              ? 'bg-emerald-500'
              : report.verdict === 'FALSE'
              ? 'bg-rose-500'
              : report.verdict === 'PARTIALLY_TRUE'
              ? 'bg-amber-500'
              : 'bg-slate-500'
          }`}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Final Fact Verification Verdict
            </span>
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={report.verdict} size="lg" />
              {report.confidenceScore != null && (
                <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300">
                  <span className="text-slate-400">Confidence:</span>{' '}
                  <span className="font-bold text-white font-mono">
                    {formatConfidence(report.confidenceScore)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Duration: {formatDuration(report.processingDurationMs)}</span>
            </div>
            <span>•</span>
            <div>{formatDate(report.completedAt || report.createdAt)}</div>
          </div>
        </div>

        {/* Claim Text */}
        <div className="mt-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
              >
                <span>Submitted source reference: {report.sourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Judicial Summary & Explanation */}
        {report.summary && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Executive Finding
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {report.summary}
              </p>
            </div>

            {report.explanation && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Judicial Rationale & Evidence Weighing
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {report.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Caveats or Warnings */}
        {hasCaveats && (
          <div className="mt-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Important Nuances & Caveats Identified by Judge</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-200/90 pl-1">
              {report.judgeReport?.caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence Notice / Calibration Disclaimer */}
        <div className="mt-6 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Model Confidence Notice: The confidence score represents the AI model's internal assessment of evidence clarity, not a statistically calibrated empirical probability.
          </span>
        </div>
      </div>

      {/* 2. Fact-Checker Audit Panel */}
      {report.factCheckerReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Agent 5: Fact-Checker Audit & Citation Integrity
              </h3>
            </div>
            {citationAudit && (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                Citation Validity: {Math.round(citationAudit.citationValidityRatio * 100)}%
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {report.factCheckerReport.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Supported Assertions</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside pl-1">
                {(report.factCheckerReport.supportedClaims || []).map((sc, i) => (
                  <li key={i}>{sc}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Overstated / Contested Points</span>
              </div>
              {(report.factCheckerReport.unsupportedOrOverstatedClaims || []).length > 0 ? (
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside pl-1">
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

