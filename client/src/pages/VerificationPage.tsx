import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVerification } from '../hooks/useVerification';
import { useVerificationStream } from '../hooks/useVerificationStream';
import { VerificationTimeline } from '../components/verification/VerificationTimeline';
import { VerdictReport } from '../components/verification/VerdictReport';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { ArrowLeft, RefreshCw, AlertCircle, Share2, Check } from 'lucide-react';
import { VerificationStreamEvent } from '../types';

export function VerificationPage() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const {
    data: report,
    isLoading: isFetchingReport,
    error: fetchError,
    refetchVerification,
  } = useVerification(id);

  const { events, isConnected, isCompleted, error: streamError } = useVerificationStream({
    verificationId: id || '',
    onEvent: (event: VerificationStreamEvent) => {
      // If an agent finished or round completed, refresh report data
      if (
        event.eventType === 'agent.completed' ||
        event.eventType === 'debate.round.completed' ||
        event.eventType === 'fact_check.completed'
      ) {
        refetchVerification();
      }
    },
    onCompleted: () => {
      refetchVerification();
    },
    onFailed: () => {
      refetchVerification();
    },
  });

  const isFinished = report?.status === 'COMPLETED' || isCompleted;
  const isFailed = report?.status === 'FAILED' || !!streamError;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isFetchingReport && !report) {
    return <LoadingSpinner label="Loading verification dossier..." size="lg" />;
  }

  if (fetchError || !report) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <ErrorBanner
          message={(fetchError as any)?.message || 'Verification record not found.'}
          code="NOT_FOUND"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Claim Verification</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchVerification()}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-xs flex items-center gap-1.5"
            title="Refresh Report Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-xs flex items-center gap-1.5"
            title="Copy Report Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Timeline Display (Shown prominently while running, collapsible/retained when complete) */}
      <VerificationTimeline
        events={events}
        isCompleted={isFinished}
        isFailed={isFailed}
        failureMessage={report.failureMessage || streamError}
      />

      {/* Final Detailed Report (Rendered when completed or partially available) */}
      {isFinished ? (
        <VerdictReport report={report} />
      ) : isFailed ? (
        <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-rose-200">Verification Terminated</h3>
          <p className="text-xs text-rose-300 max-w-md mx-auto">
            {report.failureMessage || streamError || 'The orchestrator encountered an error while retrieving evidence.'}
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
          <p className="text-xs font-mono text-slate-400">
            Agents are currently evaluating sources and debating citations. Verdict report will assemble live above.
          </p>
        </div>
      )}
    </div>
  );
}
