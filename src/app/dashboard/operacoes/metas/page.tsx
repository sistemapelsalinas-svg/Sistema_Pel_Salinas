'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { MonthlyTarget, OperationType, OperationGroup, OperationGroupDef, TeamTargetAllocation, TargetScheduleRule, OperationExecutionLog } from '@/lib/types';
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
  RefreshCw,
  Activity,
  Flag,
  Sparkles,
  Briefcase,
  Zap,
  Bookmark,
  Folder,
  Clock,
  CalendarDays,
  TrendingUp
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
  Folder
};

const COLOR_MAP: Record<string, { badge: string; bgLight: string; border: string; text: string }> = {
  blue: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    bgLight: 'bg-blue-50/40 dark:bg-blue-950/10',
    border: 'border-blue-200 dark:border-blue-900/60',
    text: 'text-blue-700 dark:text-blue-400'
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    bgLight: 'bg-emerald-50/40 dark:bg-emerald-950/10',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    text: 'text-emerald-700 dark:text-emerald-400'
  },
  purple: {
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    bgLight: 'bg-purple-50/40 dark:bg-purple-950/10',
    border: 'border-purple-200 dark:border-purple-900/60',
    text: 'text-purple-700 dark:text-purple-400'
  },
  amber: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    bgLight: 'bg-amber-50/40 dark:bg-amber-950/10',
    border: 'border-amber-200 dark:border-amber-900/60',
    text: 'text-amber-700 dark:text-amber-400'
  },
  rose: {
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    bgLight: 'bg-rose-50/40 dark:bg-rose-950/10',
    border: 'border-rose-200 dark:border-rose-900/60',
    text: 'text-rose-700 dark:text-rose-400'
  },
  indigo: {
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    bgLight: 'bg-indigo-50/40 dark:bg-indigo-950/10',
    border: 'border-indigo-200 dark:border-indigo-900/60',
    text: 'text-indigo-700 dark:text-indigo-400'
  },
  cyan: {
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    bgLight: 'bg-cyan-50/40 dark:bg-cyan-950/10',
    border: 'border-cyan-200 dark:border-cyan-900/60',
    text: 'text-cyan-700 dark:text-cyan-400'
  },
  slate: {
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700',
    bgLight: 'bg-gray-50/40 dark:bg-gray-900/10',
    border: 'border-gray-200 dark:border-gray-800',
    text: 'text-gray-700 dark:text-gray-300'
  }
};

export default function GestaoMetasPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDateFormatted = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const [mes, setMes] = useState(currentMonth);
  const [ano, setAno] = useState(currentYear);
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [logs, setLogs] = useState<OperationExecutionLog[]>([]);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [operationGroups, setOperationGroups] = useState<OperationGroupDef[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtros de visualização
  const [selectedTabGroup, setSelectedTabGroup] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Planejamento & Distribuição
  const [selectedTarget, setSelectedTarget] = useState<MonthlyTarget | null>(null);
  const [modalMetaTotal, setModalMetaTotal] = useState<number>(15);
  const [modalScheduleRule, setModalScheduleRule] = useState<TargetScheduleRule>('qualquer_dia');
  const [modalSpecificDays, setModalSpecificDays] = useState<number[]>([]);
  const [modalSelectedNaturezas, setModalSelectedNaturezas] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [customPercentages, setCustomPercentages] = useState<{ [team: string]: number }>({});
  const [autoBalanceOthers, setAutoBalanceOthers] = useState<boolean>(true);

  const availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const daysInSelectedMonth = useMemo(() => {
    return new Date(ano, mes, 0).getDate();
  }, [ano, mes]);

  useEffect(() => {
    setOperations(storage.getOperations());
    setOperationGroups(storage.getOperationGroups());
    setAllTeams(storage.getTeams());
    setLogs(storage.getLogs());
    loadTargets();
  }, [mes, ano]);

  const getGroupConfig = (grpKey: string) => {
    const grp = operationGroups.find(g => g.id === grpKey);
    const colorKey = grp?.cor || 'blue';
    const colorCfg = COLOR_MAP[colorKey] || COLOR_MAP.blue;
    const Icon = (grp?.icone && ICON_MAP[grp.icone]) || Shield;
    return {
      label: grp?.nome || grpKey,
      shortLabel: grp?.nome || grpKey,
      badgeColor: colorCfg.badge,
      bgLight: colorCfg.bgLight,
      borderColor: colorCfg.border,
      textColor: colorCfg.text,
      icon: Icon,
      description: grp?.descricao || ''
    };
  };

  const loadTargets = () => {
    const currentTargets = storage.getTargets(mes, ano);
    
    // Validação e autocorreção: se alguma meta existente tiver soma de operações diferente de meta_total devido a arredondamentos antigos, recalcula
    let changed = false;
    const healed = currentTargets.map(tgt => {
      if (tgt.distribuicoes && tgt.distribuicoes.length > 0) {
        const sumOps = tgt.distribuicoes.reduce((acc, d) => acc + (d.meta_quantitativa || 0), 0);
        if (sumOps !== tgt.meta_total) {
          const pcts: { [team: string]: number } = {};
          tgt.distribuicoes.forEach(d => {
            pcts[d.equipe] = d.percentual_alocado;
          });
          const dist = distributeByPercentages(tgt.meta_total, pcts);
          changed = true;
          return {
            ...tgt,
            distribuicoes: tgt.distribuicoes.map(d => ({
              ...d,
              percentual_alocado: dist[d.equipe]?.percent ?? d.percentual_alocado,
              meta_quantitativa: dist[d.equipe]?.count ?? d.meta_quantitativa
            }))
          };
        }
      }
      return tgt;
    });

    if (changed) {
      const all = storage.getAllTargets();
      const updatedAll = all.map(t => {
        const found = healed.find(h => h.id === t.id);
        return found || t;
      });
      storage.saveTargets(updatedAll);
      setTargets(healed);
    } else {
      setTargets(currentTargets);
    }
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

  // Ao adicionar meta para uma operação, abre o modal de configuração imediatamente
  const handleAddTargetForOp = (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;

    const defaultTotal = 15;
    const isOS = op.grupo === 'ORDENS_SERVICO' || op.grupo.toLowerCase().includes('ordem');
    
    let defaultNat: string[] = [];
    if (op.naturezas_vinculadas && op.naturezas_vinculadas.length > 0) {
      const assignedNats = targets
        .filter(t => t.tipo_operacao_id === op.id)
        .flatMap(t => t.naturezas_selecionadas || []);
      
      const nextAvailable = op.naturezas_vinculadas.find(
        n => !assignedNats.includes(n.codigo) && !assignedNats.includes(`${n.codigo} - ${n.titulo}`)
      );
      defaultNat = nextAvailable ? [nextAvailable.codigo] : [op.naturezas_vinculadas[0].codigo];
    }

    const newTarget: MonthlyTarget = {
      id: `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mes,
      ano,
      tipo_operacao_id: opId,
      meta_total: defaultTotal,
      regra_agendamento: isOS ? 'dias_especificos' : 'qualquer_dia',
      dias_especificos: [],
      naturezas_selecionadas: defaultNat,
      distribuicoes: []
    };

    const all = storage.getAllTargets();
    const updated = [...all, newTarget];
    storage.saveTargets(updated);
    loadTargets();
    
    // Abre o modal diretamente para configurar
    handleOpenDistributionModal(newTarget);
    showToast('success', `Meta para "${op.titulo}" incluída na grade. Configure a quantidade, periodicidade e equipes.`);
  };

  // Ao abrir o modal de distribuição:
  const handleOpenDistributionModal = (target: MonthlyTarget) => {
    const currentTeams = storage.getTeams();
    const targetOp = operations.find(o => o.id === target.tipo_operacao_id);
    const allNatCodes = targetOp?.naturezas_vinculadas?.map(n => n.codigo) || [];

    setAllTeams(currentTeams);
    setSelectedTarget(target);
    setModalMetaTotal(target.meta_total || 15);
    setModalScheduleRule(target.regra_agendamento || 'qualquer_dia');
    setModalSpecificDays(target.dias_especificos || []);
    
    // Seleção única: se já tiver salva, pega a primeira; senão, primeira vinculada da operação
    const existingNat = target.naturezas_selecionadas && target.naturezas_selecionadas.length > 0
      ? [target.naturezas_selecionadas[0]]
      : (allNatCodes.length > 0 ? [allNatCodes[0]] : []);

    setModalSelectedNaturezas(existingNat);

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

  // Atualização dinâmica de porcentagem para uma equipe
  const handlePercentageChange = (team: string, rawVal: number) => {
    const val = Math.max(0, Math.min(100, isNaN(rawVal) ? 0 : rawVal));
    
    if (!autoBalanceOthers || selectedTeams.length <= 1) {
      setCustomPercentages(prev => ({
        ...prev,
        [team]: val
      }));
      return;
    }

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

  // Atualização direta pelo número de operações digitado manualmente
  const handleOpsCountChange = (team: string, rawOps: number) => {
    if (!selectedTarget || modalMetaTotal <= 0) return;
    const clampedOps = Math.max(0, Math.min(modalMetaTotal, isNaN(rawOps) ? 0 : rawOps));
    const calculatedPct = Number(((clampedOps / modalMetaTotal) * 100).toFixed(1));
    handlePercentageChange(team, calculatedPct);
  };

  // Cálculo da soma atual das porcentagens
  const currentTotalPercentage = useMemo(() => {
    if (selectedTeams.length === 0) return 0;
    const sum = selectedTeams.reduce((acc, t) => acc + (customPercentages[t] || 0), 0);
    return Number(sum.toFixed(1));
  }, [selectedTeams, customPercentages]);

  // Distribuição calculada em tempo real com o método dos maiores restos (Hare-Niemeyer)
  const dynamicModalDistribution = useMemo(() => {
    if (!selectedTarget || selectedTeams.length === 0 || modalMetaTotal <= 0) return {};
    return distributeByPercentages(modalMetaTotal, customPercentages);
  }, [selectedTarget, selectedTeams, modalMetaTotal, customPercentages]);

  const currentTotalAllocatedOps = useMemo(() => {
    if (!selectedTarget || selectedTeams.length === 0) return 0;
    return Object.values(dynamicModalDistribution).reduce((acc, d) => acc + (d.count || 0), 0);
  }, [selectedTarget, selectedTeams, dynamicModalDistribution]);

  const isPercentageExceeded = currentTotalPercentage > 100.05;

  // Alternar dia específico selecionado
  const toggleSpecificDay = (day: number) => {
    setModalSpecificDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSelectWeekdaysOnly = () => {
    const days: number[] = [];
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      const dayOfWeek = new Date(ano, mes - 1, d).getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(d);
      }
    }
    setModalSpecificDays(days);
  };

  const handleSelectWeekendsOnly = () => {
    const days: number[] = [];
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      const dayOfWeek = new Date(ano, mes - 1, d).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        days.push(d);
      }
    }
    setModalSpecificDays(days);
  };

  const handleSelectAllMonthDays = () => {
    const days: number[] = [];
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      days.push(d);
    }
    setModalSpecificDays(days);
  };

  const handleClearSpecificDays = () => {
    setModalSpecificDays([]);
  };

  const handleSaveDistribution = () => {
    if (!selectedTarget) return;

    if (modalMetaTotal <= 0) {
      showToast('error', 'A meta total deve ser de no mínimo 1 operação.');
      return;
    }

    const targetOp = operations.find(o => o.id === selectedTarget.tipo_operacao_id);
    if (targetOp?.naturezas_vinculadas && targetOp.naturezas_vinculadas.length > 0) {
      if (modalSelectedNaturezas.length === 0) {
        showToast('error', 'Selecione a natureza da operação para esta meta.');
        return;
      }

      // Validação de duplicidade: não permitir duas metas com a mesma natureza para a mesma operação no mesmo mês
      const selectedNatCode = modalSelectedNaturezas[0];
      const duplicateTarget = targets.find(t => 
        t.id !== selectedTarget.id &&
        t.tipo_operacao_id === selectedTarget.tipo_operacao_id &&
        (t.naturezas_selecionadas?.includes(selectedNatCode) || t.naturezas_selecionadas?.some(c => c.startsWith(selectedNatCode)))
      );

      if (duplicateTarget) {
        showToast('error', `A natureza "${selectedNatCode}" já possui uma meta cadastrada nesta mesma Ordem de Serviço para este mês. Selecione outra natureza.`);
        return;
      }
    }

    if (isPercentageExceeded) {
      showToast('error', `A soma das porcentagens é ${currentTotalPercentage}%, excedendo o limite de 100%. Ajuste antes de salvar.`);
      return;
    }

    let newDistributions: TeamTargetAllocation[] = [];
    if (selectedTeams.length > 0) {
      const dist = distributeByPercentages(modalMetaTotal, customPercentages);
      newDistributions = Object.entries(dist).map(([team, data]) => ({
        id: `dst-${Date.now()}-${team}`,
        meta_mensal_id: selectedTarget.id,
        equipe: team,
        percentual_alocado: data.percent,
        meta_quantitativa: data.count
      }));
    }

    const all = storage.getAllTargets();
    const idx = all.findIndex(t => t.id === selectedTarget.id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        meta_total: modalMetaTotal,
        regra_agendamento: modalScheduleRule,
        dias_especificos: modalScheduleRule === 'dias_especificos' ? modalSpecificDays : undefined,
        naturezas_selecionadas: modalSelectedNaturezas,
        distribuicoes: newDistributions
      };
      storage.saveTargets(all);
      loadTargets();
      showToast('success', selectedTeams.length > 0 
        ? `Meta de ${modalMetaTotal} ops salva com sucesso para ${selectedTeams.length} equipes.` 
        : `Meta de ${modalMetaTotal} ops definida como cota geral da fração.`
      );
    }
    setSelectedTarget(null);
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

  // Operações disponíveis para adicionar novas metas neste mês
  const availableOps = useMemo(() => {
    return operations.filter(op => {
      if (!op.ativo) return false;
      
      // Se possui naturezas vinculadas (ex: Ordens de Serviço), checa se ainda existem naturezas sem meta cadastrada
      if (op.naturezas_vinculadas && op.naturezas_vinculadas.length > 0) {
        const assignedNats = targets
          .filter(t => t.tipo_operacao_id === op.id)
          .flatMap(t => t.naturezas_selecionadas || []);
        
        const hasUnassigned = op.naturezas_vinculadas.some(
          n => !assignedNats.includes(n.codigo) && !assignedNats.includes(`${n.codigo} - ${n.titulo}`)
        );
        return hasUnassigned;
      }

      // Para operações normais (natureza única), só pode haver 1 meta por mês
      const isAlreadyAdded = targets.some(t => t.tipo_operacao_id === op.id);
      return !isAlreadyAdded;
    });
  }, [operations, targets]);

  // Agrupamento das operações disponíveis para adicionar
  const availableOpsByGroup = useMemo(() => {
    const groups: Record<string, OperationType[]> = {};
    operationGroups.forEach(g => {
      groups[g.id] = [];
    });
    availableOps.forEach(op => {
      if (!groups[op.grupo]) {
        groups[op.grupo] = [];
      }
      groups[op.grupo].push(op);
    });
    return groups;
  }, [availableOps, operationGroups]);

  // Contagens para os cards e tabs
  const groupStats = useMemo(() => {
    const counts: Record<string, { count: number; totalOps: number }> = {
      ALL: { count: targets.length, totalOps: targets.reduce((acc, t) => acc + (t.meta_total || 0), 0) }
    };
    operationGroups.forEach(g => {
      counts[g.id] = { count: 0, totalOps: 0 };
    });

    enrichedTargets.forEach(t => {
      if (t.opDetails?.grupo) {
        if (!counts[t.opDetails.grupo]) {
          counts[t.opDetails.grupo] = { count: 0, totalOps: 0 };
        }
        counts[t.opDetails.grupo].count++;
        counts[t.opDetails.grupo].totalOps += (t.meta_total || 0);
      }
    });

    return counts;
  }, [enrichedTargets, targets, operationGroups]);

  // Logs filtrados pelo mês e ano selecionados
  const monthLogs = useMemo(() => {
    return logs.filter(l => {
      if (!l.data_execucao) return false;
      const [y, m] = l.data_execucao.split('-');
      return parseInt(m, 10) === mes && parseInt(y, 10) === ano;
    });
  }, [logs, mes, ano]);

  // Totais Gerais de Metas e Operações Lançadas
  const totalMetasOps = useMemo(() => {
    return targets.reduce((acc, t) => acc + (t.meta_total || 0), 0);
  }, [targets]);

  const totalExecutadasOps = useMemo(() => {
    return monthLogs.length;
  }, [monthLogs]);

  const percentualExecutado = useMemo(() => {
    if (totalMetasOps <= 0) return 0;
    return Math.min(100, Math.round((totalExecutadasOps / totalMetasOps) * 100));
  }, [totalMetasOps, totalExecutadasOps]);

  const saldoOps = totalMetasOps - totalExecutadasOps;

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
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              selectedTabGroup === 'ALL' ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {groupStats.ALL.count} ({groupStats.ALL.totalOps})
            </span>
          </button>

          {operationGroups.map((grp) => {
            const cfg = getGroupConfig(grp.id);
            const Icon = cfg.icon;
            const isSelected = selectedTabGroup === grp.id;
            const stat = groupStats[grp.id] || { count: 0, totalOps: 0 };

            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => setSelectedTabGroup(grp.id)}
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
      <div className="space-y-4">
        {filteredTargets.length === 0 ? (
          <div className="untitled-card p-8 text-center space-y-2">
            <Target className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
              Nenhuma meta encontrada para os filtros selecionados.
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Utilize a seção abaixo para adicionar operações e definir o planejamento mensal de {monthNames[mes - 1]}/{ano}.
            </p>
          </div>
        ) : (
          operationGroups
            .map(g => g.id)
            .filter(grpKey => selectedTabGroup === 'ALL' || selectedTabGroup === grpKey)
            .map((groupKey) => {
              const groupTargets = filteredTargets.filter(t => t.opDetails?.grupo === groupKey);
              if (groupTargets.length === 0) return null;

              const groupCfg = getGroupConfig(groupKey);
              const GroupIcon = groupCfg.icon;

              return (
                <div key={groupKey} className="space-y-2.5">
                  
                  {/* Cabeçalho do Grupo Compacto */}
                  <div className={`p-2.5 px-3.5 rounded-xl border ${groupCfg.bgLight} ${groupCfg.borderColor} flex items-center justify-between gap-2`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${groupCfg.badgeColor} flex items-center justify-center`}>
                        <GroupIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                          {groupCfg.label}
                        </h2>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] text-gray-700 dark:text-gray-300">
                          {groupTargets.length} {groupTargets.length === 1 ? 'operação' : 'operações'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        Meta do Grupo:
                      </span>
                      <span className={`text-xs sm:text-sm font-extrabold ${groupCfg.textColor}`}>
                        {groupTargets.reduce((acc, t) => acc + t.meta_total, 0)} <span className="text-[10px] font-medium text-gray-400">ações</span>
                      </span>
                    </div>
                  </div>

                  {/* Grade Visual e Compacta de Cards de Operações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {groupTargets.map((tgt) => {
                      const op = tgt.opDetails;
                      if (!op) return null;

                      const hasTeamsAllocated = tgt.distribuicoes && tgt.distribuicoes.length > 0;

                      return (
                        <div
                          key={tgt.id}
                          className="bg-white dark:bg-[#151A23] p-3 rounded-xl border border-gray-200 dark:border-[#222938] space-y-2 hover:border-gray-300 dark:hover:border-[#283042] transition-all shadow-xs flex flex-col justify-between"
                        >
                          {/* Linha Superior: Código, Título, Meta Total e Ações */}
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] font-mono font-bold text-[11px] text-gray-800 dark:text-gray-200 flex-shrink-0">
                                  {op.codigo_natureza}
                                </span>
                                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={op.titulo}>
                                  {op.titulo}
                                </h3>
                                {op.area_rural_obrigatoria && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 flex-shrink-0">
                                    Rural
                                  </span>
                                )}
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDistributionModal(tgt)}
                                  className="p-1 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  title="Definir Meta e Equipes"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTarget(tgt.id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Excluir meta desta operação"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Linha de Metas e Periodicidade */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] text-[11px] font-extrabold text-gray-900 dark:text-white">
                                  Meta: {tgt.meta_total} ops
                                </span>

                                {/* Badge de Periodicidade */}
                                {tgt.regra_agendamento === 'dias_semana' && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Seg a Sex</span>
                                  </span>
                                )}
                                {tgt.regra_agendamento === 'finais_semana' && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Fins de semana</span>
                                  </span>
                                )}
                                {tgt.regra_agendamento === 'dias_especificos' && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{tgt.dias_especificos?.length || 0} dias</span>
                                  </span>
                                )}

                                {/* Badge da Natureza Selecionada na OS */}
                                {tgt.naturezas_selecionadas && tgt.naturezas_selecionadas.length > 0 && (() => {
                                  const selectedCode = tgt.naturezas_selecionadas[0];
                                  const matchedNat = op.naturezas_vinculadas?.find(n => n.codigo === selectedCode || `${n.codigo} - ${n.titulo}` === selectedCode);
                                  const displayFull = matchedNat ? `${matchedNat.codigo} - ${matchedNat.titulo}` : selectedCode;

                                  return (
                                    <span 
                                      className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 max-w-[180px] sm:max-w-[210px]"
                                      title={`Natureza Vinculada: ${displayFull}`}
                                    >
                                      <Layers className="w-3 h-3 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                      <span className="font-mono text-[9.5px] font-extrabold flex-shrink-0">
                                        {matchedNat ? matchedNat.codigo : selectedCode}
                                      </span>
                                      {matchedNat && (
                                        <span className="truncate font-semibold text-gray-700 dark:text-gray-300">
                                          {matchedNat.titulo}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })()}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDistributionModal(tgt)}
                                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                              >
                                {hasTeamsAllocated ? 'Ajustar' : 'Definir'}
                              </button>
                            </div>
                          </div>

                          {/* Seção Inferior: Distribuição de Equipes ou Alerta de Sem Equipes */}
                          {hasTeamsAllocated ? (
                            <div className="pt-2 border-t border-gray-100 dark:border-[#222938]">
                              <div className="flex flex-wrap gap-1">
                                {tgt.distribuicoes?.map((dst) => (
                                  <span
                                    key={dst.id}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-[#0E121A] border border-gray-200/80 dark:border-[#283042] text-[10px] font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    <span className="font-bold">{dst.equipe}:</span>
                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{dst.meta_quantitativa}</span>
                                    <span className="text-gray-400 text-[9px]">({dst.percentual_alocado}%)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Sem equipes alocadas
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenDistributionModal(tgt)}
                                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Definir Equipes</span>
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

          <div className="space-y-5 pt-2">
            {operationGroups
              .filter(grp => (availableOpsByGroup[grp.id] || []).length > 0)
              .map((grp) => {
                const opsInGroup = availableOpsByGroup[grp.id] || [];
                const cfg = getGroupConfig(grp.id);
                const Icon = cfg.icon;

                return (
                  <div key={grp.id} className="space-y-3">
                    
                    {/* Barra Separadora / Cabeçalho do Grupo */}
                    <div className={`p-2 px-3 rounded-xl border ${cfg.bgLight} ${cfg.borderColor} flex items-center justify-between gap-2 shadow-2xs`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${cfg.badgeColor} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          {cfg.label}
                        </h4>
                      </div>
                      
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] text-gray-700 dark:text-gray-300">
                        {opsInGroup.length} {opsInGroup.length === 1 ? 'disponível' : 'disponíveis'}
                      </span>
                    </div>

                    {/* Grade de Operações do Grupo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {opsInGroup.map((op) => (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => handleAddTargetForOp(op.id)}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-[#222938] bg-white dark:bg-[#151A23] hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group flex flex-col justify-between shadow-2xs"
                        >
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono font-bold text-[10px] text-gray-700 dark:text-gray-300">
                              {op.codigo_natureza}
                            </span>
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2">
                              {op.titulo}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-2 mt-2 border-t border-gray-100 dark:border-[#1E2636]">
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
                Confirmar e Alterar Ano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL DE PLANEJAMENTO DA META & DISTRIBUIÇÃO */}
      {/* ========================================================= */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                      {operations.find(o => o.id === selectedTarget.tipo_operacao_id)?.codigo_natureza}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {operations.find(o => o.id === selectedTarget.tipo_operacao_id)?.titulo}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Planejamento mensal: <strong>{monthNames[mes - 1]} de {ano}</strong>
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
            <div className="p-4 sm:p-5 space-y-5 text-xs overflow-y-auto flex-1">
              
              {/* SEÇÃO 1: QUANTIDADE TOTAL E PERIODICIDADE DA OPERAÇÃO */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#222938] space-y-3.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                    1. Meta Total e Regra de Periodicidade
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Definição da Quantidade Total */}
                  <div className="bg-white dark:bg-[#151A23] p-3 rounded-xl border border-gray-200 dark:border-[#283042] space-y-1.5">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 text-[11px]">
                      Meta Total no Mês (Ações) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={modalMetaTotal}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setModalMetaTotal(val);
                        }}
                        className="untitled-input font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400 py-1.5"
                      />
                      <span className="text-xs font-semibold text-gray-400">operações</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Total de execuções planejadas para esta natureza em {monthNames[mes - 1]}/{ano}.
                    </p>
                  </div>

                  {/* Periodicidade / Restrição de Datas */}
                  <div className="bg-white dark:bg-[#151A23] p-3 rounded-xl border border-gray-200 dark:border-[#283042] space-y-1.5">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 text-[11px]">
                      Quando pode ser executada? *
                    </label>
                    <select
                      value={modalScheduleRule}
                      onChange={(e) => setModalScheduleRule(e.target.value as TargetScheduleRule)}
                      className="untitled-input font-bold text-xs py-2"
                    >
                      <option value="qualquer_dia">📅 Qualquer data do mês (Livre)</option>
                      <option value="dias_semana">🏢 Apenas dias de semana (Segunda a Sexta)</option>
                      <option value="finais_semana">🌴 Apenas finais de semana (Sábado e Domingo)</option>
                      <option value="dias_especificos">🎯 Datas / Dias específicos do mês</option>
                    </select>
                    <p className="text-[10px] text-gray-400">
                      {modalScheduleRule === 'qualquer_dia' && 'Permite lançamento em qualquer dia do mês corrente.'}
                      {modalScheduleRule === 'dias_semana' && 'Operação destinada exclusivamente aos dias úteis.'}
                      {modalScheduleRule === 'finais_semana' && 'Operação destinada aos sábados e domingos.'}
                      {modalScheduleRule === 'dias_especificos' && 'Operação com dias certos definidos (ex: O.S., eventos, datas fixas).'}
                    </p>
                  </div>

                </div>

                {/* Seção de Seleção de Dias Específicos do Mês */}
                {modalScheduleRule === 'dias_especificos' && (
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                        <CalendarDays className="w-4 h-4 text-amber-600" />
                        <span>Selecione os dias do mês de {monthNames[mes - 1]}:</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSelectWeekdaysOnly}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        >
                          Seg a Sex
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectWeekendsOnly}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        >
                          Finais de Semana
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectAllMonthDays}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSpecificDays}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    {/* Grade de Dias do Mês */}
                    <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-11 gap-1 pt-1">
                      {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((day) => {
                        const isDaySelected = modalSpecificDays.includes(day);
                        const dayDate = new Date(ano, mes - 1, day);
                        const dayOfWeekStr = format(dayDate, 'EEE', { locale: ptBR }).toUpperCase().slice(0, 3);
                        const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleSpecificDay(day)}
                            className={`p-1 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                              isDaySelected
                                ? 'bg-amber-600 text-white font-bold shadow-xs'
                                : isWeekend
                                ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 hover:border-amber-400'
                                : 'bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#283042] text-gray-700 dark:text-gray-300 hover:border-amber-400'
                            }`}
                          >
                            <span className="text-[9px] opacity-75 leading-none">{dayOfWeekStr}</span>
                            <span className="text-xs font-bold leading-tight">{day}</span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold pt-1">
                      {modalSpecificDays.length === 0
                        ? '⚠️ Nenhum dia selecionado (marque as datas em que a operação poderá ser lançada).'
                        : `✓ ${modalSpecificDays.length} dias selecionados: ${modalSpecificDays.join(', ')}`}
                    </p>
                  </div>
                )}

              </div>

              {/* SEÇÃO 1.1: SELEÇÃO DA NATUREZA VINCULADA DA ORDEM DE SERVIÇO */}
              {(() => {
                const selectedTargetOp = selectedTarget ? operations.find(o => o.id === selectedTarget.tipo_operacao_id) : null;
                if (!selectedTargetOp?.naturezas_vinculadas || selectedTargetOp.naturezas_vinculadas.length === 0) return null;

                const currentSelectedCode = modalSelectedNaturezas[0] || '';

                return (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                          Natureza da Ordem de Serviço *
                        </h4>
                      </div>

                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full bg-white dark:bg-[#151A23] border border-amber-200 dark:border-amber-800/80">
                        1 Natureza por Meta
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Selecione a natureza específica que será executada pelas equipes nesta meta de {monthNames[mes - 1]}/{ano}:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedTargetOp.naturezas_vinculadas.map((nat) => {
                        const isSelected = currentSelectedCode === nat.codigo || currentSelectedCode === `${nat.codigo} - ${nat.titulo}`;
                        
                        // Checar se outra meta desta mesma OS já possui esta natureza cadastrada
                        const otherTarget = targets.find(t => 
                          t.id !== selectedTarget.id &&
                          t.tipo_operacao_id === selectedTargetOp.id &&
                          (t.naturezas_selecionadas?.includes(nat.codigo) || t.naturezas_selecionadas?.some(c => c.startsWith(nat.codigo)))
                        );

                        return (
                          <div
                            key={nat.id || nat.codigo}
                            onClick={() => {
                              if (otherTarget) {
                                showToast('error', `A natureza ${nat.codigo} já possui uma meta cadastrada (${otherTarget.meta_total} ops) para esta O.S.`);
                                return;
                              }
                              setModalSelectedNaturezas([nat.codigo]);
                            }}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-white dark:bg-[#151A23] border-amber-500 ring-2 ring-amber-500/80 shadow-xs'
                                : otherTarget
                                ? 'bg-gray-100/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                                : 'bg-white/60 dark:bg-[#0E121A]/60 border-gray-200 dark:border-[#283042] opacity-80 hover:opacity-100 hover:border-amber-300'
                            }`}
                          >
                            <div className="pt-0.5">
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-xs text-amber-800 dark:text-amber-300">
                                  {nat.codigo}
                                </span>
                                {otherTarget && (
                                  <span className="px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[9px] font-bold">
                                    Já cadastrada ({otherTarget.meta_total} ops)
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-gray-900 dark:text-white leading-snug block mt-0.5">
                                {nat.titulo}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {modalSelectedNaturezas.length > 0 ? (() => {
                      const found = selectedTargetOp.naturezas_vinculadas.find(n => n.codigo === modalSelectedNaturezas[0]);
                      return (
                        <p className="text-[10px] text-amber-900 dark:text-amber-200 font-semibold pt-0.5 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Natureza definida:</span>
                          <strong className="underline">{found ? `${found.codigo} - ${found.titulo}` : modalSelectedNaturezas[0]}</strong>
                        </p>
                      );
                    })() : (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold pt-0.5">
                        ⚠️ Nenhuma natureza selecionada. Clique em uma das opções acima para definir a natureza desta meta.
                      </p>
                    )}
                  </div>
                );
              })()}
              
              {/* SEÇÃO 2: SELEÇÃO DE EQUIPES PARTICIPANTES */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider block">
                      2. Selecione as Equipes Participantes
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-gray-200 dark:border-[#222938] rounded-xl bg-gray-50/50 dark:bg-[#0E121A]/50">
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

              {/* SEÇÃO 3: DISTRIBUIÇÃO DAS COTAS (SEM SLIDERS) */}
              {selectedTeams.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#222938]">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider block">
                      3. Distribuição das Cotas por Equipe
                    </label>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Checkbox de Auto-Equilíbrio */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-600 dark:text-gray-300 font-medium select-none">
                        <input
                          type="checkbox"
                          checked={autoBalanceOthers}
                          onChange={(e) => setAutoBalanceOthers(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Auto-adequar restante (%)</span>
                      </label>

                      {/* Botão de Distribuição Automática Igualitária */}
                      <button
                        type="button"
                        onClick={() => rebalanceEqually(selectedTeams)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-xs transition-colors"
                        title="Dividir meta igualmente entre as equipes"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Distribuir Igualmente</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Equipes com Inputs Digitáveis de Quantidade e % (Sem Slider) */}
                  <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-2xl border border-gray-200 dark:border-[#222938] space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {selectedTeams.map((team) => {
                        const pct = customPercentages[team] || 0;
                        const opsCalc = dynamicModalDistribution[team]?.count ?? 0;

                        return (
                          <div
                            key={team}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#151A23] border border-gray-200/90 dark:border-[#283042] flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                                {team}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                Cota calculada: <strong>{opsCalc} ops</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Input Manual de Quantidade de Operações */}
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">Quantidade</span>
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#0E121A] px-2 py-0.5 rounded-lg border border-gray-200 dark:border-[#283042]">
                                  <input
                                    type="number"
                                    min="0"
                                    max={modalMetaTotal}
                                    value={opsCalc}
                                    onChange={(e) => handleOpsCountChange(team, parseInt(e.target.value) || 0)}
                                    className="w-10 bg-transparent text-right font-extrabold text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none"
                                  />
                                  <span className="text-[10px] text-gray-400 font-medium">ops</span>
                                </div>
                              </div>

                              {/* Input Manual de Porcentagem (%) */}
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">Porcentagem</span>
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#0E121A] px-2 py-0.5 rounded-lg border border-gray-200 dark:border-[#283042]">
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
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Indicador em Tempo Real da Soma dos Percentuais e Operações */}
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
                          <strong>A soma atual é {currentTotalPercentage}% ({currentTotalAllocatedOps} ops), ultrapassando os 100% da meta ({modalMetaTotal} ops). O salvamento está bloqueado.</strong>
                        ) : currentTotalPercentage === 100 ? (
                          <strong>Soma das operações: exatamente {currentTotalAllocatedOps} de {modalMetaTotal} ops (100% da cota distribuída perfeitamente).</strong>
                        ) : (
                          <span>Soma atual: <strong>{currentTotalAllocatedOps} de {modalMetaTotal} ops</strong> ({currentTotalPercentage}% alocado · resta <strong>{(100 - currentTotalPercentage).toFixed(1)}%</strong>).</span>
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
                    Nenhuma equipe selecionada. A meta de <strong>{modalMetaTotal} operações</strong> permanecerá como cota global da fração (sem divisão individual por equipe).
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
                <span>Salvar Planejamento & Distribuição</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


