import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { RiskLevel, AlertStatus } from '@/lib/types';

export async function syncStorageWithSupabase() {
  if (!supabase) return false;
  
  try {
    // 1. Sincronizar Usuários
    const { data: remoteUsers, error: usersErr } = await supabase.from('users').select('*');
    if (!usersErr && remoteUsers && remoteUsers.length > 0) {
      storage.saveUsers(remoteUsers.map(u => ({
        id: u.id,
        numero_pm: u.numero_pm,
        nome_completo: u.nome_completo,
        nome_guerra: u.nome_guerra,
        graduacao: u.graduacao,
        whatsapp: u.whatsapp || '',
        password_hash: u.password_hash || '',
        role: u.role,
        equipe_padrao: u.equipe_padrao || '',
        primeiro_acesso: u.primeiro_acesso ?? false,
        ativo: u.ativo ?? true,
        status_aprovacao: u.status_aprovacao || 'APROVADO',
        aprovado_por: u.aprovado_por,
        aprovado_em: u.aprovado_em,
        created_at: u.created_at || new Date().toISOString()
      })));
    } else if (!usersErr && (!remoteUsers || remoteUsers.length === 0)) {
      // Se a tabela estiver vazia no banco, envia os usuários locais para o Supabase
      const localUsers = storage.getUsers();
      if (localUsers.length > 0) {
        await supabase.from('users').upsert(localUsers);
      }
    }

    // 2. Sincronizar Tokens de Convite
    const { data: remoteTokens, error: tokensErr } = await supabase.from('invite_tokens').select('*');
    if (!tokensErr && remoteTokens && remoteTokens.length > 0) {
      storage.saveInviteTokens(remoteTokens);
    } else if (!tokensErr && (!remoteTokens || remoteTokens.length === 0)) {
      const localTokens = storage.getInviteTokens();
      if (localTokens.length > 0) {
        await supabase.from('invite_tokens').upsert(localTokens);
      }
    }

    // 3. Sincronizar Grupos de Operações
    const { data: remoteGroups, error: grpErr } = await supabase.from('operation_groups').select('*');
    if (!grpErr && remoteGroups && remoteGroups.length > 0) {
      storage.saveOperationGroups(remoteGroups);
    } else if (!grpErr && (!remoteGroups || remoteGroups.length === 0)) {
      const localGroups = storage.getOperationGroups();
      if (localGroups.length > 0) {
        await supabase.from('operation_groups').upsert(localGroups);
      }
    }

    // 4. Sincronizar Catálogo de Operações
    const { data: remoteOps, error: opsErr } = await supabase.from('operations').select('*');
    if (!opsErr && remoteOps && remoteOps.length > 0) {
      storage.saveOperations(remoteOps);
    } else if (!opsErr && (!remoteOps || remoteOps.length === 0)) {
      const localOps = storage.getOperations();
      if (localOps.length > 0) {
        await supabase.from('operations').upsert(localOps);
      }
    }

    // 5. Sincronizar Metas Mensais
    const { data: remoteTargets, error: targetsErr } = await supabase.from('monthly_targets').select('*');
    if (!targetsErr && remoteTargets && remoteTargets.length > 0) {
      storage.saveTargets(remoteTargets.map(t => ({
        id: t.id,
        mes: t.mes,
        ano: t.ano,
        tipo_operacao_id: t.tipo_operacao_id,
        meta_total: t.meta_total,
        distribuicoes: t.distribuicao_equipes || [],
        regra_agendamento: t.regras_agendamento?.regra || 'qualquer_dia',
        dias_especificos: t.regras_agendamento?.dias_especificos || [],
        naturezas_selecionadas: t.regras_agendamento?.naturezas_selecionadas || []
      })));
    } else if (!targetsErr && (!remoteTargets || remoteTargets.length === 0)) {
      const localTargets = storage.getAllTargets();
      if (localTargets.length > 0) {
        await supabase.from('monthly_targets').upsert(localTargets.map(t => ({
          id: t.id,
          mes: t.mes,
          ano: t.ano,
          tipo_operacao_id: t.tipo_operacao_id,
          meta_total: t.meta_total,
          distribuicao_equipes: t.distribuicoes || [],
          regras_agendamento: {
            regra: t.regra_agendamento,
            dias_especificos: t.dias_especificos,
            naturezas_selecionadas: t.naturezas_selecionadas
          }
        })));
      }
    }

    // 6. Sincronizar Lançamentos de Operações (Logs)
    const { data: remoteLogs, error: logsErr } = await supabase.from('operation_logs').select('*');
    if (!logsErr && remoteLogs && remoteLogs.length > 0) {
      storage.saveLogs(remoteLogs.map(l => ({
        id: l.id,
        tipo_operacao_id: l.tipo_operacao_id,
        natureza_executada: l.detalhes_interacao?.natureza_executada || '',
        data_execucao: l.data_hora || l.created_at,
        equipe: l.equipe,
        reds_numero: l.reds_numero || '',
        reds_origem: l.reds_origem || '',
        quantidade_envolvidos: l.quantidade_envolvidos || 0,
        area_rural: l.area_rural ?? false,
        observacoes: l.observacoes || '',
        detalhes_interacao: l.detalhes_interacao || {},
        created_at: l.created_at || new Date().toISOString()
      })));
    } else if (!logsErr && (!remoteLogs || remoteLogs.length === 0)) {
      const localLogs = storage.getLogs();
      if (localLogs.length > 0) {
        await supabase.from('operation_logs').upsert(localLogs.map(l => ({
          id: l.id,
          tipo_operacao_id: l.tipo_operacao_id,
          data_hora: l.data_execucao,
          equipe: l.equipe,
          reds_numero: l.reds_numero || null,
          reds_origem: l.reds_origem || null,
          quantidade_envolvidos: l.quantidade_envolvidos || 0,
          area_rural: l.area_rural || false,
          observacoes: l.observacoes || null,
          detalhes_interacao: { ...(l.detalhes_interacao || {}), natureza_executada: l.natureza_executada }
        })));
      }
    }

    // 7. Sincronizar Alertas de Homicídios
    const { data: remoteAlerts, error: alertsErr } = await supabase.from('homicide_alerts').select('*');
    if (!alertsErr && remoteAlerts && remoteAlerts.length > 0) {
      storage.saveAlerts(remoteAlerts.map(a => ({
        id: a.id,
        reds_numero: a.reds_numero || a.reds_origem || '',
        natureza_ocorrencia: a.natureza_ocorrencia || a.natureza_origem || '',
        data_fato: a.data_fato || new Date().toISOString(),
        municipio: a.municipio || 'Salinas',
        bairro: a.bairro || '',
        endereco_completo: a.endereco_completo || a.endereco || '',
        autores: a.autores || (Array.isArray(a.envolvidos) ? a.envolvidos.join(', ') : '') || '',
        vitimas: a.vitimas || '',
        grau_risco: (a.grau_risco || a.nivel_risco || 'MEDIO') as RiskLevel,
        avaliacao_cenario: a.avaliacao_cenario || a.motivo_conflito || '',
        acoes_preventivas_adotadas: a.acoes_preventivas_adotadas || a.acoes_preventivas || '',
        status: (a.status || 'ATIVO') as AlertStatus,
        created_by: a.created_by,
        created_at: a.created_at || new Date().toISOString(),
        updated_at: a.updated_at || a.created_at || new Date().toISOString()
      })));
    } else if (!alertsErr && (!remoteAlerts || remoteAlerts.length === 0)) {
      const localAlerts = storage.getAlerts();
      if (localAlerts.length > 0) {
        await supabase.from('homicide_alerts').upsert(localAlerts);
      }
    }

    // 8. Sincronizar Efetivo da Escala & Escalas Mensais
    const { data: remoteMilitares, error: milErr } = await supabase.from('escala_militares').select('*');
    if (!milErr && remoteMilitares && remoteMilitares.length > 0) {
      storage.saveMilitaresEscala(remoteMilitares);
    } else if (!milErr && (!remoteMilitares || remoteMilitares.length === 0)) {
      const localMil = storage.getMilitaresEscala();
      if (localMil.length > 0) {
        await supabase.from('escala_militares').upsert(localMil);
      }
    }

    const { data: remoteSchedules, error: schErr } = await supabase.from('monthly_schedules').select('*');
    if (!schErr && remoteSchedules && remoteSchedules.length > 0) {
      storage.saveSchedules(remoteSchedules);
    } else if (!schErr && (!remoteSchedules || remoteSchedules.length === 0)) {
      const localSch = storage.getSchedules();
      if (localSch.length > 0) {
        await supabase.from('monthly_schedules').upsert(localSch);
      }
    }

    // 9. Sincronizar Recados do Turno
    const { data: remoteNotices, error: notErr } = await supabase.from('shift_notices').select('*');
    if (!notErr && remoteNotices && remoteNotices.length > 0) {
      storage.saveShiftNotices(remoteNotices.map(n => ({
        id: n.id,
        titulo: n.titulo,
        mensagem: n.mensagem || n.conteudo || '',
        destinatario_tipo: (n.destinatario_tipo === 'TODAS' || n.destinatario_tipo === 'TODOS' ? 'TODAS' : 'EQUIPES_ESPECIFICAS') as 'TODAS' | 'EQUIPES_ESPECIFICAS',
        equipes_destinatarias: n.equipes_destinatarias || n.equipes_alvo || [],
        prazo_exibicao: n.prazo_exibicao || n.valido_ate || new Date().toISOString(),
        prioridade: (n.prioridade || 'NORMAL') as 'NORMAL' | 'IMPORTANTE' | 'URGENTE',
        created_by: n.created_by || n.criado_por_id || '',
        created_by_nome: n.created_by_nome || n.criado_por_nome || '',
        created_at: n.created_at || n.criado_em || new Date().toISOString(),
        ativo: n.ativo ?? true,
        leituras_confirmadas: n.leituras_confirmadas || n.confirmacoes_leitura || []
      })));
    } else if (!notErr && (!remoteNotices || remoteNotices.length === 0)) {
      const localNotices = storage.getShiftNotices();
      if (localNotices.length > 0) {
        await supabase.from('shift_notices').upsert(localNotices.map(n => ({
          id: n.id,
          titulo: n.titulo,
          conteudo: n.mensagem,
          mensagem: n.mensagem,
          prioridade: n.prioridade,
          destinatario_tipo: n.destinatario_tipo,
          equipes_alvo: n.equipes_destinatarias,
          equipes_destinatarias: n.equipes_destinatarias,
          valido_ate: n.prazo_exibicao,
          prazo_exibicao: n.prazo_exibicao,
          criado_por_id: n.created_by || 'admin',
          criado_por_nome: n.created_by_nome || 'Administração',
          criado_em: n.created_at,
          created_at: n.created_at,
          ativo: n.ativo ?? true,
          confirmacoes_leitura: n.leituras_confirmadas || [],
          leituras_confirmadas: n.leituras_confirmadas || []
        })));
      }
    }

    // 10. Sincronizar Egressos
    const { data: remoteEgressos, error: egrErr } = await supabase.from('egressos').select('*');
    if (!egrErr && remoteEgressos && remoteEgressos.length > 0) {
      storage.saveEgressos(remoteEgressos.map(e => ({
        id: e.id,
        nome_completo: e.nome_completo,
        alcunha: e.alcunha || e.vulgo || '',
        artigo_crime: e.artigo_crime || e.artigo_penal || '',
        beneficio: (e.beneficio || e.tipo_medida || 'PRISAO_DOMICILIAR') as 'PRISAO_DOMICILIAR' | 'LIVRAMENTO_CONDICIONAL' | 'MONITORAMENTO_ELETRONICO' | 'MEDIDA_CAUTELAR',
        bairro: e.bairro || '',
        endereco_completo: e.endereco_completo || e.endereco || '',
        regras_condicoes: e.regras_condicoes || e.condicoes_judiciais || [],
        foto_url: e.foto_url || '',
        status_turno: (e.status_turno || 'PENDENTE') as 'PENDENTE' | 'SEM_DESCUMPRIMENTO' | 'COM_DESCUMPRIMENTO',
        visitas_realizadas_mes: e.visitas_realizadas_mes || 0,
        visitas_meta_mes: e.visitas_meta_mes || e.meta_visitas_mes || 4,
        ultima_fiscalizacao: e.ultima_fiscalizacao || (e.historico_fiscalizacoes && e.historico_fiscalizacoes.length > 0 ? e.historico_fiscalizacoes[0] : undefined)
      })));
    } else if (!egrErr && (!remoteEgressos || remoteEgressos.length === 0)) {
      const localEgressos = storage.getEgressos();
      if (localEgressos.length > 0) {
        await supabase.from('egressos').upsert(localEgressos.map(e => ({
          id: e.id,
          nome_completo: e.nome_completo,
          vulgo: e.alcunha || null,
          alcunha: e.alcunha || null,
          artigo_penal: e.artigo_crime || null,
          artigo_crime: e.artigo_crime || null,
          tipo_medida: e.beneficio || null,
          beneficio: e.beneficio || null,
          bairro: e.bairro || null,
          endereco: e.endereco_completo || null,
          endereco_completo: e.endereco_completo || null,
          condicoes_judiciais: e.regras_condicoes || [],
          regras_condicoes: e.regras_condicoes || [],
          foto_url: e.foto_url || null,
          status_turno: e.status_turno || 'PENDENTE',
          visitas_realizadas_mes: e.visitas_realizadas_mes || 0,
          meta_visitas_mes: e.visitas_meta_mes || 4,
          visitas_meta_mes: e.visitas_meta_mes || 4,
          historico_fiscalizacoes: e.ultima_fiscalizacao ? [e.ultima_fiscalizacao] : [],
          ultima_fiscalizacao: e.ultima_fiscalizacao || null
        })));
      }
    }

    return true;
  } catch (err) {
    console.error('Erro na sincronização com Supabase:', err);
    return false;
  }
}
