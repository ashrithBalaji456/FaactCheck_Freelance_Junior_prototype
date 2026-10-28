import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Search,
  FileText,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { VerificationStreamEvent } from '../../types';

interface VerificationTimelineProps {
  events: VerificationStreamEvent[];
  isCompleted: boolean;
  isFailed: boolean;
  failureMessage?: string | null;
}

interface StepDefinition {
  id: string;
  label: string;
  description: string;
  eventStart: string;
  eventEnd: string;
  icon: React.ElementType;
}

const TIMELINE_STEPS: StepDefinition[] = [
  {
    id: 'received',
    label: 'Claim Received',
    description: 'Claim registered and queued for investigation',
    eventStart: 'verification.started',
    eventEnd: 'verification.started',
    icon: FileText,
  },
  {
    id: 'claim_analysis',
    label: 'Claim Analysis (Agent 1)',
    description: 'Decomposing claim syntax, entities, and search queries',
    eventStart: 'claim_analysis.started',
    eventEnd: 'claim_analysis.completed',
    icon: Search,
  },
  {
    id: 'evidence_search',
    label: 'Evidence Discovery (Agent 2)',
    description: 'Retrieving authoritative primary and secondary web sources',
    eventStart: 'evidence_search.started',
    eventEnd: 'evidence_search.completed',
    icon: Search,
  },
  {
    id: 'debate_r1',
    label: 'Debate Round 1 (Agents 3 & 4)',
    description: 'Supporter & Opponent initial evidence arguments',
    eventStart: 'agent.started',
    eventEnd: 'debate.round.completed',
    icon: Users,
  },
  {
    id: 'fact_check',
    label: 'Fact-Checker Audit (Agent 5)',
    description: 'Verifying citation integrity and detecting overstatements',
    eventStart: 'fact_check.started',
    eventEnd: 'fact_check.completed',
    icon: Scale,
  },
  {
    id: 'judge',
    label: 'Judicial Deliberation (Agent 6)',
    description: 'Deliberating evidence weight and formulating final verdict',
    eventStart: 'judge.started',
    eventEnd: 'judge.completed',
    icon: ShieldCheck,
  },
  {
    id: 'final_report',
    label: 'Final Report Generated',
    description: 'Transparent cited report ready for review',
    eventStart: 'verification.completed',
    eventEnd: 'verification.completed',
    icon: CheckCircle2,
  },
];

export function VerificationTimeline({
  events,
  isCompleted,
  isFailed,
  failureMessage,
}: VerificationTimelineProps) {
  const eventTypes = events.map((e) => e.eventType);

  const getStepStatus = (step: StepDefinition, index: number) => {
    if (isFailed) {
      if (eventTypes.includes(step.eventEnd)) return 'completed';
      if (eventTypes.includes(step.eventStart)) return 'failed';
      return 'pending';
    }

    if (step.id === 'final_report') {
      return isCompleted ? 'completed' : 'pending';
    }

    if (eventTypes.includes(step.eventEnd)) {
      return 'completed';
    }
    if (eventTypes.includes(step.eventStart)) {
      return 'active';
    }

    // If a subsequent step has started, this step is finished
    const hasLaterStarted = TIMELINE_STEPS.slice(index + 1).some((s) =>
      eventTypes.includes(s.eventStart)
    );
    if (hasLaterStarted) return 'completed';

    return 'pending';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Live Multi-Agent Pipeline</span>
            {!isCompleted && !isFailed && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time server events streaming directly from the orchestrator
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
          {events.length} events logged
        </div>
      </div>

      <div className="space-y-4">
        {TIMELINE_STEPS.map((step, idx) => {
          const status = getStepStatus(step, idx);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                status === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                  : status === 'active'
                  ? 'bg-slate-800/60 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/20'
                  : status === 'failed'
                  ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-75'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : status === 'active' ? (
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin motion-reduce:animate-none" />
                ) : status === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{step.label}</span>
                  </div>
                  <span className="text-[11px] font-mono capitalize text-slate-400">
                    {status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}

        {isFailed && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs">
            <span className="font-semibold text-rose-300">Failure:</span> {failureMessage || 'Verification could not be completed.'}
          </div>
        )}
      </div>
    </div>
  );
}

