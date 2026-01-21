export interface Activity {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFinal: string;
  pontuacao: number;
  pontuacaoBonus?: number;
  createdAt: string;
  updatedAt: string;
}
