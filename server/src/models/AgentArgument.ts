export type AgentRoleType = 'CLAIM_ANALYZER' | 'SUPPORTER' | 'OPPONENT' | 'FACT_CHECKER' | 'JUDGE';

export interface IAgentArgument {
  id: string;
  _id: string;
  verificationId: string;
  agentType: AgentRoleType;
  roundNumber: number;
  argument: string;
  reasoningSummary: string;
  evidenceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
