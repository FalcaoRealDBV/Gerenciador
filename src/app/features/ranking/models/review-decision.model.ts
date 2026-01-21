export type ReviewOutcome = 'APROVADO' | 'REPROVADO';

export interface ReviewDecision {
  reviewerId: string;
  outcome: ReviewOutcome;
  pontuacaoAjustada?: number;
  pontuacaoBonusAjustada?: number;
  justificativaAjuste?: string;
  justificativaReprovacao?: string;
  reviewedAt: string;
}
