import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, History, Home, Sparkles } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white hover:opacity-95 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="flex items-center gap-2">
            FactVerify
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono uppercase tracking-wider">
              AI
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/')
                ? 'bg-slate-800/80 text-emerald-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/history')
                ? 'bg-slate-800/80 text-emerald-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Verification History</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

