import { OperationType, UserRole } from './types';

// Validação do padrão REDS de Minas Gerais: AAAA-XXXXXXXXX-001 (ou similar)
export function isValidRedsFormat(reds: string): boolean {
  if (!reds) return false;
  const clean = reds.trim();
  // Aceita formatos como 2026-001234567-001, 2026-123456-001 ou apenas números com ano
  const redsRegex = /^20\d{2}-?\d{6,10}-?\d{3}$/;
  return redsRegex.test(clean) || clean.length >= 10;
}

// Gerador de mensagem personalizada para envio de convite via WhatsApp
export function generateWhatsAppInviteUrl(
  whatsapp: string,
  nomeGuerra: string,
  numeroPm: string,
  senhaTemp: string,
  role: UserRole,
  systemUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://sgp-salinas.vercel.app'
): string {
  const cleanPhone = whatsapp.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  let roleExplanation = '';
  switch (role) {
    case 'ADMIN':
      roleExplanation = 'Você possui perfil de *ADMINISTRADOR*, com gestão completa de usuários, metas mensais, escalas de serviço e relatórios da fração.';
      break;
    case 'SOF':
      roleExplanation = 'Você possui perfil de *SOF (Sala de Operações)*, responsável pelo lançamento de operações executadas, registros de visitas e acompanhamento da escala.';
      break;
    case 'ALERTA_HOMICIDIO':
      roleExplanation = 'Você possui perfil de *ALERTA DE HOMICÍDIOS*, responsável pela triagem, análise de risco e acompanhamento de ocorrências com potencial de evolução para crimes violentos.';
      break;
    case 'EQUIPE':
      roleExplanation = 'Você possui perfil de *EQUIPE OPERACIONAL*, com acesso ao módulo "Minha Missão do Dia" para consulta de metas, orientações táticas e escala de serviço do seu turno.';
      break;
  }

  const message = `*SGP SALINAS — 2º PELOTÃO*
_2ª Cia PM Ind / 11ª RPM_*
*Sistema de Gestão e Planejamento Operacional (SGP-Salinas)*

Olá, *${nomeGuerra}*!
Seu acesso ao sistema foi liberado.

🌐 *Acesso:* ${systemUrl}
👤 *Login (Nº PM):* \`${numeroPm}\`
🔑 *Senha Temporária:* \`${senhaTemp}\`

📌 *Perfil:* *${role}*
${roleExplanation}

⚠️ *Instruções de Acesso:*
1. No seu primeiro acesso, informe o Nº PM e a senha temporária acima.
2. O sistema solicitará obrigatoriamente a criação da sua nova senha pessoal.

_2º Pelotão de Polícia Militar - Salinas/MG_`;

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

// Validador de regras de negócio para Lançamento de Operações
export interface OperationValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateOperationLaunch(
  op: OperationType,
  data: {
    reds_numero?: string;
    reds_origem?: string;
    quantidade_envolvidos?: number;
    area_rural?: boolean;
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
  }
): OperationValidationResult {
  const errors: string[] = [];

  // Regra 1: Requer REDS de origem (VT Furto A20.028 e VTCV A20.001)
  if (op.requer_reds_origem) {
    if (!data.reds_origem || data.reds_origem.trim().length === 0) {
      errors.push(`A natureza ${op.codigo_natureza} exige obrigatoriamente a indicação do REDS de origem do delito.`);
    }
  }

  // Regra 2: Mínimo de envolvidos
  if (op.min_envolvidos && op.min_envolvidos > 0) {
    if (!data.quantidade_envolvidos || data.quantidade_envolvidos < op.min_envolvidos) {
      errors.push(`Esta atividade exige o cadastro de no mínimo ${op.min_envolvidos} envolvido(s).`);
    }
  }

  // Regra 3: Área Rural obrigatória
  if (op.area_rural_obrigatoria && !data.area_rural) {
    errors.push(`Esta operação (${op.titulo}) deve ocorrer obrigatoriamente em Área Rural.`);
  }

  // Regras específicas por atividade de Interações Comunitárias
  if (op.codigo_natureza === 'A21.007') { // VCP
    if (!data.detalhes_interacao?.orientacoes?.trim()) {
      errors.push('VCP: É obrigatório descrever as orientações repassadas ao morador.');
    }
    if (!data.detalhes_interacao?.demanda_identificada?.trim()) {
      errors.push('VCP: É obrigatório informar a demanda identificada na visita.');
    }
  }

  if (op.codigo_natureza.startsWith('A19.000') || op.codigo_natureza === 'A19.001') { // RC ou RCR
    if (!data.detalhes_interacao?.entidade_comunidade?.trim()) {
      errors.push('Reunião Comunitária: É obrigatório informar a entidade ou comunidade atendida.');
    }
    if (!data.detalhes_interacao?.pauta?.trim()) {
      errors.push('Reunião Comunitária: É obrigatório registrar a pauta da reunião.');
    }
    if (!data.detalhes_interacao?.encaminhamentos?.trim()) {
      errors.push('Reunião Comunitária: É obrigatório registrar os encaminhamentos definidos.');
    }
  }

  if (op.codigo_natureza.startsWith('A19.006')) { // MRPP
    if (!data.detalhes_interacao?.rede_atendida?.trim()) {
      errors.push('MRPP: É obrigatório identificar qual rede foi atendida (ex: Rede de Comerciantes, Vizinhos Protegidos).');
    }
    if (!data.detalhes_interacao?.providencias?.trim()) {
      errors.push('MRPP: É obrigatório descrever os assuntos tratados e as providências adotadas.');
    }
  }

  if (op.codigo_natureza === 'A20.028') { // VT Furto
    if (!data.detalhes_interacao?.pessoa_atendida?.trim()) {
      errors.push('VT (Furto): É obrigatório cadastrar o nome da pessoa atendida.');
    }
  }

  if (op.codigo_natureza === 'A20.001') { // VTCV
    if (!data.detalhes_interacao?.vitima_atendida?.trim()) {
      errors.push('VTCV (Crime Violento): É obrigatório cadastrar o nome da vítima atendida.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Algoritmo de Distribuição Igualitária de Metas
export function distributeEqually(total: number, teams: string[]): { [team: string]: { percent: number; count: number } } {
  if (teams.length === 0) return {};
  const baseCount = Math.floor(total / teams.length);
  const remainder = total % teams.length;
  const basePct = Math.floor((100 / teams.length) * 10) / 10;
  let accumulatedPct = 0;

  const result: { [team: string]: { percent: number; count: number } } = {};
  teams.forEach((team, index) => {
    const count = baseCount + (index < remainder ? 1 : 0);
    let pct: number;
    if (index === teams.length - 1) {
      pct = Number((100 - accumulatedPct).toFixed(1));
    } else {
      pct = basePct;
      accumulatedPct += basePct;
    }
    result[team] = {
      percent: pct,
      count
    };
  });
  return result;
}

// Algoritmo de Distribuição Percentual de Metas com Método dos Maiores Restos (Hare-Niemeyer)
// Garante rigorosamente que a soma dos inteiros alocados JAMAIS ultrapassa a meta_total
export function distributeByPercentages(
  total: number, 
  percentages: { [team: string]: number }
): { [team: string]: { percent: number; count: number } } {
  const teams = Object.keys(percentages);
  if (teams.length === 0 || total <= 0) {
    const empty: { [team: string]: { percent: number; count: number } } = {};
    teams.forEach(t => { empty[t] = { percent: percentages[t] || 0, count: 0 }; });
    return empty;
  }

  // 1. Calcula a soma das porcentagens (ex: 100%, ou parcial como 50%)
  const sumPct = teams.reduce((acc, t) => acc + (percentages[t] || 0), 0);
  
  // Meta total de operações a distribuir neste percentual
  // Se soma for 100%, distribui exatamente total ops.
  // Se soma for menor (ex: 50%), distribui proporcionalmente sem extrapolar.
  const targetTotalToDistribute = Math.min(
    total,
    Math.round((total * Math.min(100, Math.max(0, sumPct))) / 100)
  );

  // 2. Calcula cota exata, parte inteira (floor) e resto decimal para cada equipe
  const items = teams.map(team => {
    const pct = Math.max(0, percentages[team] || 0);
    const rawCount = (total * pct) / 100;
    const baseCount = Math.floor(rawCount);
    const remainder = rawCount - baseCount;
    return {
      team,
      pct,
      baseCount,
      remainder
    };
  });

  // 3. Soma das partes inteiras
  const allocatedBase = items.reduce((acc, it) => acc + it.baseCount, 0);
  let remainingOps = targetTotalToDistribute - allocatedBase;

  // 4. Ordena pelo maior resto decimal (desempate pelo maior percentual)
  const sortedIndices = items
    .map((it, idx) => ({ idx, remainder: it.remainder, pct: it.pct }))
    .sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 0.00001) {
        return b.remainder - a.remainder;
      }
      return b.pct - a.pct;
    });

  const finalCounts: { [team: string]: number } = {};
  items.forEach(it => {
    finalCounts[it.team] = it.baseCount;
  });

  // 5. Distribui os restos (+1 para quem tem maior parte fracionária)
  let i = 0;
  while (remainingOps > 0 && i < sortedIndices.length) {
    const targetTeam = items[sortedIndices[i].idx].team;
    finalCounts[targetTeam] += 1;
    remainingOps--;
    i++;
  }

  const result: { [team: string]: { percent: number; count: number } } = {};
  teams.forEach(team => {
    result[team] = {
      percent: percentages[team] || 0,
      count: finalCounts[team] || 0
    };
  });

  return result;
}
