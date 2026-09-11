'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { OperationType, EscalaMilitar, OperationExecutionLog, OperationGroupDef, MonthlyTarget } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  Clock,
  Check,
  AlertCircle,
  Compass,
  HeartHandshake,
  FileSpreadsheet,
  Layers,
  Activity,
  Flag,
  Sparkles,
  Briefcase,
  Zap,
  Bookmark,
  Folder,
  UserCheck,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  HelpCircle,
  Search,
  Trash2,
  X
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Compass,
  HeartHandshake,
  FileSpreadsheet,
  Layers,
  Target,
  Users,
  Activity,
  Flag,
  Sparkles,
  Briefcase,
  Zap,
  Bookmark,
  Folder,
};

const getGroupIcon = (iconName?: string) => {
  if (!iconName) return Shield;
  return ICON_MAP[iconName] || Shield;
};

const COLOR_MAP: Record<string, { bgClass: string; badgeClass: string; activeClass: string; borderClass: string }> = {
  blue: { bgClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', activeClass: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300', borderClass: 'border-blue-500' },
  emerald: { bgClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', activeClass: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300', borderClass: 'border-emerald-500' },
  purple: { bgClass: 'bg-purple-500', badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800', activeClass: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300', borderClass: 'border-purple-500' },
  amber: { bgClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', activeClass: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300', borderClass: 'border-amber-500' },
  rose: { bgClass: 'bg-rose-500', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800', activeClass: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300', borderClass: 'border-rose-500' },
  indigo: { bgClass: 'bg-indigo-500', badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', activeClass: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300', borderClass: 'border-indigo-500' },
  cyan: { bgClass: 'bg-cyan-500', badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', activeClass: 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300', borderClass: 'border-cyan-500' },
  slate: { bgClass: 'bg-slate-500', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 border-slate-200 dark:border-slate-800', activeClass: 'border-slate-500 bg-slate-50/50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300', borderClass: 'border-slate-500' }
};

const getGroupColor = (colorKey?: string) => {
  if (!colorKey) return COLOR_MAP.blue;
  return COLOR_MAP[colorKey] || COLOR_MAP.blue;
};

// Formatação estrita de REDS: 20xx-xxxxxxxxx-001 (16 dígitos numéricos)
const formatReds = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 13) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 13)}-${digits.slice(13, 16)}`;
};

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function OperacoesExecutadasPage() {
  const { user } = useAuth();
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Wizard Step: 1 = Grupo, 2 = Natureza, 3 = Dados da Execução
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [groups, setGroups] = useState<OperationGroupDef[]>([]);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [militares, setMilitares] = useState<EscalaMilitar[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [logs, setLogs] = useState<OperationExecutionLog[]>([]);
  const [allTargets, setAllTargets] = useState<MonthlyTarget[]>([]);

  // Filtro de pesquisa na etapa 2
  const [opSearchTerm, setOpSearchTerm] = useState<string>('');

  // Seleções do formulário
  const [selectedGroup, setSelectedGroup] = useState<string>('POG');
  const [selectedOpId, setSelectedOpId] = useState<string>('');
  const [dataExecucao, setDataExecucao] = useState<string>(todayStr);
  const [equipe, setEquipe] = useState<string>('ALFA 1');
  const [militarId, setMilitarId] = useState<string>('');
  
  const [redsNumero, setRedsNumero] = useState<string>('');
  const [redsOrigem, setRedsOrigem] = useState<string>('');
  const [localFato, setLocalFato] = useState<string>('');
  const [bairro, setBairro] = useState<string>('Centro');
  const [areaRural, setAreaRural] = useState<boolean>(false);
  const [quantidadeEnvolvidos, setQuantidadeEnvolvidos] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<string>('');

  // Checkboxes de confirmação de requisitos institucionais (Interações Comunitárias e Visitas)
  const [confirmVcpEnvolvidos, setConfirmVcpEnvolvidos] = useState<boolean>(false);
  const [confirmRcEnvolvidos, setConfirmRcEnvolvidos] = useState<boolean>(false);
  const [confirmRcrRural, setConfirmRcrRural] = useState<boolean>(false);
  const [confirmRcrEnvolvidos, setConfirmRcrEnvolvidos] = useState<boolean>(false);
  const [confirmMrppEnvolvidos, setConfirmMrppEnvolvidos] = useState<boolean>(false);
  const [confirmVtVitima, setConfirmVtVitima] = useState<boolean>(false);
  const [confirmVtRedsOrigem, setConfirmVtRedsOrigem] = useState<boolean>(false);
  const [naturezaExecutada, setNaturezaExecutada] = useState<string>('');
  const [logToDelete, setLogToDelete] = useState<OperationExecutionLog | null>(null);

  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Checar se o usuário atual tem permissão para excluir um determinado log:
  // Administradores, SOF ou o próprio militar que realizou o lançamento
  const canUserDeleteLog = (log: OperationExecutionLog) => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SOF') return true;
    if (log.created_by && log.created_by === user.id) return true;
    if (log.created_by_pm && user.numero_pm && log.created_by_pm.replace(/\D/g, '') === user.numero_pm.replace(/\D/g, '')) return true;
    if (log.militar_responsavel_id && log.militar_responsavel_id === user.id) return true;
    return false;
  };

  const handleConfirmDeleteLog = () => {
    if (!logToDelete) return;
    storage.deleteLog(logToDelete.id);
    const updated = storage.getLogs();
    setLogs(updated);
    setSuccessMsg('Lançamento de operação executada excluído com sucesso.');
    setTimeout(() => setSuccessMsg(''), 4000);
    setLogToDelete(null);
  };

  // Carregar dados iniciais e definir equipe pré-selecionada conforme módulo de escala
  useEffect(() => {
    const loadedGroups = storage.getOperationGroups();
    const ops = storage.getOperations();
    const mils = storage.getMilitaresEscala();
    const loadedTeams = storage.getTeams();
    const loadedLogs = storage.getLogs();
    const targets = storage.getAllTargets();

    setGroups(loadedGroups);
    setOperations(ops);
    setMilitares(mils);
    setTeams(loadedTeams);
    setLogs(loadedLogs);
    setAllTargets(targets);

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const queryOpId = params?.get('opId');
    const queryEquipe = params?.get('equipe');

    // Identificar o militar logado na escala para obter sua equipe padrão
    const userPmClean = (user?.numero_pm || '').replace(/\D/g, '');
    const loggedMilitar = mils.find(m => (m.numero_pm || '').replace(/\D/g, '') === userPmClean || m.id === user?.id);

    // Pré-selecionar a equipe do usuário conforme cadastrada na escala
    if (queryEquipe && loadedTeams.includes(queryEquipe)) {
      setEquipe(queryEquipe);
    } else if (loggedMilitar?.equipe_padrao && loadedTeams.includes(loggedMilitar.equipe_padrao)) {
      setEquipe(loggedMilitar.equipe_padrao);
    } else if (user?.equipe_padrao && loadedTeams.includes(user.equipe_padrao)) {
      setEquipe(user.equipe_padrao);
    } else if (loadedTeams.length > 0) {
      setEquipe(loadedTeams[0]);
    }

    // Militar responsável pré-selecionado como o usuário logado
    if (loggedMilitar) {
      setMilitarId(loggedMilitar.id);
    } else if (user) {
      setMilitarId(user.id);
    } else if (mils.length > 0) {
      setMilitarId(mils[0].id);
    }

    // Grupo e Operação inicial via query ou defaults
    if (queryOpId) {
      const foundOp = ops.find(o => o.id === queryOpId);
      if (foundOp) {
        setSelectedGroup(foundOp.grupo);
        setSelectedOpId(foundOp.id);
        setCurrentStep(3); // Se veio com opId na URL, vai direto para a etapa 3
      } else if (loadedGroups.length > 0) {
        setSelectedGroup(loadedGroups[0].id);
      }
    } else if (loadedGroups.length > 0) {
      setSelectedGroup(loadedGroups[0].id);
    }
  }, [user]);

  // Filtrar operações do grupo selecionado
  const opsInGroup = useMemo(() => {
    return operations.filter(o => o.grupo === selectedGroup);
  }, [operations, selectedGroup]);

  // Operações filtradas por termo de busca na Etapa 2
  const searchedOpsInGroup = useMemo(() => {
    if (!opSearchTerm.trim()) return opsInGroup;
    const term = opSearchTerm.toLowerCase();
    return opsInGroup.filter(o => 
      o.titulo.toLowerCase().includes(term) || 
      o.codigo_natureza.toLowerCase().includes(term) ||
      (o.descricao && o.descricao.toLowerCase().includes(term))
    );
  }, [opsInGroup, opSearchTerm]);

  // Objeto da operação selecionada
  const selectedOp = useMemo(() => {
    return operations.find(o => o.id === selectedOpId);
  }, [operations, selectedOpId]);

  // Objeto do grupo selecionado
  const selectedGroupDef = useMemo(() => {
    return groups.find(g => g.id === selectedGroup);
  }, [groups, selectedGroup]);

  // Metas do mês atual cadastradas para a operação selecionada (pode haver mais de 1 para OSs com naturezas distintas)
  const monthTargetsForOp = useMemo(() => {
    if (!selectedOpId || !dataExecucao) return [];
    const [anoStr, mesStr] = dataExecucao.split('-');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);
    return allTargets.filter(t => t.tipo_operacao_id === selectedOpId && t.mes === mes && t.ano === ano);
  }, [selectedOpId, dataExecucao, allTargets]);

  // Meta do mês correspondente à natureza específica executada
  const currentTarget = useMemo(() => {
    if (monthTargetsForOp.length === 0) return null;

    if (selectedOp?.naturezas_vinculadas && selectedOp.naturezas_vinculadas.length > 0 && naturezaExecutada) {
      const found = monthTargetsForOp.find(t => 
        t.naturezas_selecionadas?.some(code => 
          naturezaExecutada === code || 
          naturezaExecutada.startsWith(`${code} -`) || 
          code.startsWith(naturezaExecutada)
        )
      );
      if (found) return found;
    }

    return monthTargetsForOp[0] || null;
  }, [monthTargetsForOp, selectedOp, naturezaExecutada]);

  // Atualizar flags automáticas e pré-selecionar natureza vinculada quando a operação selecionada muda
  useEffect(() => {
    if (selectedOp) {
      if (selectedOp.area_rural_obrigatoria || selectedOp.codigo_natureza === 'A19.001') {
        setAreaRural(true);
        setConfirmRcrRural(true);
      }
      if (selectedOp.min_envolvidos) {
        setQuantidadeEnvolvidos(prev => Math.max(prev, selectedOp.min_envolvidos ?? 0));
      }
      if (selectedOp.naturezas_vinculadas && selectedOp.naturezas_vinculadas.length > 0) {
        // Encontrar a primeira natureza que possui meta para a equipe ou primeira da lista
        const plannedForTeam = monthTargetsForOp.find(t => 
          t.distribuicoes?.some(d => d.equipe === equipe && d.meta_quantitativa > 0)
        );
        const plannedCode = plannedForTeam?.naturezas_selecionadas?.[0] || monthTargetsForOp[0]?.naturezas_selecionadas?.[0];
        
        const matchedNat = selectedOp.naturezas_vinculadas.find(
          n => plannedCode && (n.codigo === plannedCode || plannedCode.startsWith(n.codigo))
        ) || selectedOp.naturezas_vinculadas[0];

        if (matchedNat) {
          setNaturezaExecutada(`${matchedNat.codigo} - ${matchedNat.titulo}`);
        }
      } else {
        setNaturezaExecutada('');
      }
    }
  }, [selectedOp, monthTargetsForOp, equipe]);

  // Verificar se a equipe selecionada possui meta para a operação e natureza no mês/ano da data de execução
  const teamGoalInfo = useMemo(() => {
    if (!currentTarget || !equipe || !currentTarget.distribuicoes) return { hasGoal: false, count: 0, percent: 0 };

    const teamAlloc = currentTarget.distribuicoes.find(d => d.equipe === equipe);
    if (!teamAlloc || (teamAlloc.meta_quantitativa <= 0 && teamAlloc.percentual_alocado <= 0)) {
      return { hasGoal: false, count: 0, percent: 0 };
    }

    return {
      hasGoal: true,
      count: teamAlloc.meta_quantitativa,
      percent: teamAlloc.percentual_alocado
    };
  }, [currentTarget, equipe]);

  const handleDateChange = (val: string) => {
    if (val > todayStr) {
      setValidationErrors(['A data de execução não pode ser futura. Seleção ajustada para a data atual.']);
      setDataExecucao(todayStr);
      return;
    }
    setValidationErrors(prev => prev.filter(e => !e.includes('data futura') && !e.includes('data de execução')));
    setDataExecucao(val);
  };

  // Funções de navegação do Wizard
  const handleSelectGroupAndNext = (groupId: string) => {
    setSelectedGroup(groupId);
    // Se a op atual não pertence a esse grupo, limpa ou seleciona a primeira
    const groupOps = operations.filter(o => o.grupo === groupId);
    if (!groupOps.some(o => o.id === selectedOpId)) {
      setSelectedOpId(groupOps.length > 0 ? groupOps[0].id : '');
    }
    setOpSearchTerm('');
    setCurrentStep(2);
  };

  const handleSelectOpAndNext = (opId: string) => {
    setSelectedOpId(opId);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOp) {
      setValidationErrors(['Selecione uma operação válida.']);
      return;
    }

    // 1. Validação de Data Futura
    if (dataExecucao > todayStr) {
      setValidationErrors(['Não é permitido realizar lançamentos com data futura.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validação de Meta da Equipe
    if (!teamGoalInfo.hasGoal) {
      const [anoStr, mesStr] = dataExecucao.split('-');
      setValidationErrors([
        `A equipe "${equipe}" não possui meta destinada para a operação "${selectedOp.titulo}" no mês ${mesStr}/${anoStr}. Só é permitido lançar operações com metas atribuídas à equipe.`
      ]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Validação de REDS (Se informado, deve ter 16 dígitos numéricos)
    if (redsNumero) {
      const cleanReds = redsNumero.replace(/\D/g, '');
      if (cleanReds.length < 16) {
        setValidationErrors([
          `O número do REDS está incompleto. O padrão oficial exige 16 dígitos numéricos (AAAA-NNNNNNNNN-SSS).`
        ]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 3.5. Validação de Natureza Executada (para operações com naturezas vinculadas)
    if (selectedOp.naturezas_vinculadas && selectedOp.naturezas_vinculadas.length > 0) {
      if (!naturezaExecutada) {
        setValidationErrors(['Selecione a natureza específica que foi executada nesta Operação / Ordem de Serviço.']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 4. Validação dos Checkboxes Obrigatórios de Confirmação no REDS
    const errors: string[] = [];

    // VCP (A21.007)
    if (selectedOp.codigo_natureza === 'A21.007') {
      if (!confirmVcpEnvolvidos) {
        errors.push('Confirme que há no mínimo 1 (um) envolvido cadastrado no REDS.');
      }
    }

    // RC (A19.000)
    if (selectedOp.codigo_natureza === 'A19.000' || selectedOp.codigo_natureza.startsWith('A19.000')) {
      if (!confirmRcEnvolvidos) {
        errors.push('Confirme que há no mínimo 3 (três) envolvidos cadastrados no REDS da Reunião Comunitária.');
      }
    }

    // RCR (A19.001)
    if (selectedOp.codigo_natureza === 'A19.001') {
      if (!confirmRcrEnvolvidos) {
        errors.push('Confirme que há no mínimo 3 (três) envolvidos cadastrados no REDS da Reunião Comunitária Rural.');
      }
      if (!confirmRcrRural || !areaRural) {
        errors.push('Confirme que a Reunião Comunitária Rural foi realizada em Área Rural.');
      }
    }

    // MRPP (A19.006)
    if (selectedOp.codigo_natureza.startsWith('A19.006')) {
      if (!confirmMrppEnvolvidos) {
        errors.push('Confirme que há no mínimo 3 (três) envolvidos cadastrados no REDS da Manutenção de Rede.');
      }
    }

    // VT (A20.028) ou VTCV (A20.001)
    if (selectedOp.codigo_natureza === 'A20.028' || selectedOp.codigo_natureza === 'A20.001') {
      if (!confirmVtVitima) {
        errors.push('Confirme que a vítima foi devidamente cadastrada no REDS.');
      }
      if (!confirmVtRedsOrigem) {
        errors.push('Confirme que citou no histórico do REDS o número do REDS de origem do fato.');
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);

    // Identificar Militar Responsável (selecionado no formulário)
    const respMilitar = militares.find(m => m.id === militarId);
    const respNome = respMilitar ? `${respMilitar.graduacao} ${respMilitar.nome_guerra} (${respMilitar.numero_pm})` : (user ? `${user.graduacao} ${user.nome_guerra}` : 'Militar');

    // Registrar o log salvando o militar responsável pela execução e o usuário logado para auditoria
    storage.addLog({
      tipo_operacao_id: selectedOp.id,
      natureza_executada: (selectedOp.naturezas_vinculadas && selectedOp.naturezas_vinculadas.length > 0) ? naturezaExecutada : undefined,
      data_execucao: dataExecucao,
      equipe,
      militar_responsavel_id: militarId || user?.id,
      militar_responsavel_nome: respNome,
      reds_numero: redsNumero || undefined,
      reds_origem: redsOrigem || undefined,
      local_fato: localFato,
      bairro: bairro,
      area_rural: areaRural,
      quantidade_envolvidos: quantidadeEnvolvidos,
      detalhes_interacao: {
        envolvidos_confirmados: (confirmVcpEnvolvidos || confirmRcEnvolvidos || confirmRcrEnvolvidos || confirmMrppEnvolvidos) ? 'Confirmado no REDS' : undefined,
        vitima_atendida: confirmVtVitima ? 'Vítima confirmada no REDS' : undefined
      },
      observacoes: observacoes || undefined,
      created_by: user?.id,
      created_by_nome: user ? `${user.graduacao} ${user.nome_guerra}` : undefined,
      created_by_pm: user?.numero_pm
    });

    setLogs(storage.getLogs());
    setSuccessMsg(`Operação "${selectedOp.titulo}" registrada com sucesso para a equipe ${equipe}!`);
    setTimeout(() => setSuccessMsg(''), 5000);

    // Resetar campos e voltar para a Etapa 1
    setNaturezaExecutada('');
    setRedsNumero('');
    setRedsOrigem('');
    setObservacoes('');
    setConfirmVcpEnvolvidos(false);
    setConfirmRcEnvolvidos(false);
    setConfirmRcrRural(false);
    setConfirmRcrEnvolvidos(false);
    setConfirmMrppEnvolvidos(false);
    setConfirmVtVitima(false);
    setConfirmVtRedsOrigem(false);

    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Operações Executadas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Informe a execução de uma operação
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Erros de Validação */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs space-y-2 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Pendências para validação do lançamento:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Painel Principal do Assistente (Wizard) */}
        <div className="lg:col-span-2 untitled-card p-6 space-y-6">
          
          {/* STEPPER / BARRA DE ETAPAS */}
          <div className="border-b border-gray-100 dark:border-[#222938] pb-4">
            <div className="grid grid-cols-3 gap-2">
              
              {/* Etapa 1 */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
                  currentStep === 1
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : currentStep > 1
                    ? 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    : 'text-gray-400 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  currentStep === 1
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Etapa 1</p>
                  <p className="text-xs font-bold truncate">Grupo</p>
                </div>
              </button>

              {/* Etapa 2 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedGroup) setCurrentStep(2);
                }}
                disabled={!selectedGroup}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
                  currentStep === 2
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : currentStep > 2
                    ? 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    : 'text-gray-400 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  currentStep === 2
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Etapa 2</p>
                  <p className="text-xs font-bold truncate">Natureza</p>
                </div>
              </button>

              {/* Etapa 3 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedOpId) setCurrentStep(3);
                }}
                disabled={!selectedOpId}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
                  currentStep === 3
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'text-gray-400 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  currentStep === 3
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  3
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Etapa 3</p>
                  <p className="text-xs font-bold truncate">Execução</p>
                </div>
              </button>

            </div>
          </div>

          {/* ========================================================= */}
          {/* ETAPA 1: SELEÇÃO DO GRUPO OPERACIONAL */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  1. Selecione o Grupo de Operações
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Escolha o grupo ao qual a operação executada pertence para filtrar as naturezas disponíveis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {groups.map((g) => {
                  const Icon = getGroupIcon(g.icone);
                  const color = getGroupColor(g.cor);
                  const isSelected = selectedGroup === g.id;
                  const countInGroup = operations.filter(o => o.grupo === g.id).length;

                  return (
                    <div
                      key={g.id}
                      onClick={() => handleSelectGroupAndNext(g.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? `${color.activeClass} ring-2 ring-emerald-500 shadow-xs` 
                          : 'border-gray-200 dark:border-[#222938] bg-white dark:bg-[#151A23] hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${color.badgeClass}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                            {g.nome}
                          </h4>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {countInGroup} {countInGroup === 1 ? 'natureza' : 'naturezas'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 flex-shrink-0 text-xs font-semibold">
                        <span className="hidden sm:inline text-[11px]">Ver</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ETAPA 2: SELEÇÃO DA NATUREZA / OPERAÇÃO */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    2. Escolha a Natureza / Operação
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Grupo selecionado: <strong className="text-gray-800 dark:text-gray-200">{selectedGroupDef?.nome}</strong>
                  </p>
                </div>

                {/* Busca Rápida */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar natureza..."
                    value={opSearchTerm}
                    onChange={(e) => setOpSearchTerm(e.target.value)}
                    className="untitled-input pl-8 py-1.5 text-xs w-full"
                  />
                </div>
              </div>

              {searchedOpsInGroup.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 dark:bg-[#151A23] rounded-2xl border border-gray-200 dark:border-[#222938] space-y-2">
                  <Target className="w-7 h-7 text-gray-400 mx-auto" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Nenhuma operação encontrada para este filtro.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
                  {searchedOpsInGroup.map((op) => {
                    const isSelected = selectedOpId === op.id;
                    
                    // Checar se a equipe tem meta nesta operação
                    const [anoStr, mesStr] = dataExecucao.split('-');
                    const target = allTargets.find(t => t.tipo_operacao_id === op.id && t.mes === parseInt(mesStr, 10) && t.ano === parseInt(anoStr, 10));
                    const teamAlloc = target?.distribuicoes?.find(d => d.equipe === equipe);
                    const hasTeamGoal = !!teamAlloc && (teamAlloc.meta_quantitativa > 0 || teamAlloc.percentual_alocado > 0);

                    return (
                      <div
                        key={op.id}
                        onClick={() => handleSelectOpAndNext(op.id)}
                        className={`p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500 shadow-xs'
                            : 'border-gray-200 dark:border-[#222938] bg-white dark:bg-[#151A23] hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          {/* Código e Nome da Natureza na mesma linha */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                              {op.codigo_natureza}
                            </span>
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-snug truncate">
                              {op.titulo}
                            </h4>
                          </div>

                          {/* Badges de Meta e Rural */}
                          {(op.area_rural_obrigatoria || hasTeamGoal) && (
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {op.area_rural_obrigatoria && (
                                <span className="px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  Rural
                                </span>
                              )}
                              {hasTeamGoal && (
                                <span className="px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                  <FileCheck className="w-2.5 h-2.5" />
                                  <span>Meta: {teamAlloc?.meta_quantitativa}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 pl-1">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#222938]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar aos Grupos</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ETAPA 3: DADOS DA EXECUÇÃO & CONFIRMAÇÃO DE REQUISITOS */}
          {/* ========================================================= */}
          {currentStep === 3 && selectedOp && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200 text-xs">
              
              {/* Card Resumo da Operação Selecionada */}
              <div className="p-3.5 bg-gray-50 dark:bg-[#0E121A] rounded-2xl border border-gray-200 dark:border-[#222938] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${getGroupColor(selectedGroupDef?.cor).badgeClass}`}>
                    {React.createElement(getGroupIcon(selectedGroupDef?.icone), { className: 'w-5 h-5' })}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        [{selectedOp.codigo_natureza}]
                      </span>
                      <span className="text-[11px] text-gray-400 truncate">
                        • {selectedGroupDef?.nome}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {selectedOp.titulo}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 flex-shrink-0"
                >
                  Alterar Natureza
                </button>
              </div>

              {/* Status da Meta da Equipe */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                teamGoalInfo.hasGoal
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {teamGoalInfo.hasGoal ? (
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  )}
                  <span className="font-semibold">
                    {teamGoalInfo.hasGoal 
                      ? `Meta da equipe ${equipe}: ${teamGoalInfo.count} execuções (${teamGoalInfo.percent}% da meta total)`
                      : `A equipe "${equipe}" não possui meta atribuída para esta natureza neste mês.`
                    }
                  </span>
                </div>
                {!teamGoalInfo.hasGoal && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Sem meta
                  </span>
                )}
              </div>

              {/* Seleção da Natureza Específica para Operações com Naturezas Vinculadas (ex: Ordens de Serviço) */}
              {selectedOp.naturezas_vinculadas && selectedOp.naturezas_vinculadas.length > 0 && (
                <div className="p-3.5 sm:p-4 bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-800/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Natureza Executada na Ordem de Serviço / Operação *</span>
                      </h4>
                      <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                        Selecione qual das naturezas vinculadas foi executada nesta missão:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedOp.naturezas_vinculadas.map((nat) => {
                      const fullLabel = `${nat.codigo} - ${nat.titulo}`;
                      const isSelected = (naturezaExecutada === fullLabel || naturezaExecutada === nat.codigo || naturezaExecutada.startsWith(`${nat.codigo} -`));
                      
                      const targetForNat = monthTargetsForOp.find(t => 
                        t.naturezas_selecionadas?.some(code => code === nat.codigo || fullLabel.includes(code))
                      );
                      const teamAllocForNat = targetForNat?.distribuicoes?.find(d => d.equipe === equipe);
                      const hasTeamGoalForNat = !!teamAllocForNat && teamAllocForNat.meta_quantitativa > 0;

                      return (
                        <div
                          key={nat.id}
                          onClick={() => setNaturezaExecutada(fullLabel)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'border-blue-500 bg-white dark:bg-[#151A23] ring-2 ring-blue-500/80 shadow-xs'
                              : 'border-blue-200/70 dark:border-blue-900/50 bg-white/70 dark:bg-[#151A23]/60 hover:bg-white dark:hover:bg-[#151A23] hover:border-blue-300'
                          }`}
                        >
                          <div className="pt-0.5">
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-[11px] text-blue-700 dark:text-blue-300">
                                {nat.codigo}
                              </span>
                              {hasTeamGoalForNat ? (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                                  Meta {equipe}: {teamAllocForNat?.meta_quantitativa} ops
                                </span>
                              ) : targetForNat ? (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                                  Meta Pelotão: {targetForNat.meta_total} ops
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-[9px] font-medium">
                                  Sem meta no mês
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-xs text-gray-900 dark:text-white leading-snug mt-0.5">
                              {nat.titulo}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linha 1: Data, Equipe Executora e Militar Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Execução *
                  </label>
                  <input
                    type="date"
                    max={todayStr}
                    value={dataExecucao}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="untitled-input"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Equipe Executora *
                  </label>
                  <select
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                    className="untitled-input font-medium"
                    required
                  >
                    {teams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Militar Responsável *
                  </label>
                  <select
                    value={militarId}
                    onChange={(e) => setMilitarId(e.target.value)}
                    className="untitled-input"
                    required
                  >
                    <option value="">Selecione o militar...</option>
                    {militares.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.graduacao} {m.nome_guerra} ({m.numero_pm})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linha 2: REDS, Bairro e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nº REDS Gerado
                  </label>
                  <input
                    type="text"
                    placeholder="2026-004512345-001"
                    value={redsNumero}
                    onChange={(e) => setRedsNumero(formatReds(e.target.value))}
                    maxLength={18}
                    className="untitled-input font-mono tracking-wide"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Máscara: 20xx-xxxxxxxxx-001 (16 dígitos)</p>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Centro, São Geraldo"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="untitled-input"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Local / Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Praça Coronel Ramos"
                    value={localFato}
                    onChange={(e) => setLocalFato(e.target.value)}
                    className="untitled-input"
                  />
                </div>
              </div>

              {/* Flags: Área Rural e Envolvidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-[#0C111D]/40 rounded-xl border border-gray-200 dark:border-gray-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={areaRural}
                    onChange={(e) => setAreaRural(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Operação em Área Rural
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Pessoas Envolvidas:</span>
                  <input
                    type="number"
                    min={0}
                    value={quantidadeEnvolvidos}
                    onChange={(e) => setQuantidadeEnvolvidos(Number(e.target.value))}
                    className="w-16 p-1 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* CHECKBOXES DE CONFIRMAÇÃO DE REQUISITOS NO REDS */}
              {/* ========================================================= */}

              {/* VCP (A21.007) */}
              {selectedOp.codigo_natureza === 'A21.007' && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Confirmação de Requisitos da VCP no REDS</span>
                  </div>
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmVcpEnvolvidos}
                        onChange={(e) => setConfirmVcpEnvolvidos(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que há no mínimo 1 (um) envolvido cadastrado no REDS.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* RC (A19.000) */}
              {(selectedOp.codigo_natureza === 'A19.000' || (selectedOp.codigo_natureza.startsWith('A19.000') && selectedOp.codigo_natureza !== 'A19.001')) && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Confirmação de Requisitos da Reunião Comunitária (RC) no REDS</span>
                  </div>
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmRcEnvolvidos}
                        onChange={(e) => setConfirmRcEnvolvidos(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que há no mínimo 3 (três) envolvidos cadastrados no REDS.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* RCR (A19.001) */}
              {selectedOp.codigo_natureza === 'A19.001' && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Confirmação de Requisitos da Reunião Comunitária Rural (RCR) no REDS</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmRcrEnvolvidos}
                        onChange={(e) => setConfirmRcrEnvolvidos(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que há no mínimo 3 (três) envolvidos cadastrados no REDS.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmRcrRural}
                        onChange={(e) => {
                          setConfirmRcrRural(e.target.checked);
                          if (e.target.checked) setAreaRural(true);
                        }}
                        className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que a reunião foi realizada efetivamente na Área Rural.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* MRPP (A19.006) */}
              {selectedOp.codigo_natureza.startsWith('A19.006') && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Confirmação de Requisitos da Manutenção de Rede (MRPP) no REDS</span>
                  </div>
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmMrppEnvolvidos}
                        onChange={(e) => setConfirmMrppEnvolvidos(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que há no mínimo 3 (três) envolvidos cadastrados no REDS.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* VT (A20.028) ou VTCV (A20.001) */}
              {(selectedOp.codigo_natureza === 'A20.028' || selectedOp.codigo_natureza === 'A20.001') && (
                <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span>Confirmação de Requisitos da Visita Tranquilizadora no REDS</span>
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmVtVitima}
                        onChange={(e) => setConfirmVtVitima(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que a vítima foi devidamente cadastrada como envolvida no REDS.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer bg-white dark:bg-[#151A23] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmVtRedsOrigem}
                        onChange={(e) => setConfirmVtRedsOrigem(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded mt-0.5"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Confirmo que citei no histórico do REDS o número do REDS de origem do delito.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resultados / Observações Complementares
                </label>
                <textarea
                  rows={2}
                  placeholder="Pessoas abordadas, veículos fiscalizados, apreensões..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="untitled-input"
                />
              </div>

              {/* Auditoria & Informações do Usuário Logado */}
              <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#222938] flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Usuário que está registrando (Auditoria):</span>
                  <strong className="text-gray-700 dark:text-gray-300 font-semibold">
                    {user ? `${user.graduacao} ${user.nome_guerra} (${user.numero_pm})` : 'Usuário Autenticado'}
                  </strong>
                </div>
                <span className="text-gray-400">Rastreabilidade Ativa</span>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 font-bold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Operação Executada</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Histórico Recente */}
        <div className="untitled-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Histórico Recente
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Nenhuma operação lançada recentemente.</p>
            ) : (
              logs.map((log) => {
                const op = operations.find(o => o.id === log.tipo_operacao_id);
                return (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {op?.titulo || 'Operação'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                        {log.equipe}
                      </span>
                    </div>

                    {log.natureza_executada && (
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono text-[10px] font-semibold border border-blue-200 dark:border-blue-800 truncate" title={log.natureza_executada}>
                          ⚡ {log.natureza_executada}
                        </span>
                      </div>
                    )}

                    <p className="text-gray-500 truncate">
                      📍 {log.bairro || 'Salinas'} {log.local_fato ? `— ${log.local_fato}` : ''}
                    </p>

                    {log.reds_numero && (
                      <p className="text-[11px] font-mono text-gray-600 dark:text-gray-300">
                        REDS: {log.reds_numero}
                      </p>
                    )}

                    {log.reds_origem && (
                      <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                        REDS Origem: {log.reds_origem}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800/60 mt-1">
                      <div className="flex items-center gap-2">
                        <span>📅 {log.data_execucao}</span>
                        <span className="truncate max-w-[120px]" title={log.militar_responsavel_nome}>
                          👮 {log.militar_responsavel_nome}
                        </span>
                      </div>

                      {canUserDeleteLog(log) && (
                        <button
                          type="button"
                          onClick={() => setLogToDelete(log)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1"
                          title="Excluir lançamento (administradores, SOF ou autor)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold hidden sm:inline">Excluir</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE LANÇAMENTO */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Lançamento de Operação?
              </h3>
              <p className="text-gray-500">
                Esta ação cancelará o registro desta operação executada e recalculará as metas e indicadores imediatamente.
              </p>
            </div>

            {/* Dados do Log a ser Excluído */}
            <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#222938] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Operação:</span>
                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                  {operations.find(o => o.id === logToDelete.tipo_operacao_id)?.titulo || 'Operação'}
                </span>
              </div>
              {logToDelete.natureza_executada && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Natureza:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                    {logToDelete.natureza_executada}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Equipe / Data:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {logToDelete.equipe} • {logToDelete.data_execucao}
                </span>
              </div>
              {logToDelete.reds_numero && (
                <div className="flex justify-between">
                  <span className="text-gray-500">REDS:</span>
                  <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                    {logToDelete.reds_numero}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Militar Responsável:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                  {logToDelete.militar_responsavel_nome}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-[#222938]">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLog}
                className="py-2 px-4 flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sim, Excluir Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
