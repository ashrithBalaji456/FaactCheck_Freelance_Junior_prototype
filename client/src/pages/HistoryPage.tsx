import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { VerdictBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import {
  Search,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  ShieldAlert,
} from 'lucide-react';

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, deleteVerification, isDeleting } = useHistory({
    page,
    limit: 10,
    searchQuery: activeSearch,
    verdictFilter,
  });

  const items = data?.items || [];
  const pagination = data?.pagination;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this verification report?')) {
      try {
        await deleteVerification(id);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Verification Archive</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and audit all completed multi-agent fact investigations.
          </p>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Verify New Claim</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims or summaries..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveSearch('');
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200"
          >
            Search
          </button>
        </form>

        {/* Verdict Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs overflow-x-auto w-full md:w-auto">
          {['ALL', 'TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNCERTAIN'].map((verdict) => (
            <button
              key={verdict}
              onClick={() => {
                setVerdictFilter(verdict);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                verdictFilter === verdict
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {verdict.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            Loading verification history...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p>No verification records match your filters.</p>
            {activeSearch && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveSearch('');
                  setVerdictFilter('ALL');
                }}
                className="text-emerald-400 hover:underline"
              >
                Reset search & filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {items.map((item) => {
              const id = item.id || item._id;
              return (
                <div
                  key={id}
                  className="p-4 sm:p-5 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <VerdictBadge verdict={item.verdict} size="sm" />
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <Link
                      to={`/verifications/${id}`}
                      className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors block line-clamp-2"
                    >
                      "{item.claim}"
                    </Link>

                    {item.summary && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      to={`/verifications/${id}`}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(id!)}
                      disabled={isDeleting}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/60 text-xs transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
            <div>
              Showing page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
              <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} total)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

