import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, code, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-lg bg-rose-950/60 border border-rose-800/80 p-4 text-rose-200 shadow-md">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">
          <div className="font-semibold text-rose-300">
            {code ? `Error (${code})` : 'System Notice'}
          </div>
          <div className="mt-1 text-rose-200/90">{message}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-semibold px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-100 rounded border border-rose-700/60 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

