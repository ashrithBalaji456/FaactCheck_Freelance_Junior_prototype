import React from 'react';
import { AgentArgumentItem } from '../../types';
import { AgentArgumentCard } from './AgentArgumentCard';
import { Swords } from 'lucide-react';

interface DebateRoundViewProps {
  argumentsList: AgentArgumentItem[];
}

export function DebateRoundView({ argumentsList }: DebateRoundViewProps) {
  // Group arguments by roundNumber
  const roundsMap = new Map<number, AgentArgumentItem[]>();
  for (const arg of argumentsList) {
    const list = roundsMap.get(arg.roundNumber) || [];
    list.push(arg);
    roundsMap.set(arg.roundNumber, list);
  }

  const rounds = Array.from(roundsMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Swords className="w-4 h-4 text-emerald-400" />
          <span>Multi-Round Competitive Debate ({argumentsList.length} Arguments)</span>
        </h3>
      </div>

      {rounds.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 border border-slate-800 rounded-xl">
          No debate rounds recorded yet.
        </div>
      ) : (
        <div className="space-y-8">
          {rounds.map(([roundNumber, args]) => (
            <div key={roundNumber} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  Round {roundNumber}
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {args.map((arg, idx) => (
                  <AgentArgumentCard key={arg.id || arg._id || idx} argument={arg} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

