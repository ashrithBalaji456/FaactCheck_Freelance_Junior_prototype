export interface IVerificationEvent {
  id: string;
  _id: string;
  verificationId: string;
  eventType: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
