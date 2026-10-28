import React from 'react';
import { Shield, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/40 py-8 mt-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">FactVerify AI</span> — Multi-Agent Fact Verification System
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-center md:text-right max-w-xl">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Shared Deployment Notice: Verification reports are publicly accessible within this workspace. Do not submit private, confidential, or sensitive personal data.
          </span>
        </div>
      </div>
    </footer>
  );
}

