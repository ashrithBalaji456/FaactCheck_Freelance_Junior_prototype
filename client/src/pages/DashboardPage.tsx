import React from 'react';
import { Link } from 'react-router-dom';
import { ClaimForm } from '../components/verification/ClaimForm';
import { useHistory } from '../hooks/useHistory';
import { VerdictBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import { ArrowRight, History, Shield, Zap, Search } from 'lucide-react';

export function DashboardPage() {
  const { data: historyData, isLoading } = useHistory({ page: 1, limit: 5 });
  const recentItems = historyData?.items || [];

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Real-time Multi-Agent Competitive Inquiry</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Verify Facts Through{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
            Adversarial AI Debate
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Submit any factual claim. Opposing AI agents retrieve real web evidence, dispute citations, and undergo strict deterministic fact-checking before Chief Judge renders a definitive verdict.
        </p>
      </div>

      {/* Main Submission Form */}
      <div className="max-w-3xl mx-auto">
        <ClaimForm />
      </div>

      {/* Recent Verifications Section */}
      <div className="max-w-4xl mx-auto pt-6 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Recent Verifications
            </h2>
          </div>
          <Link
            to="/history"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View full archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Loading recent verifications...
          </div>
        ) : recentItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
            No claims verified yet. Enter a statement above to start the first multi-agent debate!
          </div>
        ) : (
          <div className="grid gap-3">
            {recentItems.map((item) => (
              <Link
                key={item.id || item._id}
                to={`/verifications/${item.id || item._id}`}
                className="group block p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                      "{item.claim}"
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.summary || 'Investigation underway or completed.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <VerdictBadge verdict={item.verdict} size="sm" />
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

