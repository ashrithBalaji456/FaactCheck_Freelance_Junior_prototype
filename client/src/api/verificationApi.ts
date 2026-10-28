import { apiClient } from './client';
import {
  VerificationDetail,
  EvidenceItem,
  AgentArgumentItem,
  VerificationStreamEvent,
} from '../types';

export interface SubmitVerificationPayload {
  claim: string;
  sourceUrl?: string | null;
  debateRounds?: number;
}

export interface SubmitVerificationResponse {
  id: string;
  claim: string;
  status: string;
  statusUrl: string;
  eventsUrl: string;
}

export const verificationApi = {
  submit: (payload: SubmitVerificationPayload) =>
    apiClient<SubmitVerificationResponse>('/verifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getById: (id: string) =>
    apiClient<VerificationDetail>(`/verifications/${id}`),

  getEvidence: (id: string) =>
    apiClient<EvidenceItem[]>(`/verifications/${id}/evidence`),

  getDebate: (id: string) =>
    apiClient<AgentArgumentItem[]>(`/verifications/${id}/debate`),

  getEvents: (id: string) =>
    apiClient<VerificationStreamEvent[]>(`/verifications/${id}/events`),

  delete: (id: string) =>
    apiClient<void>(`/verifications/${id}`, {
      method: 'DELETE',
    }),
};

