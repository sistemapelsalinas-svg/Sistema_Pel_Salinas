'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { MonthlyTarget, OperationType, OperationGroup, TeamTargetAllocation } from '@/lib/types';
import { distributeEqually, distributeByPercentages } from '@/lib/validation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Target, 
  Copy, 
  Plus, 
  Trash2, 
  PieChart, 
  Calendar, 
  Users, 
  AlertCircle,
  X,
  Check,
  AlertTriangle,
  Search,
  Layers,
  Shield,
  FileSpreadsheet,
  HeartHandshake,
  Compass,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

const GROUP_CONFIG: Record<OperationGroup, {
  label: string;
  shortLabel: string;
  badgeColor: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = {
  POG: {
    label: 'POG',
    shortLabel: 'POG',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    bgLight: 'bg-blue-50/40 dark:bg-blue-950/10',
    borderColor: 'border-blue-200 dark:border-blue-900/60',
    textColor: 'text-blue-700 dark:text-blue-400',
    icon: Shield,
    description: 'Ações de policiamento ostensivo geral, trânsito, batidas policiais, abordagens e presença em ZQC.'
  },
  PROXIMIDADE: {
    label: 'Policiamento de Proximidade',
    shortLabel: 'Policiamento de Proximidade',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    bgLight: 'bg-emerald-50/40 dark:bg-emerald-950/10',
    borderColor: 'border-emerald-200 dark:border-emerald-900/60',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    icon: Compass,
    description: 'Patrulha Rural, Patrulha Escolar/PROERD, GEPAR, Bases de Segurança Comunitária e Redes de Proteção Mulher (RPPM).'
  },
  INTERACOES_COMUNITARIAS: {
    label: 'Interações Comunitárias',
    shortLabel: 'Interações Comunitárias',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    bgLight: 'bg-purple-50/40 dark:bg-purple-950/10',
    borderColor: 'border-purple-200 dark:border-purple-900/60',
    textColor: 'text-purple-700 dark:text-purple-400',
    icon: HeartHandshake,
    description: 'Visitas comunitárias (VCP), reuniões com moradores/rurais, redes protegidas (MRPP) e visitas tranquilizadoras (VT).'
  },
  ORDENS_SERVICO: {
    label: 'Ordens de Serviço',
    shortLabel: 'Ordens de Serviço',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    bgLight: 'bg-amber-50/40 dark:bg-amber-950/10',
    borderColor: 'border-amber-200 dark:border-amber-900/60',
    textColor: 'text-amber-700 dark:text-amber-400',
    icon: FileSpreadsheet,
    description: 'Ordens de serviço específicas, fiscalização em bares, visibilidade e Operação AgroGerais Segura no campo.'
  }
};

export default function GestaoMetasPage() {
  const currentYear = new Date().getFullYear();
  const currentDateFormatted = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const [mes, setMes] = useState(8);
  const [ano, setAno] = useState(2026);
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtros de visualização
  const [selectedTabGroup, setSelectedTabGroup] = useState<OperationGroup | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Distribuição para uma Operação
  const [selectedTarget, setSelectedTarget] = useState<MonthlyTarget | null>(null);
  const [distributionMode, setDistributionMode] = useState<'EQUAL' | 'PERCENTAGE'>('PERCENTAGE');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [customPercentages, setCustomPercentages] = useState<{ [team: string]: number }>({});
  const [autoBalanceOthers, setAutoBalanceOthers] = useState<boolean>(true);

  const availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    setOperations(storage.getOperations());
    setAllTeams(storage.getTeams());
    loadTargets();
  }, [mes, ano]);

  const loadTargets = () => {
    const currentTargets = storage.getTargets(mes, ano);
    setTargets(currentTargets);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleYearSelectChange = (newYear: number) => {
    if (newYear !== currentYear) {
      setPendingYear(newYear);
    } else {
      setAno(newYear);
    }
  };

  const confirmYearChange = () => {
    if (pendingYear) {
      setAno(pendingYear);
      setPendingYear(null);
    }
  };

  const cancelYearChange = () => {
    setPendingYear(null);
  };

  const handleCopyFromPrevious = () => {
    const result = storage.copyTargetsFromPreviousMonth(mes, ano);
    if (result.success) {
      loadTargets();
      showToast('success', `${result.count} metas copiadas do mês anterior com sucesso.`);
    } else {
      showToast('error', 'Não foram encontradas metas cadastradas no mês anterior para cópia.');
    }
  };

  // Ao adicionar meta para uma operação, as equipes vêm ZERADAS (sem pré-seleção forçada)
  const handleAddTargetForOp = (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;

    const defaultTotal = 15;

    const newTarget: MonthlyTarget = {
      id: `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mes,
      ano,
      tipo_operacao_id: opId,
      meta_total: defaultTotal,
      distribuicoes: [] // Inicializa sem equipes pré-selecionadas
    };

    const all = storage.getAllTargets();
    const updated = [...all, newTarget];
    storage.saveTargets(updated);
    loadTargets();
    showToast('success', `Meta para ${op.titulo} criada. Aloque as equipes clicando em "Distribuir Equipes".`);
  };

  // Ao abrir o modal de distribuição:
  // Se a meta já tem equipes salvas, carrega-as. Se não tem nenhuma equipe (nova), NÃO pré-seleciona nada (array vazio).
  const handleOpenDistributionModal = (target: MonthlyTarget) => {
    const currentTeams = storage.getTeams();
    setAllTeams(currentTeams);
    setSelectedTarget(target);

    const existingTeams = target.distribuicoes && target.distribuicoes.length > 0
      ? target.distribuicoes.map(d => d.equipe).filter(eq => currentTeams.includes(eq))
      : [];

    setSelectedTeams(existingTeams);

    const pcts: { [team: string]: number } = {};
    if (existingTeams.length > 0) {
      const defaultPct = Number((100 / existingTeams.length).toFixed(1));
      target.distribuicoes?.forEach(d => {
        if (currentTeams.includes(d.equipe)) {
          pcts[d.equipe] = d.percentual_alocado || defaultPct;
        }
      });
      existingTeams.forEach(t => {
        if (pcts[t] === undefined) pcts[t] = defaultPct;
      });
    }
    setCustomPercentages(pcts);
  };

  const handleSelectAllTeams = () => {
    const currentTeams = storage.getTeams();
    setSelectedTeams([...currentTeams]);
    rebalanceEqually([...currentTeams]);
  };

  const handleSelectMainShiftTeams = () => {
    const currentTeams = storage.getTeams();
    const main = currentTeams.filter(t => 
      t.includes('ALFA') || t.includes('BRAVO') || t.includes('CHARLIE') || t.includes('ROTAM') || t.includes('TM')
    );
    const selected = main.length > 0 ? main : currentTeams;
    setSelectedTeams(selected);
    rebalanceEqually(selected);
  };

  const handleSelectRuralTeams = () => {
    const currentTeams = storage.getTeams();
    const rural = currentTeams.filter(t => t.toUpperCase().includes('RURAL') || t.toUpperCase().includes('AGRO'));
    const selected = rural.length > 0 ? rural : currentTeams;
    setSelectedTeams(selected);
    rebalanceEqually(selected);
  };

  const handleClearTeams = () => {
    setSelectedTeams([]);
    setCustomPercentages({});
  };

  const toggleTeam = (team: string) => {
    let nextTeams: string[];
    if (selectedTeams.includes(team)) {
      nextTeams = selectedTeams.filter(t => t !== team);
    } else {
      nextTeams = [...selectedTeams, team];
    }
    setSelectedTeams(nextTeams);
    rebalanceEqually(nextTeams);
  };

  // Rebalanceamento igualitário para fechar exatamente 100%
  const rebalanceEqually = (teams: string[]) => {
    if (teams.length === 0) {
      setCustomPercentages({});
      return;
    }
    const basePct = Math.floor((100 / teams.length) * 10) / 10;
    const nextPcts: { [team: string]: number } = {};
    let sum = 0;
    teams.forEach((t, i) => {
      if (i === teams.length - 1) {
        nextPcts[t] = Number((100 - sum).toFixed(1));
      } else {
        nextPcts[t] = basePct;
        sum += basePct;
      }
    });
    setCustomPercentages(nextPcts);
  };

  // Atualização dinâmica inteligente de porcentagem para uma equipe
  const handlePercentageChange = (team: string, rawVal: number) => {
    const val = Math.max(0, Math.min(100, isNaN(rawVal) ? 0 : rawVal));
    
    if (!autoBalanceOthers || selectedTeams.length <= 1) {
      // Modo sem balanceamento automático: define diretamente o valor digitado
      setCustomPercentages(prev => ({
        ...prev,
        [team]: val
      }));
      return;
    }

    // Modo com auto-balanceamento: distribui os (100 - val)% restantes proporcionalmente entre as outras equipes
    const remaining = Math.max(0, 100 - val);
    const otherTeams = selectedTeams.filter(t => t !== team);

    if (otherTeams.length === 0) {
      setCustomPercentages({ [team]: 100 });
      return;
    }

    const currentOtherSum = otherTeams.reduce((acc, t) => acc + (customPercentages[t] || 0), 0);
    const nextPcts: { [t: string]: number } = { [team]: val };

    if (currentOtherSum > 0 && remaining > 0) {
      let allocatedOther = 0;
      otherTeams.forEach((t, idx) => {
        if (idx === otherTeams.length - 1) {
          nextPcts[t] = Math.max(0, Number((remaining - allocatedOther).toFixed(1)));
        } else {
          const ratio = (customPercentages[t] || 0) / currentOtherSum;
          const share = Math.max(0, Math.floor(ratio * remaining * 10) / 10);
          nextPcts[t] = share;
          allocatedOther += share;
        }
      });
    } else {
      const share = Math.floor((remaining / otherTeams.length) * 10) / 10;
      let allocatedOther = 0;
      otherTeams.forEach((t, idx) => {
        if (idx === otherTeams.length - 1) {
          nextPcts[t] = Math.max(0, Number((remaining - allocatedOther).toFixed(1)));
        } else {
          nextPcts[t] = share;
          allocatedOther += share;
        }
      });
    }

    setCustomPercentages(nextPcts);
  };

  // Atualização direta pelo número de operações
  const handleOpsCountChange = (team: string, opsCount: number) => {
    if (!selectedTarget || selectedTarget.meta_total <= 0) return;
    const clampedOps = Math.max(0, Math.min(selectedTarget.meta_total, isNaN(opsCount) ? 0 : opsCount));
    const calculatedPct = Number(((clampedOps / selectedTarget.meta_total) * 100).toFixed(1));
    handlePercentageChange(team, calculatedPct);
  };

  // Cálculo da soma atual das porcentagens
  const currentTotalPercentage = useMemo(() => {
    if (selectedTeams.length === 0) return 0;
    const sum = selectedTeams.reduce((acc, t) => acc + (customPercentages[t] || 0), 0);
    return Number(sum.toFixed(1));
  }, [selectedTeams, customPercentages]);

  const isPercentageExceeded = currentTotalPercentage > 100.05;

  const handleSaveDistribution = () => {
    if (!selectedTarget) return;

    if (isPercentageExceeded) {
      showToast('error', `A soma das porcentagens é ${currentTotalPercentage}%, excedendo o limite de 100%. Ajuste antes de salvar.`);
      return;
    }

    let newDistributions: TeamTargetAllocation[] = [];
    if (selectedTeams.length > 0) {
      if (distributionMode === 'EQUAL') {
        const dist = distributeEqually(selectedTarget.meta_total, selectedTeams);
        newDistributions = Object.entries(dist).map(([team, data]) => ({
          id: `dst-${Date.now()}-${team}`,
          meta_mensal_id: selectedTarget.id,
          equipe: team,
          percentual_alocado: data.percent,
          meta_quantitativa: data.count
        }));
      } else {
        const dist = distributeByPercentages(selectedTarget.meta_total, customPercentages);
        newDistributions = Object.entries(dist).map(([team, data]) => ({
          id: `dst-${Date.now()}-${team}`,
          meta_mensal_id: selectedTarget.id,
          equipe: team,
          percentual_alocado: data.percent,
          meta_quantitativa: data.count
        }));
      }
    }

    const all = storage.getAllTargets();
    const idx = all.findIndex(t => t.id === selectedTarget.id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        distribuicoes: newDistributions
      };
      storage.saveTargets(all);
      loadTargets();
      showToast('success', selectedTeams.length > 0 
        ? `Distribuição salva com sucesso para ${selectedTeams.length} equipes.` 
        : 'Meta definida como geral da fração (sem equipes específicas alocadas).'
      );
    }
    setSelectedTarget(null);
  };

  const handleTotalChange = (targetId: string, newTotal: number) => {
    const all = storage.getAllTargets();
    const idx = all.findIndex(t => t.id === targetId);
    if (idx === -1) return;

    const t = all[idx];
    const teams = t.distribuicoes && t.distribuicoes.length > 0
      ? t.distribuicoes.map(d => d.equipe)
      : [];

    let newDistributions: TeamTargetAllocation[] = [];
    if (teams.length > 0) {
      const dist = distributeEqually(newTotal, teams);
      newDistributions = Object.entries(dist).map(([team, data]) => ({
        id: `dst-${Date.now()}-${team}`,
        meta_mensal_id: t.id,
        equipe: team,
        percentual_alocado: data.percent,
        meta_quantitativa: data.count
      }));
    }

    all[idx] = {
      ...t,
      meta_total: newTotal,
      distribuicoes: newDistributions
    };

    storage.saveTargets(all);
    loadTargets();
  };

  const handleDeleteTarget = (targetId: string) => {
    const all = storage.getAllTargets();
    const filtered = all.filter(t => t.id !== targetId);
    storage.saveTargets(filtered);
    loadTargets();
    showToast('success', 'Meta removida da grade com sucesso.');
  };

  // Mapeamento e agrupamento de metas
  const enrichedTargets = useMemo(() => {
    return targets.map(tgt => {
      const op = operations.find(o => o.id === tgt.tipo_operacao_id);
      return {
        ...tgt,
        opDetails: op
      };
    });
  }, [targets, operations]);

  // Filtragem por busca e tab
  const filteredTargets = useMemo(() => {
    return enrichedTargets.filter(item => {
      const op = item.opDetails;
      if (!op) return false;

      // Filtro por grupo
      if (selectedTabGroup !== 'ALL' && op.grupo !== selectedTabGroup) {
        return false;
      }

      // Filtro por busca
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = op.titulo.toLowerCase().includes(query);
        const matchCode = op.codigo_natureza.toLowerCase().includes(query);
        const matchDesc = op.descricao.toLowerCase().includes(query);
        const matchTeam = item.distribuicoes?.some(d => d.equipe.toLowerCase().includes(query));
        if (!matchTitle && !matchCode && !matchDesc && !matchTeam) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedTargets, selectedTabGroup, searchTerm]);

  // Operações ainda não adicionadas para este mês
  const availableOps = useMemo(() => {
    const usedOpIds = new Set(targets.map(t => t.tipo_operacao_id));
    return operations.filter(op => op.ativo && !usedOpIds.has(op.id));
  }, [operations, targets]);

  // Agrupamento das operações disponíveis para adicionar
  const availableOpsByGroup = useMemo(() => {
    const groups: Record<OperationGroup, OperationType[]> = {
      POG: [],
      PROXIMIDADE: [],
      INTERACOES_COMUNITARIAS: [],
      ORDENS_SERVICO: []
    };
    availableOps.forEach(op => {
      if (groups[op.grupo]) {
        groups[op.grupo].push(op);
      }
    });
    return groups;
  }, [availableOps]);

  // Contagens para os cards e tabs
  const groupStats = useMemo(() => {
    const counts: Record<string, { count: number; totalOps: number }> = {
      ALL: { count: targets.length, totalOps: targets.reduce((acc, t) => acc + t.meta_total, 0) },
      POG: { count: 0, totalOps: 0 },
      PROXIMIDADE: { count: 0, totalOps: 0 },
      INTERACOES_COMUNITARIAS: { count: 0, totalOps: 0 },
      ORDENS_SERVICO: { count: 0, totalOps: 0 }
    };

    enrichedTargets.forEach(t => {
      if (t.opDetails?.grupo && counts[t.opDetails.grupo]) {
        counts[t.opDetails.grupo].count++;
        counts[t.opDetails.grupo].totalOps += t.meta_total;
      }
    });

    return counts;
  }, [enrichedTargets, targets]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in slide-in-from-top-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Alerta de Edição em Ano Diferente do Corrente */}
      {ano !== currentYear && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Você está visualizando/editando metas para o ano <strong>{ano}</strong> (Ano corrente: <strong>{currentYear}</strong>).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAno(currentYear)}
            className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold rounded-lg transition-colors text-[11px] self-start sm:self-auto"
          >
            Voltar para {currentYear}
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. CABEÇALHO & SELEÇÃO DE PERÍODO (MÊS / ANO) */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Planejamento de Metas Operacionais
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Distribuição quantitativa por grupo: POG, Policiamento de Proximidade, Interações Comunitárias e Ordens de Serviço.
              </p>
            </div>
          </div>
        </div>

        {/* Seletores de Mês, Ano e Cópia */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151A23] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#222938] shadow-xs text-xs">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            
            {/* Mês */}
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {monthNames.map((mName, idx) => (
                <option key={idx + 1} value={idx + 1} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {mName}
                </option>
              ))}
            </select>
            
            <span className="text-gray-300 dark:text-gray-600">/</span>
            
            {/* Ano */}
            <select
              value={ano}
              onChange={(e) => handleYearSelectChange(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {y} {y === currentYear ? '(Atual)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopyFromPrevious}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            title="Copiar grade de metas do mês anterior"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>Copiar Mês Anterior</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BARRA DE FILTROS POR GRUPO DE OPERAÇÕES & BUSCA */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-[#151A23] p-3 rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs">
        
        {/* Tabs Segmentadas dos 4 Grupos Oficiais */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedTabGroup('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
              selectedTabGroup === 'ALL'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todas as Metas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedTabGroup === 'ALL' ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {groupStats.ALL.count}
            </span>
          </button>

          {(['POG', 'PROXIMIDADE', 'INTERACOES_COMUNITARIAS', 'ORDENS_SERVICO'] as OperationGroup[]).map((grpKey) => {
            const cfg = GROUP_CONFIG[grpKey];
            const Icon = cfg.icon;
            const isSelected = selectedTabGroup === grpKey;
            const stat = groupStats[grpKey] || { count: 0, totalOps: 0 };

            return (
              <button
                key={grpKey}
                type="button"
                onClick={() => setSelectedTabGroup(grpKey)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? `${cfg.badgeColor} shadow-xs font-extrabold`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.shortLabel}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-white/40 dark:bg-black/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.count} ({stat.totalOps})
                </span>
              </button>
            );
          })}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por nome, código ou equipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. LISTAGEM DE METAS AGRUPADAS DINAMICAMENTE */}
      {/* ========================================================= */}
      <div className="space-y-6">
        {filteredTargets.length === 0 ? (
          <div className="untitled-card p-10 text-center space-y-3">
            <Target className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
              Nenhuma meta encontrada para os filtros selecionados.
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Utilize a seção abaixo para adicionar operações e definir o planejamento mensal de {monthNames[mes - 1]}/{ano}.
            </p>
          </div>
        ) : (
          (['POG', 'PROXIMIDADE', 'INTERACOES_COMUNITARIAS', 'ORDENS_SERVICO'] as OperationGroup[])
            .filter(grpKey => selectedTabGroup === 'ALL' || selectedTabGroup === grpKey)
            .map((groupKey) => {
              const groupTargets = filteredTargets.filter(t => t.opDetails?.grupo === groupKey);
              if (groupTargets.length === 0) return null;

              const groupCfg = GROUP_CONFIG[groupKey];
              const GroupIcon = groupCfg.icon;

              return (
                <div key={groupKey} className="space-y-3">
                  
                  {/* Cabeçalho do Grupo */}
                  <div className={`p-3 rounded-2xl border ${groupCfg.bgLight} ${groupCfg.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${groupCfg.badgeColor} flex items-center justify-center`}>
                        <GroupIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-extrabold text-sm text-gray-900 dark:text-white">
                            {groupCfg.label}
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] text-gray-700 dark:text-gray-300">
                            {groupTargets.length} {groupTargets.length === 1 ? 'operação' : 'operações'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {groupCfg.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-auto self-end">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                        Meta do Grupo:
                      </span>
                      <span className={`text-base font-extrabold ${groupCfg.textColor}`}>
                        {groupTargets.reduce((acc, t) => acc + t.meta_total, 0)} <span className="text-xs font-medium text-gray-400">ações</span>
                      </span>
                    </div>
                  </div>

                  {/* Grid de Cards de Operações do Grupo */}
                  <div className="space-y-3">
                    {groupTargets.map((tgt) => {
                      const op = tgt.opDetails;
                      if (!op) return null;

                      const hasTeamsAllocated = tgt.distribuicoes && tgt.distribuicoes.length > 0;

                      return (
                        <div
                          key={tgt.id}
                          className="untitled-card p-4 sm:p-5 space-y-3 hover:border-gray-300 dark:hover:border-[#283042] transition-all"
                        >
                          {/* Linha Superior: Código, Título, Meta Total e Botão Distribuir */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                <Target className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] font-mono font-bold text-xs text-gray-800 dark:text-gray-200">
                                    {op.codigo_natureza}
                                  </span>
                                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                                    {op.titulo}
                                  </h3>
                                  {op.area_rural_obrigatoria && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                                      Zona Rural
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                                  {op.descricao}
                                </p>
                              </div>
                            </div>

                            {/* Controles de Meta Total e Distribuição */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {/* Input Meta Total */}
                              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0E121A] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#222938]">
                                <span className="text-xs text-gray-500 font-medium">Meta:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={tgt.meta_total}
                                  onChange={(e) => handleTotalChange(tgt.id, Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-12 bg-transparent text-right font-extrabold text-xs text-gray-900 dark:text-white focus:outline-none"
                                />
                                <span className="text-xs text-gray-400 font-semibold">ops</span>
                              </div>

                              {/* Botão de Distribuir Equipes */}
                              <button
                                type="button"
                                onClick={() => handleOpenDistributionModal(tgt)}
                                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                                  hasTeamsAllocated
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                                    : 'bg-white text-gray-700 border-dashed border-gray-300 dark:bg-[#151A23] dark:text-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                                }`}
                              >
                                <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{hasTeamsAllocated ? `Distribuído (${tgt.distribuicoes?.length} eq.)` : 'Distribuir Equipes'}</span>
                              </button>

                              {/* Botão de Excluir Meta */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTarget(tgt.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Excluir meta desta operação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Visualização da Distribuição das Equipes */}
                          {hasTeamsAllocated ? (
                            <div className="pt-2 border-t border-gray-100 dark:border-[#222938]">
                              <div className="flex items-center justify-between pb-1.5">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                  Alocação por Equipe ({tgt.distribuicoes?.length} equipes participantes):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDistributionModal(tgt)}
                                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                                >
                                  <span>Ajustar cotas / %</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {tgt.distribuicoes?.map((dst) => (
                                  <div
                                    key={dst.id}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-[#0E121A] border border-gray-200/90 dark:border-[#222938] flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">
                                        {dst.equipe}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        {dst.percentual_alocado}% da cota
                                      </span>
                                    </div>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
                                      {dst.meta_quantitativa} ops
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-gray-100 dark:border-[#222938] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/60 dark:bg-[#0E121A]/50 p-2.5 rounded-xl text-xs text-gray-500">
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <Users className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>
                                  <strong>Sem equipes alocadas:</strong> Esta meta de {tgt.meta_total} operações conta como cota geral da fração até que você defina as equipes.
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenDistributionModal(tgt)}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Definir Equipes Agora</span>
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. ADICIONAR NOVAS OPERAÇÕES À GRADE (AGRUPADAS POR CATEGORIA) */}
      {/* ========================================================= */}
      {availableOps.length > 0 && (
        <div className="untitled-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                Adicionar Operações à Grade de Metas ({monthNames[mes - 1]}/{ano})
              </h3>
              <p className="text-xs text-gray-500">
                Selecione as operações disponíveis abaixo para incluí-las no planejamento deste mês:
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {(['POG', 'PROXIMIDADE', 'INTERACOES_COMUNITARIAS', 'ORDENS_SERVICO'] as OperationGroup[]).map((groupKey) => {
              const opsInGroup = availableOpsByGroup[groupKey];
              if (opsInGroup.length === 0) return null;

              const cfg = GROUP_CONFIG[groupKey];
              const Icon = cfg.icon;

              return (
                <div key={groupKey} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-700 dark:text-gray-300">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cfg.label}</span>
                    <span className="text-gray-400 font-normal">({opsInGroup.length} disponíveis)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {opsInGroup.map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => handleAddTargetForOp(op.id)}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-[#222938] bg-white dark:bg-[#151A23] hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono font-bold text-[10px] text-gray-700 dark:text-gray-300">
                            {op.codigo_natureza}
                          </span>
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2">
                            {op.titulo}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-2 mt-2 border-t border-gray-50 dark:border-[#1E2636]">
                          <span>+ Adicionar Meta</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL DE CONFIRMAÇÃO DE ANO */}
      {/* ========================================================= */}
      {pendingYear !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Ano Diferente do Ano Corrente
              </h3>
              <p className="text-gray-500 leading-relaxed">
                A data atual do sistema é <strong>{currentDateFormatted}</strong> (Ano <strong>{currentYear}</strong>).
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Você está selecionando o ano de <strong>{pendingYear}</strong> para planejar e gerenciar metas. Deseja realmente prosseguir?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-[#222938]">
              <button
                type="button"
                onClick={cancelYearChange}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmYearChange}
                className="py-2 px-4 flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sim, Alterar para {pendingYear}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL DE DISTRIBUIÇÃO DAS EQUIPES DINÂMICO & INTELIGENTE */}
      {/* ========================================================= */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Distribuição da Meta por Equipe
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Operação: <strong>{operations.find(o => o.id === selectedTarget.tipo_operacao_id)?.titulo}</strong> · Cota Total: <strong className="text-emerald-600 dark:text-emerald-400">{selectedTarget.meta_total} ops</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTarget(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Rolagem Interna */}
            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Seleção de Equipes (NÃO VEM PRÉ-SELECIONADO) */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider block">
                      1. Selecione as Equipes Participantes
                    </label>
                    <span className="text-[11px] text-gray-400">
                      {selectedTeams.length === 0 ? 'Nenhuma equipe marcada' : `${selectedTeams.length} de ${allTeams.length} equipes selecionadas`}
                    </span>
                  </div>

                  {/* Botões Rápidos de Seleção */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAllTeams}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Todas ({allTeams.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectMainShiftTeams}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Alfa / Bravo / Charlie
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectRuralTeams}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Patrulha Rural
                    </button>
                    {selectedTeams.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearTeams}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Grade das Equipes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1.5 border border-gray-200 dark:border-[#222938] rounded-xl bg-gray-50/50 dark:bg-[#0E121A]/50">
                  {allTeams.map((team) => {
                    const isSelected = selectedTeams.includes(team);
                    return (
                      <button
                        key={team}
                        type="button"
                        onClick={() => toggleTeam(team)}
                        className={`py-2 px-2.5 rounded-lg border text-left font-semibold text-[11px] truncate transition-all flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                            : 'bg-white dark:bg-[#151A23] border-gray-200 dark:border-[#222938] text-gray-600 dark:text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        <span className="truncate">{team}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-emerald-600 text-white' : 'border border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Ajuste das Porcentagens e Cotas com Digitação e Sliders */}
              {selectedTeams.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#222938]">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider block">
                      2. Ajuste a Cota ou Porcentagem (%) por Equipe
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Checkbox de Auto-Equilíbrio */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-600 dark:text-gray-300 font-medium select-none">
                        <input
                          type="checkbox"
                          checked={autoBalanceOthers}
                          onChange={(e) => setAutoBalanceOthers(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Auto-adequar demais (%)</span>
                      </label>

                      {/* Botão de Reset Igualitário */}
                      <button
                        type="button"
                        onClick={() => rebalanceEqually(selectedTeams)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1"
                        title="Dividir 100% igualmente entre as equipes"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Equilibrar 100%</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Equipes com Inputs Digitáveis e Sliders */}
                  <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-2xl border border-gray-200 dark:border-[#222938] space-y-2.5">
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {selectedTeams.map((team) => {
                        const pct = customPercentages[team] || 0;
                        const opsCalc = Math.round((selectedTarget.meta_total * pct) / 100);

                        return (
                          <div
                            key={team}
                            className="p-2 rounded-xl bg-white dark:bg-[#151A23] border border-gray-200/90 dark:border-[#283042] space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[160px]">
                                {team}
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Input Digitável de Quantidade de Operações */}
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#0E121A] px-2 py-0.5 rounded-lg border border-gray-200 dark:border-[#283042]">
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedTarget.meta_total}
                                    value={opsCalc}
                                    onChange={(e) => handleOpsCountChange(team, parseInt(e.target.value) || 0)}
                                    className="w-10 bg-transparent text-right font-extrabold text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none"
                                  />
                                  <span className="text-[10px] text-gray-400 font-medium">ops</span>
                                </div>

                                {/* Input Digitável de % */}
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#0E121A] px-2 py-0.5 rounded-lg border border-gray-200 dark:border-[#222938]">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={pct}
                                    onChange={(e) => handlePercentageChange(team, parseFloat(e.target.value) || 0)}
                                    className="w-12 bg-transparent text-right font-extrabold text-xs text-gray-900 dark:text-white focus:outline-none"
                                  />
                                  <span className="text-[10px] text-gray-500 font-bold">%</span>
                                </div>
                              </div>
                            </div>

                            {/* Barra Deslizante (Slider) Sincronizada */}
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={0.5}
                                value={pct}
                                onChange={(e) => handlePercentageChange(team, Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Indicador em Tempo Real da Soma dos Percentuais */}
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold ${
                    isPercentageExceeded
                      ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      : currentTotalPercentage === 100
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isPercentageExceeded ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      ) : currentTotalPercentage === 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}

                      <span>
                        {isPercentageExceeded ? (
                          <strong>A soma atual é {currentTotalPercentage}% (extrapola 100% por {(currentTotalPercentage - 100).toFixed(1)}%). O salvamento está bloqueado.</strong>
                        ) : currentTotalPercentage === 100 ? (
                          <strong>Soma das porcentagens: exatamente 100% (distribuição perfeita de {selectedTarget.meta_total} operações).</strong>
                        ) : (
                          <span>Soma atual: <strong>{currentTotalPercentage}%</strong> (Resta <strong>{(100 - currentTotalPercentage).toFixed(1)}%</strong> para atingir 100%).</span>
                        )}
                      </span>
                    </div>

                    {!isPercentageExceeded && currentTotalPercentage < 100 && (
                      <button
                        type="button"
                        onClick={() => rebalanceEqually(selectedTeams)}
                        className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-900 font-bold text-[11px] self-start sm:self-auto transition-colors"
                      >
                        Completar 100%
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* Quando nenhuma equipe está selecionada */}
              {selectedTeams.length === 0 && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Nenhuma equipe selecionada. Se você salvar sem selecionar equipes, a meta permanecerá como cota global da fração (sem divisão individual por equipe).
                  </span>
                </div>
              )}

            </div>

            {/* Footer Fixo com Botão de Salvamento Validado */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2 flex-shrink-0 bg-gray-50/50 dark:bg-[#0E121A]">
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDistribution}
                disabled={isPercentageExceeded}
                className={`py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs ${
                  isPercentageExceeded
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar Distribuição</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


