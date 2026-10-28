import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <ShieldAlert className="w-12 h-12 text-emerald-400 mx-auto" />
      <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
      <p className="text-sm text-slate-400">
        The requested verification dossier or page does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors mt-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}

