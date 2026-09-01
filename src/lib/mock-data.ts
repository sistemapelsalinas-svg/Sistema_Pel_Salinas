import { 
  UserProfile, 
  OperationType, 
  ScheduleLegend, 
  HomicideAlert, 
  MonthlySchedule, 
  MonthlyTarget,
  OperationExecutionLog 
} from './types';

export const DEFAULT_TEAMS = [
  'SOF ALFA 1',
  'SOF ALFA 2',
  'SOF BRAVO 1',
  'SOF BRAVO 2',
  'REDS 1',
  'REDS 2',
  'ADM',
  'ALFA 1',
  'ALFA 2',
  'BRAVO 1',
  'BRAVO 2',
  'CHARLIE 1',
  'CHARLIE 2',
  'MP 1',
  'MP 2',
  'PATRULHA RURAL 1',
  'PATRULHA RURAL 2',
  'PATRULHA RURAL DIA',
  'RPPM',
  'PATRULHA ESCOLAR',
  'CPU'
];

export const TARGET_TEAMS = DEFAULT_TEAMS;

export const DEFAULT_LEGENDS: ScheduleLegend[] = [
  { codigo: 'S', descricao: 'Serviço Operacional / Turno Normal', conta_como_servico: true, cor_badge: 'bg-emerald-600 text-white' },
  { codigo: 'SN', descricao: 'Serviço Noturno', conta_como_servico: true, cor_badge: 'bg-blue-600 text-white' },
  { codigo: 'F', descricao: 'Folga', conta_como_servico: false, cor_badge: 'bg-slate-600 text-slate-200' },
  { codigo: 'FA', descricao: 'Férias Anuais', conta_como_servico: false, cor_badge: 'bg-amber-600 text-white' },
  { codigo: 'L', descricao: 'Licença Especial / Saúde', conta_como_servico: false, cor_badge: 'bg-purple-600 text-white' },
  { codigo: 'DISP', descricao: 'Dispensa Recompensa / Administrativa', conta_como_servico: false, cor_badge: 'bg-indigo-600 text-white' },
  { codigo: 'CUR', descricao: 'Curso / Treinamento', conta_como_servico: true, cor_badge: 'bg-teal-600 text-white' },
  { codigo: 'A', descricao: 'Atestado Médico', conta_como_servico: false, cor_badge: 'bg-rose-600 text-white' }
];

export const INITIAL_OPERATIONS: OperationType[] = [
  // 1. POG
  {
    id: 'op-pog-1',
    grupo: 'POG',
    codigo_natureza: 'Y04009',
    titulo: 'Trânsito Seguro',
    descricao: 'Fiscalização de trânsito rodoviário e urbano, abordagens a veículos e condutores.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-pog-2',
    grupo: 'POG',
    codigo_natureza: 'Y07001',
    titulo: 'Batida Policial',
    descricao: 'Ação tática e repressiva com foco na apreensão de armas, drogas e foragidos em pontos quentes.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-pog-3',
    grupo: 'POG',
    codigo_natureza: 'Y07002',
    titulo: 'Operação Presença',
    descricao: 'Posicionamento estratégico da viatura e patrulhamento a pé para dissuasão delitiva.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-pog-4',
    grupo: 'POG',
    codigo_natureza: 'Y07003',
    titulo: 'Incursão em ZQC',
    descricao: 'Ação qualificada em Zona Quente de Criminalidade para saturação e abordagens.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-pog-5',
    grupo: 'POG',
    codigo_natureza: 'Y07010',
    titulo: 'Divisas Seguras',
    descricao: 'Operação em corredores de acesso e divisas municipais/estaduais.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-pog-6',
    grupo: 'POG',
    codigo_natureza: 'Y07001-MBA',
    titulo: 'Cumprimento de Busca e Apreensão',
    descricao: 'Execução de Mandados Judiciais de Busca e Apreensão de Objetos/Armas/Animais.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },

  // 2. POLICIAMENTO DE PROXIMIDADE
  {
    id: 'op-prox-1',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15001',
    titulo: 'Patrulha Escolar / PROERD',
    descricao: 'Ações de segurança e prevenção em educandários e mediações escolares.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-prox-2',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15010',
    titulo: 'Patrulha Rural',
    descricao: 'Patrulhamento preventivo, cadastramento de propriedades e visitas na zona rural.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    area_rural_obrigatoria: true,
    ativo: true
  },
  {
    id: 'op-prox-3',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15020',
    titulo: 'GEPAR',
    descricao: 'Grupo Especializado de Policiamento em Áreas de Risco.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-prox-4',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15052',
    titulo: 'BSC - Base de Segurança Comunitária',
    descricao: 'Ponto focal comunitário, atendimento ao cidadão e registro imediato.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-prox-5',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'A20003',
    titulo: 'RPPM - Rede de Proteção Preventiva',
    descricao: 'Visitas e contatos com integrantes da Rede de Proteção Preventiva Mulher.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-prox-6',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'A20014',
    titulo: 'RPPM - Ronda e Acompanhamento',
    descricao: 'Ronda preventiva e fiscalização de medidas protetivas de urgência.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },

  // 3. INTERAÇÕES COMUNITÁRIAS
  {
    id: 'op-int-1',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A21.007',
    titulo: 'VCP — Visita Comunitária Preventiva',
    descricao: 'Contato com morador ou liderança. Mínimo 1 envolvido + orientações de autoproteção e demanda identificada.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 1,
    ativo: true
  },
  {
    id: 'op-int-2',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A19.000',
    titulo: 'RC — Reunião Comunitária',
    descricao: 'Reunião formal com a comunidade. Mínimo 3 envolvidos + entidade, pauta e encaminhamentos.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 3,
    ativo: true
  },
  {
    id: 'op-int-3',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A19.001',
    titulo: 'RCR — Reunião Comunitária Rural',
    descricao: 'Reunião em comunidade rural. Mínimo 3 envolvidos + obrigatório endereço em área rural.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 3,
    area_rural_obrigatoria: true,
    ativo: true
  },
  {
    id: 'op-int-4',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A19.006',
    titulo: 'MRPP — Manutenção de Rede de Proteção',
    descricao: 'Encontro com integrantes de Redes Protegidas. Mínimo 3 membros + rede atendida e providências.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 3,
    ativo: true
  },
  {
    id: 'op-int-5',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A20.028',
    titulo: 'VT — Visita Tranquilizadora (Furto)',
    descricao: 'Visita à vítima de furto. OBRIGATÓRIO informar o número do REDS de origem do delito.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: true,
    min_envolvidos: 1,
    ativo: true
  },
  {
    id: 'op-int-6',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A20.001',
    titulo: 'VTCV — Visita Tranquilizadora (Crime Violento)',
    descricao: 'Visita à vítima de crime violento (roubo/agressão grave). OBRIGATÓRIO informar o número do REDS de origem.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: true,
    min_envolvidos: 1,
    ativo: true
  },

  // 4. ORDENS DE SERVIÇO (OS)
  {
    id: 'op-os-1',
    grupo: 'ORDENS_SERVICO',
    codigo_natureza: 'OS 3.028/2025',
    titulo: 'Operação Visibilidade Institucional',
    descricao: 'Presença ostensiva em pontos estratégicos de Salinas (Praça Cel Ramos, Av. Antônio Carlos, Trevo).',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-os-2',
    grupo: 'ORDENS_SERVICO',
    codigo_natureza: 'OS 3.038/2026',
    titulo: 'Enfrentamento a Homicídios (Bares e Similares)',
    descricao: 'Ordem de Serviço nº 3.038/2026-2ª Cia PM IND — Fiscalização qualificada em estabelecimentos com histórico de violência.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    ativo: true
  },
  {
    id: 'op-os-3',
    grupo: 'ORDENS_SERVICO',
    codigo_natureza: 'OS AGROGERAIS',
    titulo: 'Operação Agrogerais Segura',
    descricao: 'Ações coordenadas de segurança no campo, patrulhamento em fazendas e combate a furto de insumos.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    area_rural_obrigatoria: true,
    ativo: true
  }
];

// ÚNICO USUÁRIO INICIAL: Sgt André Santos (Administrador)
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-andre-1',
    numero_pm: '1578426',
    nome_completo: 'André Santos',
    nome_guerra: 'Sgt André Santos',
    graduacao: '3º Sgt',
    whatsapp: '38999990001',
    password_hash: 'pmmg1234',
    role: 'ADMIN',
    equipe_padrao: 'ADM',
    primeiro_acesso: false,
    ativo: true,
    created_at: new Date().toISOString()
  }
];

// INFORMAÇÕES OPERACIONAIS ZERADAS
export const INITIAL_MONTHLY_TARGETS: MonthlyTarget[] = [];
export const INITIAL_LOGS: OperationExecutionLog[] = [];
export const INITIAL_ALERTS: HomicideAlert[] = [];

export function generateSampleSchedule(mes: number = 8, ano: number = 2026): MonthlySchedule {
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const user = INITIAL_USERS[0];
  const items = [];

  for (let d = 1; d <= daysInMonth; d++) {
    items.push({
      id: `item-${user.id}-${d}`,
      escala_id: `sch-${mes}-${ano}`,
      equipe: user.equipe_padrao || 'ADM',
      militar_id: user.id,
      militar_nome: user.nome_guerra,
      militar_numero_pm: user.numero_pm,
      dia_mes: d,
      legenda_codigo: (d % 3 === 1) ? 'S' : 'F'
    });
  }

  return {
    id: `sch-${mes}-${ano}`,
    mes,
    ano,
    titulo: `Escala Operacional — ${mes.toString().padStart(2, '0')}/${ano}`,
    status: 'PUBLICADA',
    itens: items,
    created_at: new Date().toISOString()
  };
}
