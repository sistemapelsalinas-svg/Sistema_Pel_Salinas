'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { OperationType, EscalaMilitar, OperationExecutionLog, OperationGroupDef, MonthlyTarget } from '@/lib/types';
import { validateOperationLaunch } from '@/lib/validation';
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
  FileCheck
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

const COLOR_MAP: Record<string, { bgClass: string; badgeClass: string; activeClass: string }> = {
  blue: { bgClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', activeClass: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' },
  emerald: { bgClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', activeClass: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
  purple: { bgClass: 'bg-purple-500', badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800', activeClass: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300' },
  amber: { bgClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', activeClass: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
  rose: { bgClass: 'bg-rose-500', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800', activeClass: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' },
  indigo: { bgClass: 'bg-indigo-500', badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', activeClass: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' },
  cyan: { bgClass: 'bg-cyan-500', badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', activeClass: 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300' },
  slate: { bgClass: 'bg-slate-500', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 border-slate-200 dark:border-slate-800', activeClass: 'border-slate-500 bg-slate-50/50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300' }
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

  const [groups, setGroups] = useState<OperationGroupDef[]>([]);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [militares, setMilitares] = useState<EscalaMilitar[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [logs, setLogs] = useState<OperationExecutionLog[]>([]);
  const [allTargets, setAllTargets] = useState<MonthlyTarget[]>([]);

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

  const [entidadeComunidade, setEntidadeComunidade] = useState<string>('');
  const [pauta, setPauta] = useState<string>('');
  const [encaminhamentos, setEncaminhamentos] = useState<string>('');
  const [orientacoes, setOrientacoes] = useState<string>('');
  const [demandaIdentificada, setDemandaIdentificada] = useState<string>('');
  const [redeAtendida, setRedeAtendida] = useState<string>('');
  const [providencias, setProvidencias] = useState<string>('');
  const [pessoaAtendida, setPessoaAtendida] = useState<string>('');
  const [vitimaAtendida, setVitimaAtendida] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Carregar dados iniciais
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

    // Equipe inicial
    if (queryEquipe && loadedTeams.includes(queryEquipe)) {
      setEquipe(queryEquipe);
    } else if (user?.equipe_padrao && loadedTeams.includes(user.equipe_padrao)) {
      setEquipe(user.equipe_padrao);
    } else if (loadedTeams.length > 0) {
      setEquipe(loadedTeams[0]);
    }

    // Grupo e Operação inicial
    if (queryOpId) {
      const foundOp = ops.find(o => o.id === queryOpId);
      if (foundOp) {
        setSelectedGroup(foundOp.grupo);
        setSelectedOpId(foundOp.id);
      } else if (loadedGroups.length > 0) {
        setSelectedGroup(loadedGroups[0].id);
      }
    } else if (loadedGroups.length > 0) {
      setSelectedGroup(loadedGroups[0].id);
    }

    // Militar responsável pré-selecionado como o usuário logado
    if (user) {
      const userPmClean = (user.numero_pm || '').replace(/\D/g, '');
      const matchMil = mils.find(m => (m.numero_pm || '').replace(/\D/g, '') === userPmClean || m.id === user.id);
      if (matchMil) {
        setMilitarId(matchMil.id);
      } else if (mils.length > 0) {
        setMilitarId(mils[0].id);
      }
    } else if (mils.length > 0) {
      setMilitarId(mils[0].id);
    }
  }, [user]);

  // Filtrar operações pelo grupo selecionado
  const opsInGroup = useMemo(() => {
    return operations.filter(o => o.grupo === selectedGroup);
  }, [operations, selectedGroup]);

  // Ao mudar de grupo, ajustar a operação selecionada caso ela não pertença ao grupo atual
  useEffect(() => {
    if (opsInGroup.length > 0) {
      const isCurrentInGroup = opsInGroup.some(o => o.id === selectedOpId);
      if (!isCurrentInGroup) {
        setSelectedOpId(opsInGroup[0].id);
      }
    } else {
      setSelectedOpId('');
    }
  }, [selectedGroup, opsInGroup, selectedOpId]);

  const selectedOp = useMemo(() => {
    return operations.find(o => o.id === selectedOpId);
  }, [operations, selectedOpId]);

  // Atualizar flags automáticas quando a operação muda
  useEffect(() => {
    if (selectedOp) {
      if (selectedOp.area_rural_obrigatoria) setAreaRural(true);
      if (selectedOp.min_envolvidos) setQuantidadeEnvolvidos(prev => Math.max(prev, selectedOp.min_envolvidos ?? 0));
    }
  }, [selectedOp]);

  // Verificar se a equipe selecionada possui meta para a operação no mês/ano da data de execução
  const teamGoalInfo = useMemo(() => {
    if (!selectedOpId || !dataExecucao || !equipe) return { hasGoal: false, count: 0, percent: 0 };
    const [anoStr, mesStr] = dataExecucao.split('-');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    const target = allTargets.find(t => t.tipo_operacao_id === selectedOpId && t.mes === mes && t.ano === ano);
    if (!target || !target.distribuicoes) return { hasGoal: false, count: 0, percent: 0 };

    const teamAlloc = target.distribuicoes.find(d => d.equipe === equipe);
    if (!teamAlloc || (teamAlloc.meta_quantitativa <= 0 && teamAlloc.percentual_alocado <= 0)) {
      return { hasGoal: false, count: 0, percent: 0 };
    }

    return {
      hasGoal: true,
      count: teamAlloc.meta_quantitativa,
      percent: teamAlloc.percentual_alocado
    };
  }, [selectedOpId, dataExecucao, equipe, allTargets]);

  const handleDateChange = (val: string) => {
    if (val > todayStr) {
      setValidationErrors(['A data de execução não pode ser futura. Seleção ajustada para a data atual.']);
      setDataExecucao(todayStr);
      return;
    }
    setValidationErrors(prev => prev.filter(e => !e.includes('data futura') && !e.includes('data de execução')));
    setDataExecucao(val);
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

    // 4. Validações de Requisitos de Negócio da Operação
    const validation = validateOperationLaunch(selectedOp, {
      reds_numero: redsNumero,
      reds_origem: redsOrigem,
      quantidade_envolvidos: quantidadeEnvolvidos,
      area_rural: areaRural,
      detalhes_interacao: {
        entidade_comunidade: entidadeComunidade,
        pauta,
        encaminhamentos,
        orientacoes,
        demanda_identificada: demandaIdentificada,
        rede_atendida: redeAtendida,
        providencias,
        pessoa_atendida: pessoaAtendida,
        vitima_atendida: vitimaAtendida
      }
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
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
        entidade_comunidade: entidadeComunidade || undefined,
        pauta: pauta || undefined,
        encaminhamentos: encaminhamentos || undefined,
        orientacoes: orientacoes || undefined,
        demanda_identificada: demandaIdentificada || undefined,
        rede_atendida: redeAtendida || undefined,
        providencias: providencias || undefined,
        pessoa_atendida: pessoaAtendida || undefined,
        vitima_atendida: vitimaAtendida || undefined
      },
      observacoes: observacoes || undefined,
      created_by: user?.id,
      created_by_nome: user ? `${user.graduacao} ${user.nome_guerra}` : undefined,
      created_by_pm: user?.numero_pm
    });

    setLogs(storage.getLogs());
    setSuccessMsg(`Operação "${selectedOp.titulo}" registrada com sucesso para a equipe ${equipe}!`);
    setTimeout(() => setSuccessMsg(''), 4500);

    // Limpar campos de entrada variáveis
    setRedsNumero('');
    setRedsOrigem('');
    setObservacoes('');
    setPessoaAtendida('');
    setVitimaAtendida('');
    setOrientacoes('');
    setDemandaIdentificada('');
    setPauta('');
    setEncaminhamentos('');
    setProvidencias('');
  };

  return (
    <div className="space-y-6">
      
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
            <span>Validações necessárias:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="lg:col-span-2 untitled-card p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* ETAPA 1: SELEÇÃO DO GRUPO OPERACIONAL */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-800 dark:text-gray-200 text-xs">
                1. Grupo de Operações *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {groups.map((g) => {
                  const Icon = getGroupIcon(g.icone);
                  const color = getGroupColor(g.cor);
                  const isSelected = selectedGroup === g.id;
                  const countInGroup = operations.filter(o => o.grupo === g.id).length;

                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGroup(g.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected 
                          ? `${color.activeClass} ring-2 ring-emerald-500 shadow-xs` 
                          : 'border-gray-200 dark:border-[#222938] bg-white dark:bg-[#151A23] hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? color.badgeClass : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs leading-tight line-clamp-1">{g.nome}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{countInGroup} naturezas</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ETAPA 2: SELEÇÃO DA NATUREZA / OPERAÇÃO */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-gray-800 dark:text-gray-200 text-xs">
                  2. Natureza / Tipo de Operação *
                </label>
                {selectedOp && (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Código: {selectedOp.codigo_natureza}
                  </span>
                )}
              </div>
              
              <select
                value={selectedOpId}
                onChange={(e) => setSelectedOpId(e.target.value)}
                className="untitled-input font-medium py-2 text-xs"
                required
              >
                {opsInGroup.length === 0 && (
                  <option value="" disabled>Nenhuma operação cadastrada neste grupo</option>
                )}
                {opsInGroup.map((op) => (
                  <option key={op.id} value={op.id}>
                    [{op.codigo_natureza}] {op.titulo}
                  </option>
                ))}
              </select>

              {/* Status da Meta da Equipe */}
              {selectedOp && (
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
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
              )}
            </div>

            {/* Linha 1: Data, Equipe e Militar Responsável */}
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

            {/* CAMPOS CONDICIONAIS DE INTERAÇÕES COMUNITÁRIAS */}
            {selectedOp?.codigo_natureza === 'A21.007' && ( // VCP
              <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Requisitos da VCP (Visita Comunitária Preventiva):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Orientações Repassadas *</label>
                    <textarea
                      rows={2}
                      placeholder="Orientações de autoproteção e prevenção..."
                      value={orientacoes}
                      onChange={(e) => setOrientacoes(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Demanda Identificada *</label>
                    <textarea
                      rows={2}
                      placeholder="Demandas trazidas pelo morador..."
                      value={demandaIdentificada}
                      onChange={(e) => setDemandaIdentificada(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedOp?.codigo_natureza.startsWith('A19.000') || selectedOp?.codigo_natureza === 'A19.001') && ( // RC
              <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Requisitos da Reunião Comunitária (RC):
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Entidade / Comunidade *</label>
                    <input
                      type="text"
                      placeholder="Ex: Associação de Moradores"
                      value={entidadeComunidade}
                      onChange={(e) => setEntidadeComunidade(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Pauta *</label>
                      <textarea
                        rows={2}
                        placeholder="Pauta da reunião..."
                        value={pauta}
                        onChange={(e) => setPauta(e.target.value)}
                        className="untitled-input"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Encaminhamentos *</label>
                      <textarea
                        rows={2}
                        placeholder="Encaminhamentos acertados..."
                        value={encaminhamentos}
                        onChange={(e) => setEncaminhamentos(e.target.value)}
                        className="untitled-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedOp?.codigo_natureza.startsWith('A19.006') && ( // MRPP
              <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Requisitos da MRPP (Manutenção de Rede):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Rede Atendida *</label>
                    <input
                      type="text"
                      placeholder="Ex: Rede de Vizinhos Protegidos"
                      value={redeAtendida}
                      onChange={(e) => setRedeAtendida(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Providências *</label>
                    <input
                      type="text"
                      placeholder="Ações adotadas..."
                      value={providencias}
                      onChange={(e) => setProvidencias(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedOp?.codigo_natureza === 'A20.028' || selectedOp?.codigo_natureza === 'A20.001') && ( // VT
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-3">
                <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                  Requisitos da Visita Tranquilizadora:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {selectedOp.codigo_natureza === 'A20.028' ? 'Pessoa Atendida (Vítima de Furto) *' : 'Vítima Atendida *'}
                    </label>
                    <input
                      type="text"
                      placeholder="Nome da pessoa atendida"
                      value={selectedOp.codigo_natureza === 'A20.028' ? pessoaAtendida : vitimaAtendida}
                      onChange={(e) => selectedOp.codigo_natureza === 'A20.028' ? setPessoaAtendida(e.target.value) : setVitimaAtendida(e.target.value)}
                      className="untitled-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 dark:text-amber-300 mb-1">
                      REDS de Origem do Delito * (OBRIGATÓRIO)
                    </label>
                    <input
                      type="text"
                      placeholder="2026-004500123-001"
                      value={redsOrigem}
                      onChange={(e) => setRedsOrigem(formatReds(e.target.value))}
                      maxLength={18}
                      className="untitled-input font-mono font-bold border-amber-300 dark:border-amber-700"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resultados / Observações
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

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                className="btn-primary py-2.5 px-6 font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Operação Executada</span>
              </button>
            </div>

          </form>
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
                      <span>📅 {log.data_execucao}</span>
                      <span className="truncate max-w-[140px]" title={log.militar_responsavel_nome}>
                        👮 {log.militar_responsavel_nome}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
