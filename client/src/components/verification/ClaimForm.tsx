import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useSubmitVerification } from '../../hooks/useVerification';

const EXAMPLE_CLAIMS = [
  "India's Constitution came into effect on 26 January 1950.",
  "The James Webb Space Telescope detected liquid water oceans on Kepler-452b.",
  "High-dose Vitamin C cures active coronavirus infections within 24 hours.",
  "Alexander Fleming discovered penicillin in 1928 at St Mary's Hospital, London.",
];

export function ClaimForm() {
  const navigate = useNavigate();
  const [claim, setClaim] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [debateRounds, setDebateRounds] = useState(2);
  const [formError, setFormError] = useState<string | null>(null);

  const submitMutation = useSubmitVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedClaim = claim.trim();
    if (!trimmedClaim) {
      setFormError('Please enter a factual claim to verify.');
      return;
    }
    if (trimmedClaim.length < 5) {
      setFormError('Claim must be at least 5 characters long.');
      return;
    }

    setFormError(null);

    try {
      const result = await submitMutation.mutateAsync({
        claim: trimmedClaim,
        sourceUrl: sourceUrl.trim() || null,
        debateRounds,
      });

      navigate(`/verifications/${result.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please check network.');
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 shadow-sm shadow-emerald-500/40" />

        {formError && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2.5">
              Factual Claim to Investigate
            </label>
            <textarea
              value={claim}
              onChange={(e) => {
                setClaim(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. India's Constitution came into effect on 26 January 1950..."
              rows={3}
              required
              disabled={submitMutation.isPending}
              className="w-full glass-inset border border-white/10 rounded-2xl p-4 text-slate-100 placeholder:text-slate-500 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Reference Source URL (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article"
                disabled={submitMutation.isPending}
                className="w-full glass-inset border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Debate Depth
              </label>
              <select
                value={debateRounds}
                onChange={(e) => setDebateRounds(Number(e.target.value))}
                disabled={submitMutation.isPending}
                className="w-full glass-inset border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all disabled:opacity-60 cursor-pointer bg-slate-950"
              >
                <option value={1} className="bg-slate-900 text-slate-100">1 Round (Fast)</option>
                <option value={2} className="bg-slate-900 text-slate-100">2 Rounds (Standard)</option>
                <option value={3} className="bg-slate-900 text-slate-100">3 Rounds (Deep Inquiry)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending || !claim.trim()}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-emerald-400/30"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing Multi-Agent Pipeline...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify Claim with AI Agents</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Explore with Example Claims</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLE_CLAIMS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setClaim(ex);
                if (formError) setFormError(null);
              }}
              disabled={submitMutation.isPending}
              className="text-left p-3.5 glass-card glass-card-hover rounded-xl text-xs text-slate-300 hover:text-white transition-all cursor-pointer leading-relaxed border border-white/[0.06] flex items-start gap-2"
            >
              <span className="text-emerald-400 font-bold shrink-0">→</span>
              <span>"{ex}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

