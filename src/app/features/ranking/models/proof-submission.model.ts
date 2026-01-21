import type { ReviewDecision } from './review-decision.model';

export type SubmissionStatus = 'SEM_COMPROVACAO' | 'PENDENTE_AVALIACAO' | 'CONCLUIDA';

export interface ProofSubmission {
  id: string;
  activityId: string;
  unitId: string;
  status: SubmissionStatus;
  descricaoComprovacao?: string;
  imageId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  pontuacaoAprovada?: number;
  pontuacaoBonusAprovada?: number;
  review?: ReviewDecision;
}
