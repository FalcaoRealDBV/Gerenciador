import type { Activity, ProofSubmission, Unit } from '@/features/ranking/models';

export const unitsSeed: Unit[] = [
  { id: 'aguia-dourada', name: 'Águia Dourada' },
  { id: 'morcegos', name: 'Morcegos' },
  { id: 'harpia', name: 'Hárpia' },
  { id: 'panda', name: 'Panda' },
  { id: 'dente-de-sabre', name: 'Dente de Sabre' },
  { id: 'pantera', name: 'Pantera' }
];

export const activitiesSeed: Activity[] = [
  {
    id: 'act-1',
    nome: 'Acampamento de Integração',
    descricao: 'Participacao no acampamento anual com foco em trabalho em equipe.',
    dataInicio: '2026-02-10',
    dataFinal: '2026-02-12',
    pontuacao: 200,
    pontuacaoBonus: 40,
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z'
  },
  {
    id: 'act-2',
    nome: 'Projeto de Service Comunitario',
    descricao: 'Execucao de uma acao social registrada pela unidade.',
    dataInicio: '2026-03-01',
    dataFinal: '2026-03-31',
    pontuacao: 150,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z'
  },
  {
    id: 'act-3',
    nome: 'Especialidade em Primeiros Socorros',
    descricao: 'Conclusao da especialidade com registro fotográfico.',
    dataInicio: '2026-01-20',
    dataFinal: '2026-02-20',
    pontuacao: 120,
    pontuacaoBonus: 30,
    createdAt: '2026-01-08T13:30:00.000Z',
    updatedAt: '2026-01-08T13:30:00.000Z'
  },
  {
    id: 'act-4',
    nome: 'Trilha Noturna',
    descricao: 'Trilha guiada com checklist de segurança.',
    dataInicio: '2026-04-05',
    dataFinal: '2026-04-06',
    pontuacao: 90,
    createdAt: '2026-01-15T16:45:00.000Z',
    updatedAt: '2026-01-15T16:45:00.000Z'
  },
  {
    id: 'act-5',
    nome: 'Campanha de Arrecadacao',
    descricao: 'Mobilizacao para arrecadar alimentos e agasalhos.',
    dataInicio: '2026-05-01',
    dataFinal: '2026-05-20',
    pontuacao: 180,
    pontuacaoBonus: 20,
    createdAt: '2026-01-18T11:00:00.000Z',
    updatedAt: '2026-01-18T11:00:00.000Z'
  },
  {
    id: 'act-6',
    nome: 'Jornada de Lideranca',
    descricao: 'Capacitacao em lideranca para conselheiros.',
    dataInicio: '2026-02-15',
    dataFinal: '2026-02-16',
    pontuacao: 160,
    createdAt: '2026-01-20T08:20:00.000Z',
    updatedAt: '2026-01-20T08:20:00.000Z'
  }
];

export const submissionsSeed: ProofSubmission[] = [
  {
    id: 'sub-1',
    activityId: 'act-1',
    unitId: 'aguia-dourada',
    status: 'CONCLUIDA',
    descricaoComprovacao: 'Participamos com 12 desbravadores, fotos anexas.',
    submittedAt: '2026-02-13T18:00:00.000Z',
    reviewedAt: '2026-02-14T10:30:00.000Z',
    pontuacaoAprovada: 200,
    pontuacaoBonusAprovada: 40,
    review: {
      reviewerId: 'diretoria',
      outcome: 'APROVADO',
      pontuacaoAjustada: 200,
      pontuacaoBonusAjustada: 40,
      reviewedAt: '2026-02-14T10:30:00.000Z'
    }
  },
  {
    id: 'sub-2',
    activityId: 'act-2',
    unitId: 'pantera',
    status: 'PENDENTE_AVALIACAO',
    descricaoComprovacao: 'Entrega realizada no bairro Jardim Azul.',
    submittedAt: '2026-03-20T21:10:00.000Z'
  },
  {
    id: 'sub-3',
    activityId: 'act-3',
    unitId: 'morcegos',
    status: 'CONCLUIDA',
    descricaoComprovacao: 'Equipe concluiu a especialidade com instrutor.',
    submittedAt: '2026-02-19T15:00:00.000Z',
    reviewedAt: '2026-02-20T09:00:00.000Z',
    pontuacaoAprovada: 120,
    pontuacaoBonusAprovada: 30,
    review: {
      reviewerId: 'diretoria',
      outcome: 'APROVADO',
      pontuacaoAjustada: 120,
      pontuacaoBonusAjustada: 30,
      reviewedAt: '2026-02-20T09:00:00.000Z'
    }
  },
  {
    id: 'sub-4',
    activityId: 'act-4',
    unitId: 'panda',
    status: 'SEM_COMPROVACAO',
    review: {
      reviewerId: 'diretoria',
      outcome: 'REPROVADO',
      justificativaReprovacao: 'Precisa enviar o checklist de seguranca preenchido.',
      reviewedAt: '2026-04-07T10:00:00.000Z'
    }
  },
  {
    id: 'sub-5',
    activityId: 'act-5',
    unitId: 'harpia',
    status: 'PENDENTE_AVALIACAO',
    descricaoComprovacao: 'Relatorio com fotos do ponto de coleta.',
    submittedAt: '2026-05-18T12:30:00.000Z'
  }
];
