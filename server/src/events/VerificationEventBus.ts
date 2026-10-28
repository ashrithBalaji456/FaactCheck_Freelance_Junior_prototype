import EventEmitter from 'events';

export interface ProgressEventPayload {
  verificationId: string;
  eventType: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class VerificationEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow large number of SSE client listeners without warning
    this.setMaxListeners(200);
  }

  emitProgress(payload: ProgressEventPayload): void {
    this.emit(`verification:${payload.verificationId}`, payload);
    this.emit('all_events', payload);
  }

  subscribe(verificationId: string, listener: (payload: ProgressEventPayload) => void): void {
    this.on(`verification:${verificationId}`, listener);
  }

  unsubscribe(verificationId: string, listener: (payload: ProgressEventPayload) => void): void {
    this.off(`verification:${verificationId}`, listener);
  }
}

export const eventBus = new VerificationEventBus();

