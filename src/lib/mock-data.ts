import { 
  UserProfile, 
  OperationType, 
  ScheduleLegend, 
  HomicideAlert, 
  MonthlySchedule, 
  MonthlyTarget,
  OperationExecutionLog,
  EscalaMilitar
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

// LISTA DE 43 MILITARES CADASTRADOS PARA A ESCALA
export const INITIAL_ESCALA_MILITARES: EscalaMilitar[] = [
  { id: 'mil-1', ordem: 1, graduacao: 'TEN', nome_guerra: 'BRITO', numero_pm: '139.093-9', equipe_padrao: 'CPU', ativo: true },
  { id: 'mil-2', ordem: 2, graduacao: 'CB', nome_guerra: 'ANDRÉ', numero_pm: '170.377-6', equipe_padrao: 'ALFA 1', ativo: true },
  { id: 'mil-3', ordem: 3, graduacao: 'SGT', nome_guerra: 'VILELLA', numero_pm: '145.794-4', equipe_padrao: 'ALFA 2', ativo: true },
  { id: 'mil-4', ordem: 4, graduacao: 'SD', nome_guerra: 'ELLEN THALITA', numero_pm: '178.264-8', equipe_padrao: 'REDS 1', ativo: true },
  { id: 'mil-5', ordem: 5, graduacao: 'CB', nome_guerra: 'RAMOS', numero_pm: '173.594-3', equipe_padrao: 'ALFA 1', ativo: true },
  { id: 'mil-6', ordem: 6, graduacao: 'SGT', nome_guerra: 'CLÉSIO', numero_pm: '134.313-6', equipe_padrao: 'BRAVO 1', ativo: true },
  { id: 'mil-7', ordem: 7, graduacao: 'SGT', nome_guerra: 'UANDES', numero_pm: '147.326-3', equipe_padrao: 'BRAVO 2', ativo: true },
  { id: 'mil-8', ordem: 8, graduacao: 'SGT', nome_guerra: 'CLEBER', numero_pm: '154.704-1', equipe_padrao: 'CHARLIE 1', ativo: true },
  { id: 'mil-9', ordem: 9, graduacao: 'SGT', nome_guerra: 'HEVERTON', numero_pm: '140.067-0', equipe_padrao: 'CHARLIE 2', ativo: true },
  { id: 'mil-10', ordem: 10, graduacao: 'CB', nome_guerra: 'BISPO', numero_pm: '174.086-9', equipe_padrao: 'ALFA 2', ativo: true },
  { id: 'mil-11', ordem: 11, graduacao: 'SGT', nome_guerra: 'NAILSON', numero_pm: '143.837-3', equipe_padrao: 'SOF ALFA 1', ativo: true },
  { id: 'mil-12', ordem: 12, graduacao: 'CB', nome_guerra: 'MULLER', numero_pm: '174.226-1', equipe_padrao: 'BRAVO 1', ativo: true },
  { id: 'mil-13', ordem: 13, graduacao: 'SGT', nome_guerra: 'PEREIRA', numero_pm: '145.708-4', equipe_padrao: 'SOF BRAVO 1', ativo: true },
  { id: 'mil-14', ordem: 14, graduacao: 'CB', nome_guerra: 'MACIEL', numero_pm: '175.348-2', equipe_padrao: 'BRAVO 2', ativo: true },
  { id: 'mil-15', ordem: 15, graduacao: 'SGT', nome_guerra: 'ELDER', numero_pm: '157.768-3', equipe_padrao: 'PATRULHA RURAL 1', ativo: true },
  { id: 'mil-16', ordem: 16, graduacao: 'SD', nome_guerra: 'LUCAS', numero_pm: '179.095-5', equipe_padrao: 'CHARLIE 1', ativo: true },
  { id: 'mil-17', ordem: 17, graduacao: 'SD', nome_guerra: 'MARTINS', numero_pm: '177.635-0', equipe_padrao: 'CHARLIE 2', ativo: true },
  { id: 'mil-18', ordem: 18, graduacao: 'CB', nome_guerra: 'SANTOS', numero_pm: '175.390-4', equipe_padrao: 'PATRULHA RURAL 2', ativo: true },
  { id: 'mil-19', ordem: 19, graduacao: 'SGT', nome_guerra: 'NERIS', numero_pm: '145.362-0', equipe_padrao: 'ALFA 1', ativo: true },
  { id: 'mil-20', ordem: 20, graduacao: 'CB', nome_guerra: 'BRUNO', numero_pm: '161.522-8', equipe_padrao: 'ALFA 2', ativo: true },
  { id: 'mil-21', ordem: 21, graduacao: 'CB', nome_guerra: 'FRANTHESCO', numero_pm: '158.659-3', equipe_padrao: 'BRAVO 1', ativo: true },
  { id: 'mil-22', ordem: 22, graduacao: 'SGT', nome_guerra: 'PEDROSA', numero_pm: '156.332-9', equipe_padrao: 'MP 1', ativo: true },
  { id: 'mil-23', ordem: 23, graduacao: 'ST', nome_guerra: 'JESUS', numero_pm: '074.516-6', equipe_padrao: 'ADM', ativo: true },
  { id: 'mil-24', ordem: 24, graduacao: 'SD', nome_guerra: 'RAÍSSA', numero_pm: '177.661-6', equipe_padrao: 'REDS 2', ativo: true },
  { id: 'mil-25', ordem: 25, graduacao: 'SGT', nome_guerra: 'MACHADO', numero_pm: '130.438-5', equipe_padrao: 'PATRULHA RURAL DIA', ativo: true },
  { id: 'mil-26', ordem: 26, graduacao: 'CB', nome_guerra: 'PABLO', numero_pm: '173.827-7', equipe_padrao: 'CHARLIE 1', ativo: true },
  { id: 'mil-27', ordem: 27, graduacao: 'SGT', nome_guerra: 'ANDRE SANTOS', numero_pm: '157.842-6', equipe_padrao: 'ADM', ativo: true },
  { id: 'mil-28', ordem: 28, graduacao: 'SGT', nome_guerra: 'ALVES', numero_pm: '168.625-2', equipe_padrao: 'MP 2', ativo: true },
  { id: 'mil-29', ordem: 29, graduacao: 'SGT', nome_guerra: 'JULIO', numero_pm: '152.171-5', equipe_padrao: 'RPPM', ativo: true },
  { id: 'mil-30', ordem: 30, graduacao: 'CB', nome_guerra: 'BARBOSA', numero_pm: '158.736-9', equipe_padrao: 'BRAVO 2', ativo: true },
  { id: 'mil-31', ordem: 31, graduacao: 'CB', nome_guerra: 'DAMASCENO', numero_pm: '161.502-0', equipe_padrao: 'CHARLIE 2', ativo: true },
  { id: 'mil-32', ordem: 32, graduacao: 'SGT', nome_guerra: 'SHAKIN', numero_pm: '156.629-8', equipe_padrao: 'SOF ALFA 2', ativo: true },
  { id: 'mil-33', ordem: 33, graduacao: 'SGT', nome_guerra: 'OLIVEIRA', numero_pm: '141.421-8', equipe_padrao: 'PATRULHA ESCOLAR', ativo: true },
  { id: 'mil-34', ordem: 34, graduacao: 'CB', nome_guerra: 'OLIVEIRA', numero_pm: '170.084-8', equipe_padrao: 'ALFA 1', ativo: true },
  { id: 'mil-35', ordem: 35, graduacao: 'CB', nome_guerra: 'ASSUNÇÃO', numero_pm: '159.197-3', equipe_padrao: 'ALFA 2', ativo: true },
  { id: 'mil-36', ordem: 36, graduacao: 'SGT', nome_guerra: 'RAFAEL', numero_pm: '150.131-1', equipe_padrao: 'SOF BRAVO 2', ativo: true },
  { id: 'mil-37', ordem: 37, graduacao: 'SD', nome_guerra: 'CALDEIRA', numero_pm: '181.691-7', equipe_padrao: 'BRAVO 1', ativo: true },
  { id: 'mil-38', ordem: 38, graduacao: 'SGT', nome_guerra: 'VANDERLAN', numero_pm: '121.737-1', equipe_padrao: 'PATRULHA RURAL 1', ativo: true },
  { id: 'mil-39', ordem: 39, graduacao: 'SGT', nome_guerra: 'CLEUSA', numero_pm: '139.061-6', equipe_padrao: 'ADM', ativo: true },
  { id: 'mil-40', ordem: 40, graduacao: 'SGT', nome_guerra: 'CARDOSO', numero_pm: '111.737-3', equipe_padrao: 'PATRULHA RURAL 2', ativo: true },
  { id: 'mil-41', ordem: 41, graduacao: 'CB', nome_guerra: 'WILLIAN', numero_pm: '171.875-8', equipe_padrao: 'CHARLIE 1', ativo: true },
  { id: 'mil-42', ordem: 42, graduacao: 'SGT', nome_guerra: 'GUILHERME', numero_pm: '149.164-6', equipe_padrao: 'BRAVO 2', ativo: true },
  { id: 'mil-43', ordem: 43, graduacao: 'CB', nome_guerra: 'ALMEIDA', numero_pm: '159.288-0', equipe_padrao: 'CHARLIE 2', ativo: true }
];

// INFORMAÇÕES OPERACIONAIS ZERADAS
export const INITIAL_MONTHLY_TARGETS: MonthlyTarget[] = [];
export const INITIAL_LOGS: OperationExecutionLog[] = [];
export const INITIAL_ALERTS: HomicideAlert[] = [];

export function generateSampleSchedule(mes: number = 8, ano: number = 2026): MonthlySchedule {
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const militares = INITIAL_ESCALA_MILITARES;
  const items = [];

  for (const mil of militares) {
    for (let d = 1; d <= daysInMonth; d++) {
      // Padrão de escala alternada realista (1 dia de serviço para cada 2 ou 3 dias)
      const isServico = ((d + mil.ordem) % 3 === 0);
      const isNoturno = ((d + mil.ordem) % 6 === 0);

      items.push({
        id: `item-${mil.id}-${d}`,
        escala_id: `sch-${mes}-${ano}`,
        equipe: mil.equipe_padrao || 'ALFA 1',
        militar_id: mil.id,
        militar_nome: `${mil.graduacao} ${mil.nome_guerra}`,
        militar_numero_pm: mil.numero_pm,
        dia_mes: d,
        legenda_codigo: isNoturno ? 'SN' : (isServico ? 'S' : 'F')
      });
    }
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
