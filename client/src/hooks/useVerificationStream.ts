import { useEffect, useState, useRef, useCallback } from 'react';
import { VerificationStreamEvent } from '../types';

interface UseVerificationStreamOptions {
  verificationId: string;
  onEvent?: (event: VerificationStreamEvent) => void;
  onCompleted?: () => void;
  onFailed?: (errorMsg: string) => void;
}

export function useVerificationStream({
  verificationId,
  onEvent,
  onCompleted,
  onFailed,
}: UseVerificationStreamOptions) {
  const [events, setEvents] = useState<VerificationStreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  const onCompletedRef = useRef(onCompleted);
  const onFailedRef = useRef(onFailed);

  onEventRef.current = onEvent;
  onCompletedRef.current = onCompleted;
  onFailedRef.current = onFailed;

  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!verificationId) return;

    const apiBase =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const streamUrl = `${apiBase}/verifications/${verificationId}/events/stream`;

    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    const handleEvent = (eventPayload: VerificationStreamEvent) => {
      setEvents((prev) => {
        // Prevent duplicate events
        const exists = prev.some(
          (e) =>
            e.eventType === eventPayload.eventType &&
            e.timestamp === eventPayload.timestamp &&
            e.message === eventPayload.message
        );
        if (exists) return prev;
        return [...prev, eventPayload];
      });

      if (onEventRef.current) {
        onEventRef.current(eventPayload);
      }

      if (eventPayload.eventType === 'verification.completed') {
        setIsCompleted(true);
        if (onCompletedRef.current) {
          onCompletedRef.current();
        }
        closeStream();
      } else if (eventPayload.eventType === 'verification.failed') {
        setError(eventPayload.message);
        if (onFailedRef.current) {
          onFailedRef.current(eventPayload.message);
        }
        closeStream();
      }
    };

    es.addEventListener('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    const knownEvents = [
      'verification.started',
      'claim_analysis.started',
      'claim_analysis.completed',
      'evidence_search.started',
      'evidence_search.completed',
      'agent.started',
      'agent.completed',
      'debate.round.completed',
      'fact_check.started',
      'fact_check.completed',
      'judge.started',
      'judge.completed',
      'verification.completed',
      'verification.failed',
    ];

    knownEvents.forEach((type) => {
      es.addEventListener(type, (e: MessageEvent) => {
        try {
          const data: VerificationStreamEvent = JSON.parse(e.data);
          handleEvent(data);
        } catch (err) {
          console.error('Error parsing SSE event payload:', err);
        }
      });
    });

    es.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      closeStream();
    };
  }, [verificationId, closeStream]);

  return {
    events,
    isConnected,
    isCompleted,
    error,
    closeStream,
  };
}

