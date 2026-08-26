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

export const TARGET_TEAMS = [
  'ALFA',
  'BRAVO',
  'CHARLIE',
  'DELTA',
  'RURAL',
  'MP',
  'RPPM',
  'PATRULHA ESCOLAR'
];

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
    descricao: 'Fiscalização de trânsito rodoviário e urbano, abordagens a veículos e condutores para prevenção de sinistros e ilícitos.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
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
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
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
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-pog-4',
    grupo: 'POG',
    codigo_natureza: 'Y07003',
    titulo: 'Incursão em ZQC',
    descricao: 'Ação qualificada em Zona Quente de Criminalidade para saturação, fiscalização e abordagens.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-pog-5',
    grupo: 'POG',
    codigo_natureza: 'Y07010',
    titulo: 'Divisas Seguras',
    descricao: 'Operação em corredores de acesso e divisas municipais/estaduais contra o crime organizado.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
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
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },

  // 2. POLICIAMENTO DE PROXIMIDADE
  {
    id: 'op-prox-1',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15001',
    titulo: 'Patrulha Escolar / PROERD',
    descricao: 'Ações de segurança e prevenção em educandários e imediações escolares.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
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
    min_envolvidos: 0,
    area_rural_obrigatoria: true,
    ativo: true
  },
  {
    id: 'op-prox-3',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15020',
    titulo: 'GEPAR',
    descricao: 'Grupo Especializado de Policiamento em Áreas de Risco e Prevenção Ativa.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-prox-4',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'Y15052',
    titulo: 'BSC - Base de Segurança Comunitária',
    descricao: 'Ponto focal comunitário, atendimento ao cidadão e registro imediato de ocorrências.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-prox-5',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'A20003',
    titulo: 'RPPM - Rede de Proteção Preventiva',
    descricao: 'Visitas e contatos de proteção e orientação às mulheres vítimas de violência doméstica.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-prox-6',
    grupo: 'PROXIMIDADE',
    codigo_natureza: 'A20014',
    titulo: 'RPPM - Ronda e Acompanhamento',
    descricao: 'Fiscalização do cumprimento de Medidas Protetivas de Urgência expedidas pelo Judiciário.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },

  // 3. INTERAÇÕES COMUNITÁRIAS
  {
    id: 'op-int-1',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A21.007',
    titulo: 'VCP — Visita Comunitária Preventiva',
    descricao: 'Contato com líder comunitário ou morador. Obrigatório cadastrar pelo menos 1 envolvido e descrever a visita, orientações e demanda.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 1,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-int-2',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A19.000',
    titulo: 'RC — Reunião Comunitária',
    descricao: 'Reunião formal com comunidade/entidade. Obrigatório mínimo 3 envolvidos, informar entidade/comunidade, pauta e encaminhamentos.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 3,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-int-3',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A19.001',
    titulo: 'RCR — Reunião Comunitária Rural',
    descricao: 'Reunião em comunidade rural. Além dos 3 envolvidos, entidade, pauta e encaminhamentos, deve ocorrer obrigatoriamente em área rural.',
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
    titulo: 'MRPP — Manutenção de Rede de Proteção Preventiva',
    descricao: 'Encontro com integrantes de Redes Protegidas. Mínimo 3 integrantes, identificar qual rede foi atendida, assuntos e providências.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 3,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-int-5',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A20.028',
    titulo: 'VT — Visita Tranquilizadora (Furto)',
    descricao: 'Visita orientativa pós-delito. Obrigatório cadastrar a pessoa atendida e citar o número do REDS do furto de origem.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: true,
    min_envolvidos: 1,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-int-6',
    grupo: 'INTERACOES_COMUNITARIAS',
    codigo_natureza: 'A20.001',
    titulo: 'VTCV — Visita Tranquilizadora (Crime Violento)',
    descricao: 'Visita humanizada à vítima de crime violento. Obrigatório cadastrar a vítima atendida e citar o número do REDS do crime violento de origem.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: true,
    min_envolvidos: 1,
    area_rural_obrigatoria: false,
    ativo: true
  },

  // 4. ORDENS DE SERVIÇO
  {
    id: 'op-os-1',
    grupo: 'ORDENS_SERVICO',
    codigo_natureza: 'OS 3.028/2025',
    titulo: 'Operação Visibilidade Institucional',
    descricao: 'Ordem de Serviço nº 3.028/2025 — Presença Ostensiva e Ponto Base em áreas de grande fluxo de pedestres e comércio em Salinas.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-os-2',
    grupo: 'ORDENS_SERVICO',
    codigo_natureza: 'OS 3.038/2026-2ª CIA',
    titulo: 'Enfrentamento aos Crimes de Homicídios (Bares e Similares)',
    descricao: 'Ordem de Serviço nº 3.038/2026-2ª Cia PM IND — Fiscalização qualificada em bares e similares de risco para conter homicídios.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false,
    ativo: true
  },
  {
    id: 'op-os-3',
    grupo: 'ORDENS_SERVICO',
    codigo_natureza: 'OS AGROGERAIS',
    titulo: 'Operação Agrogerais Segura',
    descricao: 'Operação de saturação rural para combate a furtos de transformadores, gado e defensivos agrícolas na região de Salinas.',
    link_google_drive: 'https://drive.google.com',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: true,
    ativo: true
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    numero_pm: '100001-1',
    nome_completo: 'Leonardo Santos Silva',
    nome_guerra: 'Ten Leonardo',
    graduacao: 'Ten',
    whatsapp: '38999991001',
    role: 'ADMIN',
    equipe_padrao: 'ADM',
    primeiro_acesso: false,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-2',
    numero_pm: '100002-2',
    nome_completo: 'Carlos Eduardo Moreira',
    nome_guerra: 'Sgt Moreira',
    graduacao: '2º Sgt',
    whatsapp: '38999991002',
    role: 'SOF',
    equipe_padrao: 'SOF ALFA 1',
    primeiro_acesso: false,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-3',
    numero_pm: '100003-3',
    nome_completo: 'Juliana Pereira Ramos',
    nome_guerra: 'Cb Juliana',
    graduacao: 'Cb',
    whatsapp: '38999991003',
    role: 'ALERTA_HOMICIDIO',
    equipe_padrao: 'RPPM',
    primeiro_acesso: false,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-4',
    numero_pm: '100004-4',
    nome_completo: 'Marcos Vinicius Costa',
    nome_guerra: 'Sd Marcos',
    graduacao: 'Sd',
    whatsapp: '38999991004',
    role: 'EQUIPE',
    equipe_padrao: 'ALFA 1',
    primeiro_acesso: false,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-5',
    numero_pm: '100005-5',
    nome_completo: 'Rodrigo Alves Ferreira',
    nome_guerra: 'Cb Rodrigo',
    graduacao: 'Cb',
    whatsapp: '38999991005',
    role: 'EQUIPE',
    equipe_padrao: 'BRAVO 1',
    primeiro_acesso: true, // Teste de primeiro acesso com troca de senha
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-6',
    numero_pm: '100006-6',
    nome_completo: 'Antonio Carlos Dias',
    nome_guerra: 'Sgt Dias',
    graduacao: '3º Sgt',
    whatsapp: '38999991006',
    role: 'EQUIPE',
    equipe_padrao: 'PATRULHA RURAL 1',
    primeiro_acesso: false,
    ativo: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_ALERTS: HomicideAlert[] = [
  {
    id: 'alt-1',
    reds_numero: '2026-004589123-001',
    natureza_ocorrencia: 'Ameaça de Morte / Desavença Tráfico',
    data_fato: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    municipio: 'Salinas',
    bairro: 'São Geraldo',
    endereco_completo: 'Rua Bahia, nº 145, Salinas/MG',
    autores: 'Lucas Silva (vulgo "Luquinhas do Morro")',
    vitimas: 'Matheus Ribeiro (vulgo "Teteu")',
    grau_risco: 'CRITICO',
    avaliacao_cenario: 'Disputa territorial de ponto de venda de drogas no bairro São Geraldo. Histórico de ameaças reiteradas com ostentação de arma de fogo em redes sociais.',
    acoes_preventivas_adotadas: 'Patrulhamento intensificado pela equipe ALFA 1, abordagem qualificada ao autor e monitoramento constante do endereço da vítima.',
    status: 'ATIVO',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'alt-2',
    reds_numero: '2026-003891456-001',
    natureza_ocorrencia: 'Violência Doméstica / Descumprimento de Medida Protetiva',
    data_fato: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    municipio: 'Salinas',
    bairro: 'Centro',
    endereco_completo: 'Av. Antônio Carlos, nº 500, Salinas/MG',
    autores: 'Roberto Nonato de Souza',
    vitimas: 'Amanda Cristina Duarte',
    grau_risco: 'ALTO',
    avaliacao_cenario: 'Ex-companheiro não aceita término da relação, proferiu ameaças de morte com faca na residência da genitora da vítima.',
    acoes_preventivas_adotadas: 'Visita de acompanhamento pela equipe RPPM, reforço de ronda no horário de deslocamento da vítima ao trabalho.',
    status: 'ATIVO',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'alt-3',
    reds_numero: '2026-002984125-001',
    natureza_ocorrencia: 'Lesão Corporal Grave / Briga em Bar',
    data_fato: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    municipio: 'Salinas',
    bairro: 'Vila Nova',
    endereco_completo: 'Rua Projetada A, Bar do Zé, Salinas/MG',
    autores: 'Valdir Gomes e comparsas',
    vitimas: 'Felipe Santos Oliveira',
    grau_risco: 'MEDIO',
    avaliacao_cenario: 'Desentendimento por motivo fútil em estabelecimento com consumo excessivo de bebidas alcoólicas. Autor prometeu vingança.',
    acoes_preventivas_adotadas: 'Aplicação da OS 3.038/2026 com fiscalização de alvará e revista pessoal no estabelecimento.',
    status: 'CONTROLADO',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
  }
];

export const INITIAL_MONTHLY_TARGETS: MonthlyTarget[] = [
  {
    id: 'tgt-1',
    mes: 8,
    ano: 2026,
    tipo_operacao_id: 'op-pog-2', // Batida Policial
    meta_total: 40,
    distribuicoes: [
      { id: 'dst-1', meta_mensal_id: 'tgt-1', equipe: 'ALFA', percentual_alocado: 25, meta_quantitativa: 10 },
      { id: 'dst-2', meta_mensal_id: 'tgt-1', equipe: 'BRAVO', percentual_alocado: 25, meta_quantitativa: 10 },
      { id: 'dst-3', meta_mensal_id: 'tgt-1', equipe: 'CHARLIE', percentual_alocado: 25, meta_quantitativa: 10 },
      { id: 'dst-4', meta_mensal_id: 'tgt-1', equipe: 'DELTA', percentual_alocado: 25, meta_quantitativa: 10 }
    ]
  },
  {
    id: 'tgt-2',
    mes: 8,
    ano: 2026,
    tipo_operacao_id: 'op-int-5', // VT Furto
    meta_total: 16,
    distribuicoes: [
      { id: 'dst-5', meta_mensal_id: 'tgt-2', equipe: 'ALFA', percentual_alocado: 25, meta_quantitativa: 4 },
      { id: 'dst-6', meta_mensal_id: 'tgt-2', equipe: 'BRAVO', percentual_alocado: 25, meta_quantitativa: 4 },
      { id: 'dst-7', meta_mensal_id: 'tgt-2', equipe: 'CHARLIE', percentual_alocado: 25, meta_quantitativa: 4 },
      { id: 'dst-8', meta_mensal_id: 'tgt-2', equipe: 'DELTA', percentual_alocado: 25, meta_quantitativa: 4 }
    ]
  },
  {
    id: 'tgt-3',
    mes: 8,
    ano: 2026,
    tipo_operacao_id: 'op-os-2', // OS 3.038/2026 Bares
    meta_total: 20,
    distribuicoes: [
      { id: 'dst-9', meta_mensal_id: 'tgt-3', equipe: 'ALFA', percentual_alocado: 25, meta_quantitativa: 5 },
      { id: 'dst-10', meta_mensal_id: 'tgt-3', equipe: 'BRAVO', percentual_alocado: 25, meta_quantitativa: 5 },
      { id: 'dst-11', meta_mensal_id: 'tgt-3', equipe: 'CHARLIE', percentual_alocado: 25, meta_quantitativa: 5 },
      { id: 'dst-12', meta_mensal_id: 'tgt-3', equipe: 'DELTA', percentual_alocado: 25, meta_quantitativa: 5 }
    ]
  }
];

export const INITIAL_LOGS: OperationExecutionLog[] = [
  {
    id: 'log-1',
    tipo_operacao_id: 'op-pog-2',
    data_execucao: new Date().toISOString().split('T')[0],
    equipe: 'ALFA 1',
    militar_responsavel_id: 'usr-4',
    militar_responsavel_nome: 'Sd Marcos',
    reds_numero: '2026-004612345-001',
    local_fato: 'Praça Coronel Ramos, Centro',
    bairro: 'Centro',
    area_rural: false,
    quantidade_envolvidos: 14,
    observacoes: 'Abordadas 14 pessoas e fiscalizados 8 veículos automotores. Nada de ilícito encontrado.',
    created_at: new Date().toISOString()
  },
  {
    id: 'log-2',
    tipo_operacao_id: 'op-int-5',
    data_execucao: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    equipe: 'ALFA 1',
    militar_responsavel_id: 'usr-4',
    militar_responsavel_nome: 'Sd Marcos',
    reds_numero: '2026-004598112-001',
    reds_origem: '2026-004500123-001',
    local_fato: 'Rua Presidente Vargas, nº 210',
    bairro: 'Vila Santo Antonio',
    quantidade_envolvidos: 1,
    detalhes_interacao: {
      pessoa_atendida: 'José Silva Sauro',
      orientacoes: 'Repassadas dicas DDU 181, iluminação residencial e reforço em trancas.',
      demanda_identificada: 'Melhoria de iluminação pública na via.'
    },
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// Gerar escala mensal de exemplo para o mês corrente
export function generateSampleSchedule(mes: number = 8, ano: number = 2026): MonthlySchedule {
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const itens = [];

  const teamMembers = [
    { militar_id: 'usr-1', militar_nome: 'Ten Leonardo', militar_numero_pm: '100001-1', equipe: 'ADM', padrao: 'S' },
    { militar_id: 'usr-2', militar_nome: 'Sgt Moreira', militar_numero_pm: '100002-2', equipe: 'SOF ALFA 1', padrao: '12x36' },
    { militar_id: 'usr-3', militar_nome: 'Cb Juliana', militar_numero_pm: '100003-3', equipe: 'RPPM', padrao: 'EXP' },
    { militar_id: 'usr-4', militar_nome: 'Sd Marcos', militar_numero_pm: '100004-4', equipe: 'ALFA 1', padrao: '12x36' },
    { militar_id: 'usr-5', militar_nome: 'Cb Rodrigo', militar_numero_pm: '100005-5', equipe: 'BRAVO 1', padrao: '12x36_inv' },
    { militar_id: 'usr-6', militar_nome: 'Sgt Dias', militar_numero_pm: '100006-6', equipe: 'PATRULHA RURAL 1', padrao: 'EXP' },
  ];

  for (const tm of teamMembers) {
    for (let day = 1; day <= daysInMonth; day++) {
      let code = 'F';
      const date = new Date(ano, mes - 1, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      if (tm.padrao === 'S') {
        code = isWeekend ? 'F' : 'S';
      } else if (tm.padrao === 'EXP') {
        code = isWeekend ? 'F' : 'S';
      } else if (tm.padrao === '12x36') {
        code = day % 2 === 0 ? 'S' : 'F';
      } else if (tm.padrao === '12x36_inv') {
        code = day % 2 !== 0 ? 'SN' : 'F';
      }

      itens.push({
        id: `item-${tm.militar_id}-${day}`,
        escala_id: 'escala-atual',
        equipe: tm.equipe,
        militar_id: tm.militar_id,
        militar_nome: tm.militar_nome,
        militar_numero_pm: tm.militar_numero_pm,
        dia_mes: day,
        legenda_codigo: code
      });
    }
  }

  return {
    id: 'escala-atual',
    mes,
    ano,
    titulo: `Escala Operacional Mensal - ${mes.toString().padStart(2, '0')}/${ano}`,
    status: 'PUBLICADA',
    itens,
    created_at: new Date().toISOString()
  };
}
