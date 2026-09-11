'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { 
  OperationType, 
  OperationExecutionLog, 
  HomicideAlert, 
  MonthlyTarget, 
  MonthlySchedule, 
  OperationGroupDef 
} from '@/lib/types';
import { 
  Target, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Shield, 
  FileText, 
  Users, 
  Bookmark, 
  SlidersHorizontal, 
  Info,
  Layers,
  Search,
  CheckCircle2,
  Compass,
  HeartHandshake,
  FileSpreadsheet,
  Activity,
  Flag,
  Sparkles,
  Briefcase,
  Zap,
  Folder,
  ArrowUpRight
} from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';

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
  FileText,
  ShieldCheck
};

const COLOR_MAP: Record<string, { 
  bgLight: string; 
  badge: string; 
  text: string; 
  border: string; 
  barBg: string;
  ring: string;
}> = {
  blue: { 
    bgLight: 'bg-blue-50/70 dark:bg-blue-950/30', 
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', 
    text: 'text-blue-700 dark:text-blue-300', 
    border: 'border-blue-200 dark:border-blue-800/80',
    barBg: 'bg-blue-500',
    ring: 'ring-blue-500'
  },
  emerald: { 
    bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/30', 
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', 
    text: 'text-emerald-700 dark:text-emerald-300', 
    border: 'border-emerald-200 dark:border-emerald-800/80',
    barBg: 'bg-emerald-500',
    ring: 'ring-emerald-500'
  },
  purple: { 
    bgLight: 'bg-purple-50/70 dark:bg-purple-950/30', 
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800', 
    text: 'text-purple-700 dark:text-purple-300', 
    border: 'border-purple-200 dark:border-purple-800/80',
    barBg: 'bg-purple-500',
    ring: 'ring-purple-500'
  },
  amber: { 
    bgLight: 'bg-amber-50/70 dark:bg-amber-950/30', 
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', 
    text: 'text-amber-700 dark:text-amber-300', 
    border: 'border-amber-200 dark:border-amber-800/80',
    barBg: 'bg-amber-500',
    ring: 'ring-amber-500'
  },
  rose: { 
    bgLight: 'bg-rose-50/70 dark:bg-rose-950/30', 
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800', 
    text: 'text-rose-700 dark:text-rose-300', 
    border: 'border-rose-200 dark:border-rose-800/80',
    barBg: 'bg-rose-500',
    ring: 'ring-rose-500'
  },
  indigo: { 
    bgLight: 'bg-indigo-50/70 dark:bg-indigo-950/30', 
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', 
    text: 'text-indigo-700 dark:text-indigo-300', 
    border: 'border-indigo-200 dark:border-indigo-800/80',
    barBg: 'bg-indigo-500',
    ring: 'ring-indigo-500'
  },
  cyan: { 
    bgLight: 'bg-cyan-50/70 dark:bg-cyan-950/30', 
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', 
    text: 'text-cyan-700 dark:text-cyan-300', 
    border: 'border-cyan-200 dark:border-cyan-800/80',
    barBg: 'bg-cyan-500',
    ring: 'ring-cyan-500'
  },
  slate: { 
    bgLight: 'bg-slate-50/70 dark:bg-slate-950/30', 
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 border-slate-200 dark:border-slate-800', 
    text: 'text-slate-700 dark:text-slate-300', 
    border: 'border-slate-200 dark:border-slate-800/80',
    barBg: 'bg-slate-500',
    ring: 'ring-slate-500'
  }
};

const getGroupIcon = (iconName?: string) => {
  if (!iconName) return Shield;
  return ICON_MAP[iconName] || Shield;
};

const getGroupColor = (colorKey?: string) => {
  if (!colorKey) return COLOR_MAP.blue;
  return COLOR_MAP[colorKey] || COLOR_MAP.blue;
};

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [mes, setMes] = useState<number>(currentMonth);
  const [ano, setAno] = useState<number>(currentYear);

  const [groups, setGroups] = useState<OperationGroupDef[]>([]);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [logs, setLogs] = useState<OperationExecutionLog[]>([]);
  const [alerts, setAlerts] = useState<HomicideAlert[]>([]);
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [schedule, setSchedule] = useState<MonthlySchedule | null>(null);
  const [teams, setTeams] = useState<string[]>([]);

  // Filtros da tabela detalhada por natureza
  const [selectedNatureGroupTab, setSelectedNatureGroupTab] = useState<string>('ALL');
  const [natureSearchTerm, setNatureSearchTerm] = useState<string>('');

  useEffect(() => {
    setGroups(storage.getOperationGroups());
    setOperations(storage.getOperations());
    setLogs(storage.getLogs());
    setAlerts(storage.getAlerts());
    setTargets(storage.getTargets(mes, ano));
    setSchedule(storage.getSchedule(mes, ano));
    setTeams(storage.getTeams());
  }, [mes, ano]);

  // Logs filtrados pelo mês e ano selecionados
  const monthLogs = useMemo(() => {
    return logs.filter(l => {
      if (!l.data_execucao) return false;
      const [y, m] = l.data_execucao.split('-');
      return parseInt(m, 10) === mes && parseInt(y, 10) === ano;
    });
  }, [logs, mes, ano]);

  // Estatísticas Globais
  const totalMetas = useMemo(() => {
    return targets.reduce((acc, t) => acc + (t.meta_total || 0), 0);
  }, [targets]);

  const totalExecutadas = useMemo(() => {
    return monthLogs.length;
  }, [monthLogs]);

  const percentualGeral = useMemo(() => {
    if (totalMetas <= 0) return 0;
    return Math.min(100, Math.round((totalExecutadas / totalMetas) * 100));
  }, [totalMetas, totalExecutadas]);

  const today = new Date().getDate();
  const escalaHoje = useMemo(() => {
    if (mes !== currentMonth || ano !== currentYear || !schedule?.itens) return [];
    return schedule.itens.filter(i => i.dia_mes === today && (i.legenda_codigo === 'S' || i.legenda_codigo === 'SN'));
  }, [schedule, today, mes, currentMonth, ano, currentYear]);

  // =========================================================================
  // 1. DADOS ESTATÍSTICOS CONSOLIDADOS POR GRUPO DE OPERAÇÕES
  // =========================================================================
  const groupStats = useMemo(() => {
    return groups.map(grp => {
      const opsInGroup = operations.filter(o => o.grupo === grp.id);
      const targetsInGroup = targets.filter(t => opsInGroup.some(o => o.id === t.tipo_operacao_id));
      const logsInGroup = monthLogs.filter(l => opsInGroup.some(o => o.id === l.tipo_operacao_id));

      const metaTotal = targetsInGroup.reduce((acc, t) => acc + (t.meta_total || 0), 0);
      const executado = logsInGroup.length;
      const percent = metaTotal > 0 ? Math.min(100, Math.round((executado / metaTotal) * 100)) : 0;

      // Equipe com maior destaque neste grupo
      const teamCounts: Record<string, number> = {};
      logsInGroup.forEach(l => {
        if (l.equipe) {
          teamCounts[l.equipe] = (teamCounts[l.equipe] || 0) + 1;
        }
      });
      const topTeam = Object.keys(teamCounts).sort((a, b) => teamCounts[b] - teamCounts[a])[0] || '—';

      return {
        group: grp,
        metaTotal,
        executado,
        percent,
        metasCount: targetsInGroup.length,
        opsCount: opsInGroup.length,
        topTeam
      };
    });
  }, [groups, operations, targets, monthLogs]);

  // =========================================================================
  // 2. DETALHAMENTO INDIVIDUAL AGRUPADO POR CADA NATUREZA DE OPERAÇÃO
  // =========================================================================
  const detailedNaturesList = useMemo(() => {
    const list: Array<{
      id: string;
      targetId: string;
      operationId: string;
      groupId: string;
      groupName: string;
      groupColor: string;
      groupIcon: string;
      codigoNatureza: string;
      tituloOperacao: string;
      naturezaTitulo: string;
      isOS: boolean;
      regraAgendamento?: string;
      diasEspecificos?: number[];
      metaTotal: number;
      executado: number;
      percent: number;
      distribuicoes: Array<{ equipe: string; meta: number; realizado: number }>;
    }> = [];

    targets.forEach(tgt => {
      const op = operations.find(o => o.id === tgt.tipo_operacao_id);
      if (!op) return;

      const grp = groups.find(g => g.id === op.grupo);
      const isOS = op.grupo === 'ORDENS_SERVICO' || op.grupo.toLowerCase().includes('ordem') || !!(op.naturezas_vinculadas && op.naturezas_vinculadas.length > 0);

      // Natureza específica vinculada (se houver)
      const selectedNatCode = tgt.naturezas_selecionadas?.[0];
      const matchedLinkedNat = op.naturezas_vinculadas?.find(n => n.codigo === selectedNatCode || `${n.codigo} - ${n.titulo}` === selectedNatCode);

      const codigoExibicao = matchedLinkedNat ? matchedLinkedNat.codigo : (selectedNatCode || op.codigo_natureza);
      const tituloExibicao = matchedLinkedNat ? matchedLinkedNat.titulo : op.titulo;

      // Contagem de logs para esta natureza específica
      const matchingLogs = monthLogs.filter(l => {
        if (l.tipo_operacao_id !== op.id) return false;
        if (matchedLinkedNat) {
          if (!l.natureza_executada) return true;
          return l.natureza_executada.includes(matchedLinkedNat.codigo) || l.natureza_executada.includes(matchedLinkedNat.titulo);
        }
        return true;
      });

      const executado = matchingLogs.length;
      const metaTotal = tgt.meta_total || 0;
      const percent = metaTotal > 0 ? Math.min(100, Math.round((executado / metaTotal) * 100)) : 0;

      // Execuções por equipe
      const teamBreakdown = (tgt.distribuicoes || []).map(dst => {
        const teamLogsCount = matchingLogs.filter(l => l.equipe === dst.equipe).length;
        return {
          equipe: dst.equipe,
          meta: dst.meta_quantitativa || 0,
          realizado: teamLogsCount
        };
      });

      list.push({
        id: tgt.id,
        targetId: tgt.id,
        operationId: op.id,
        groupId: op.grupo,
        groupName: grp?.nome || op.grupo,
        groupColor: grp?.cor || 'blue',
        groupIcon: grp?.icone || 'Shield',
        codigoNatureza: codigoExibicao,
        tituloOperacao: op.titulo,
        naturezaTitulo: tituloExibicao,
        isOS,
        regraAgendamento: tgt.regra_agendamento,
        diasEspecificos: tgt.dias_especificos,
        metaTotal,
        executado,
        percent,
        distribuicoes: teamBreakdown
      });
    });

    return list;
  }, [targets, operations, groups, monthLogs]);

  // Filtragem da tabela por grupo e por termo de busca
  const filteredNaturesList = useMemo(() => {
    return detailedNaturesList.filter(item => {
      if (selectedNatureGroupTab !== 'ALL' && item.groupId !== selectedNatureGroupTab) {
        return false;
      }
      if (natureSearchTerm.trim()) {
        const term = natureSearchTerm.toLowerCase();
        const matchCode = item.codigoNatureza.toLowerCase().includes(term);
        const matchTitle = item.tituloOperacao.toLowerCase().includes(term);
        const matchNatTitle = item.naturezaTitulo.toLowerCase().includes(term);
        const matchGroup = item.groupName.toLowerCase().includes(term);
        if (!matchCode && !matchTitle && !matchNatTitle && !matchGroup) {
          return false;
        }
      }
      return true;
    });
  }, [detailedNaturesList, selectedNatureGroupTab, natureSearchTerm]);

  // Distribuição de Metas por Equipe
  const teamDistributionStats = useMemo(() => {
    return teams.map(team => {
      const teamTargetCount = targets.reduce((acc, t) => {
        const dist = t.distribuicoes?.find(d => d.equipe.toUpperCase() === team.toUpperCase());
        return acc + (dist ? dist.meta_quantitativa : 0);
      }, 0);

      const teamLogs = monthLogs.filter(l => l.equipe.toUpperCase() === team.toUpperCase());
      const pct = teamTargetCount > 0 ? Math.min(100, Math.round((teamLogs.length / teamTargetCount) * 100)) : 0;

      return {
        team: team,
        meta: teamTargetCount,
        realizado: teamLogs.length,
        percentual: pct
      };
    }).filter(t => t.meta > 0 || totalMetas === 0);
  }, [teams, targets, monthLogs, totalMetas]);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 1. CABEÇALHO & SELEÇÃO DE PERÍODO (MÊS / ANO) */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Painel Geral de Operações e Metas
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Acompanhamento em tempo real: metas por grupo, natureza de operação e desempenho das equipes.
          </p>
        </div>

        {/* Seletor Dinâmico de Mês e Ano */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151A23] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#222938] shadow-xs text-xs font-bold">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {monthNames.map((mName, idx) => (
                <option key={idx + 1} value={idx + 1} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {mName}
                </option>
              ))}
            </select>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {y} {y === currentYear ? '(Atual)' : ''}
                </option>
              ))}
            </select>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'SOF') && (
            <Link
              href="/dashboard/operacoes/lancamento"
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Novo Lançamento</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CARDS SUPERIORES: METAS POR GRUPO DE OPERAÇÕES */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Metas por Grupo de Operações ({monthNames[mes - 1]}/{ano})
            </h2>
          </div>
          <Link
            href="/dashboard/operacoes/metas"
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Gerenciar Metas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {groupStats.map(({ group, metaTotal, executado, percent, metasCount }) => {
            const Icon = getGroupIcon(group.icone);
            const color = getGroupColor(group.cor);

            return (
              <div 
                key={group.id} 
                className="untitled-card p-4 sm:p-5 space-y-3 hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider truncate" title={group.nome}>
                      {group.nome}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color.badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-mono">
                        {executado}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold font-mono">
                        / {metaTotal} ops
                      </span>
                    </div>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${color.badge}`}>
                      {percent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {/* Barra de Progresso do Grupo */}
                  <div className="w-full bg-gray-100 dark:bg-[#1E2636] rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${color.barBg} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                    <span>{metasCount} {metasCount === 1 ? 'meta ativa' : 'metas ativas'}</span>
                    <span>
                      {metaTotal === 0 
                        ? 'Sem meta definida' 
                        : percent >= 100 
                        ? '✓ Meta atingida' 
                        : `Faltam ${Math.max(0, metaTotal - executado)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. GRID PRINCIPAL: TOTAL AGRUPADO POR NATUREZA & EQUIPES */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Coluna Larga (2 cols): Total Agrupado de Cada Natureza */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            
            {/* Cabeçalho da Seção de Naturezas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Progresso Agrupado por Natureza de Operação
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Cumprimento individual das metas planejadas por natureza e Ordem de Serviço em {monthNames[mes - 1]}/{ano}.
                </p>
              </div>

              {/* Busca Rápida de Natureza */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar natureza ou código..."
                  value={natureSearchTerm}
                  onChange={(e) => setNatureSearchTerm(e.target.value)}
                  className="untitled-input pl-8 py-1.5 text-xs w-full"
                />
              </div>
            </div>

            {/* Tabs de Filtro por Grupo */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100 dark:border-[#222938]">
              <button
                type="button"
                onClick={() => setSelectedNatureGroupTab('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  selectedNatureGroupTab === 'ALL'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
                }`}
              >
                <span>Todas ({detailedNaturesList.length})</span>
              </button>

              {groups.map((grp) => {
                const countInGrp = detailedNaturesList.filter(n => n.groupId === grp.id).length;
                const isSelected = selectedNatureGroupTab === grp.id;

                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSelectedNatureGroupTab(grp.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
                    }`}
                  >
                    <span>{grp.nome}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200/70 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {countInGrp}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lista / Tabela das Naturezas */}
            {filteredNaturesList.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-[#0E121A] rounded-2xl border border-gray-200/80 dark:border-[#222938] space-y-2">
                <Target className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nenhuma meta de natureza encontrada para os filtros selecionados em {monthNames[mes - 1]}/{ano}.
                </p>
                {(user?.role === 'ADMIN' || user?.role === 'SOF') && (
                  <Link
                    href="/dashboard/operacoes/metas"
                    className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 mt-2"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Configurar Grade de Metas</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNaturesList.map((item) => {
                  const grpColor = getGroupColor(item.groupColor);
                  const isCompleted = item.percent >= 100;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#222938] bg-white dark:bg-[#151A23] hover:border-gray-300 dark:hover:border-gray-700 transition-all space-y-2.5 shadow-2xs"
                    >
                      {/* Linha Superior: Código, Título, Grupo e Totais */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-gray-100 dark:bg-[#0E121A] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#283042]">
                              {item.codigoNatureza}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${grpColor.badge}`}>
                              {item.groupName}
                            </span>

                            {item.isOS && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Ordem de Serviço
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight">
                            {item.naturezaTitulo}
                            {item.isOS && item.naturezaTitulo !== item.tituloOperacao && (
                              <span className="text-[11px] font-normal text-gray-400 block sm:inline sm:ml-1.5">
                                • {item.tituloOperacao}
                              </span>
                            )}
                          </h4>
                        </div>

                        {/* Números e % da Natureza */}
                        <div className="flex items-center gap-3 self-start sm:self-auto flex-shrink-0">
                          <div className="text-right">
                            <div className="font-mono font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                              {item.executado} <span className="text-xs text-gray-400 font-normal">/ {item.metaTotal}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block">
                              {item.metaTotal > 0 ? `${item.percent}% atingido` : 'Sem meta'}
                            </span>
                          </div>

                          <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                            isCompleted 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : item.percent >= 50
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {item.percent}%
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso da Natureza */}
                      <div className="w-full bg-gray-100 dark:bg-[#1E2636] rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : item.percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, item.percent)}%` }}
                        />
                      </div>

                      {/* Detalhamento por Equipe (se houver cota alocada) */}
                      {item.distribuicoes && item.distribuicoes.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100 dark:border-[#1F2533]">
                          <span className="text-[10px] font-semibold text-gray-400 mr-1">
                            Equipes:
                          </span>
                          {item.distribuicoes.map(dst => (
                            <span
                              key={dst.equipe}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#0E121A] border border-gray-200/80 dark:border-[#283042] text-[10px]"
                            >
                              <span className="font-bold text-gray-700 dark:text-gray-300">{dst.equipe}:</span>
                              <span className={`font-mono font-extrabold ${dst.realizado >= dst.meta ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                {dst.realizado}/{dst.meta}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Quadro: Alertas de Homicídios */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  ALERTAS DE HOMICÍDIOS
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Monitoramento qualificado de ocorrências graves
                </p>
              </div>

              <Link
                href="/dashboard/alertas-homicidio"
                className="btn-secondary py-1 px-2.5 text-xs"
              >
                <span>Ver Alertas</span>
              </Link>
            </div>

            {alerts.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] space-y-1">
                <AlertTriangle className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nenhum alerta de homicídio ativo no momento.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1 sm:mx-0">
                <table className="min-w-[480px] w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#222938] text-gray-400 font-semibold text-[11px]">
                      <th className="pb-2.5 font-medium">Risco</th>
                      <th className="pb-2.5 font-medium">REDS</th>
                      <th className="pb-2.5 font-medium">Local</th>
                      <th className="pb-2.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {alerts.slice(0, 4).map((alerta) => (
                      <tr key={alerta.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1D2432]/40 transition-colors">
                        <td className="py-2.5">
                          <RiskBadge risk={alerta.grau_risco} />
                        </td>
                        <td className="py-2.5 font-mono font-medium text-gray-800 dark:text-gray-200">
                          {alerta.reds_numero}
                        </td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                          <strong>{alerta.bairro}</strong>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {alerta.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Coluna Direita (1 col): Desempenho por Equipe e Atividades Recentes */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Card: Desempenho das Equipes nas Metas */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  DESEMPENHO POR EQUIPE
                </span>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
                  {totalMetas} <span className="text-xs text-gray-500 font-normal">operações no mês</span>
                </div>
              </div>
              <Users className="w-4 h-4 text-gray-400" />
            </div>

            {totalMetas > 0 ? (
              <div className="space-y-3 pt-1 text-xs">
                {teamDistributionStats.map((t, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700 dark:text-gray-300 truncate font-semibold">
                        {t.team}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {t.realizado}/{t.meta} ({t.percentual}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.percentual >= 100 ? 'bg-emerald-500' : t.percentual >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${Math.min(100, t.percentual)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] space-y-1 text-xs">
                <SlidersHorizontal className="w-5 h-5 text-gray-400 mx-auto" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">Nenhuma meta configurada</p>
                {user?.role === 'ADMIN' && (
                  <Link href="/dashboard/operacoes/metas" className="btn-secondary py-1 px-2.5 text-xs inline-block mt-1.5">
                    Configurar Metas
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Card: Atividades Recentes com Destaque para a Natureza Executada */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                ATIVIDADES RECENTES
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>

            {monthLogs.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938]">
                Nenhum lançamento neste período.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                {monthLogs.slice(0, 5).map((log) => {
                  const op = operations.find(o => o.id === log.tipo_operacao_id);
                  const grp = groups.find(g => g.id === op?.grupo);
                  const color = getGroupColor(grp?.cor);

                  return (
                    <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 dark:text-white truncate">
                          {op?.titulo || 'Operação'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px] font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                          {log.equipe}
                        </span>
                      </div>

                      {log.natureza_executada && (
                        <div className="flex items-center gap-1">
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold truncate ${color.badge}`}>
                            ⚡ {log.natureza_executada}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                        <span>📅 {log.data_execucao}</span>
                        <span className="truncate max-w-[130px] font-medium text-gray-500 dark:text-gray-400" title={log.militar_responsavel_nome}>
                          👮 {log.militar_responsavel_nome || 'Militar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-[#222938]">
              <Link
                href="/dashboard/operacoes/lancamento"
                className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Ver todas atividades</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
