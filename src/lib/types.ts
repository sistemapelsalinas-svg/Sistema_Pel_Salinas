export type UserRole = 'ADMIN' | 'SOF' | 'ALERTA_HOMICIDIO' | 'EQUIPE';

export type OperationGroup = 'POG' | 'PROXIMIDADE' | 'INTERACOES_COMUNITARIAS' | 'ORDENS_SERVICO';

export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type AlertStatus = 'ATIVO' | 'CONTROLADO' | 'EVOLUIDO' | 'ARQUIVADO';

export interface UserProfile {
  id: string;
  numero_pm: string;
  nome_completo: string;
  nome_guerra: string;
  graduacao: string;
  whatsapp: string;
  password_hash?: string;
  role: UserRole;
  equipe_padrao?: string;
  primeiro_acesso: boolean;
  ativo: boolean;
  created_at: string;
}

export interface OperationType {
  id: string;
  grupo: OperationGroup;
  codigo_natureza: string;
  titulo: string;
  descricao: string;
  link_google_drive?: string;
  requer_reds_origem?: boolean;
  min_envolvidos?: number;
  area_rural_obrigatoria?: boolean;
  ativo: boolean;
}

export interface MonthlyTarget {
  id: string;
  mes: number;
  ano: number;
  tipo_operacao_id: string;
  meta_total: number;
  tipo_operacao?: OperationType;
  distribuicoes?: TeamTargetAllocation[];
}

export interface TeamTargetAllocation {
  id: string;
  meta_mensal_id: string;
  equipe: string;
  percentual_alocado: number;
  meta_quantitativa: number;
}

export interface OperationExecutionLog {
  id: string;
  tipo_operacao_id: string;
  tipo_operacao?: OperationType;
  data_execucao: string;
  equipe: string;
  militar_responsavel_id?: string;
  militar_responsavel_nome?: string;
  reds_numero?: string;
  reds_origem?: string;
  local_fato?: string;
  bairro?: string;
  area_rural?: boolean;
  quantidade_envolvidos?: number;
  detalhes_interacao?: {
    entidade_comunidade?: string;
    pauta?: string;
    encaminhamentos?: string;
    orientacoes?: string;
    demanda_identificada?: string;
    rede_atendida?: string;
    providencias?: string;
    pessoa_atendida?: string;
    vitima_atendida?: string;
  };
  observacoes?: string;
  created_by?: string;
  created_at: string;
}

export interface HomicideAlert {
  id: string;
  reds_numero: string;
  natureza_ocorrencia: string;
  data_fato: string;
  municipio: string;
  bairro: string;
  endereco_completo: string;
  autores: string;
  vitimas: string;
  grau_risco: RiskLevel;
  avaliacao_cenario: string;
  acoes_preventivas_adotadas: string;
  status: AlertStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleLegend {
  codigo: string;
  descricao: string;
  conta_como_servico: boolean;
  cor_badge: string;
}

export interface EscalaMilitar {
  id: string;
  ordem: number;
  graduacao: string;
  nome_guerra: string;
  numero_pm: string;
  equipe_padrao?: string;
  ativo: boolean;
}

export interface ScheduleItem {
  id: string;
  escala_id: string;
  equipe: string;
  militar_id: string;
  militar_nome?: string;
  militar_numero_pm?: string;
  dia_mes: number;
  legenda_codigo: string;
}

export interface MonthlySchedule {
  id: string;
  mes: number;
  ano: number;
  titulo: string;
  status: 'RASCUNHO' | 'PUBLICADA';
  itens: ScheduleItem[];
  created_at: string;
}

export interface DailyMissionData {
  militar: UserProfile;
  equipeHoje: string;
  deServicoHoje: boolean;
  legendaHoje: string;
  servicosRestantesMes: number;
  metasEquipe: {
    operacao: OperationType;
    metaMensal: number;
    executadas: number;
    restantes: number;
    mediaNecessariaPorPlantao: number;
  }[];
  pendenciasUltimoServico: string[];
  alertasSetor: HomicideAlert[];
}
