'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { TARGET_TEAMS } from '@/lib/mock-data';
import { 
  Target, 
  AlertTriangle, 
  Calendar, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Flame, 
  ChevronRight, 
  Plus, 
  ArrowUpRight, 
  ChevronDown,
  Download,
  Shield,
  FileText,
  Users,
  CheckCircle2,
  Bookmark,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState(storage.getOperations());
  const [logs, setLogs] = useState(storage.getLogs());
  const [alerts, setAlerts] = useState(storage.getAlerts());
  const [targets, setTargets] = useState(storage.getTargets(8, 2026));
  const [schedule, setSchedule] = useState(storage.getSchedule(8, 2026));

  useEffect(() => {
    setOperations(storage.getOperations());
    setLogs(storage.getLogs());
    setAlerts(storage.getAlerts());
    setTargets(storage.getTargets(8, 2026));
    setSchedule(storage.getSchedule(8, 2026));
  }, []);

  const totalMetas = targets.reduce((acc, t) => acc + t.meta_total, 0);
  const totalExecutadas = logs.length;
  const percentualGeral = totalMetas > 0 ? Math.min(100, Math.round((totalExecutadas / totalMetas) * 100)) : 0;
  
  const alertasCriticos = alerts.filter(a => a.status === 'ATIVO' && (a.grau_risco === 'CRITICO' || a.grau_risco === 'ALTO'));

  const today = new Date().getDate();
  const escalaHoje = schedule?.itens ? schedule.itens.filter(i => i.dia_mes === today && (i.legenda_codigo === 'S' || i.legenda_codigo === 'SN')) : [];

  // Grupos Operacionais Calculados Dinamicamente
  const groupConfigs = [
    {
      key: 'POG',
      title: 'POG — Patrulhamento Ostensivo Geral',
      icon: Bookmark,
      iconColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300',
      natureza: 'Y07001, Y07002, Y04009...',
      nota: 'Saturação e ZQC'
    },
    {
      key: 'PROXIMIDADE',
      title: 'Policiamento de Proximidade',
      icon: ShieldCheck,
      iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
      natureza: 'Patrulha Rural, Escolar, BSC...',
      nota: 'Comunidade e prevenção'
    },
    {
      key: 'INTERACOES_COMUNITARIAS',
      title: 'Interações Comunitárias (VCP & Visitas)',
      icon: Users,
      iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',
      natureza: 'VCP, RC, RCR, MRPP, VT Furto/VTCV',
      nota: 'Aproximação social'
    },
    {
      key: 'ORDENS_SERVICO',
      title: 'Ordens de Serviço (OS)',
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300',
      natureza: 'OS 3.028 Visibilidade, OS 3.038 Bares...',
      nota: 'Diretrizes do escalão superior'
    }
  ];

  const dynamicTableRows = groupConfigs.map(cfg => {
    const opsInGroup = operations.filter(o => o.grupo === cfg.key);
    const countLogs = logs.filter(l => opsInGroup.some(o => o.id === l.tipo_operacao_id)).length;
    const targetGroup = targets.filter(t => opsInGroup.some(o => o.id === t.tipo_operacao_id)).reduce((acc, t) => acc + t.meta_total, 0);
    const pct = targetGroup > 0 ? Math.min(100, Math.round((countLogs / targetGroup) * 100)) : (countLogs > 0 ? 100 : 0);

    // Identifica a equipe que mais executou operações neste grupo
    const teamCounts: { [team: string]: number } = {};
    logs.filter(l => opsInGroup.some(o => o.id === l.tipo_operacao_id)).forEach(l => {
      teamCounts[l.equipe] = (teamCounts[l.equipe] || 0) + 1;
    });
    const topTeam = Object.keys(teamCounts).sort((a, b) => teamCounts[b] - teamCounts[a])[0] || '—';

    return {
      ...cfg,
      realizado: `${countLogs} ops`,
      percent: `${pct}%`,
      equipe: topTeam,
      temRegistros: countLogs > 0
    };
  });

  // Estatísticas Dinâmicas por Equipe
  const teamDistributionStats = TARGET_TEAMS.map(team => {
    const teamTargetCount = targets.reduce((acc, t) => {
      const dist = t.distribuicoes?.find(d => d.equipe.toUpperCase() === team);
      return acc + (dist ? dist.meta_quantitativa : 0);
    }, 0);

    const teamLogs = logs.filter(l => l.equipe.toUpperCase().includes(team));
    const pct = teamTargetCount > 0 ? Math.min(100, Math.round((teamLogs.length / teamTargetCount) * 100)) : 0;

    return {
      team: `Equipe ${team}`,
      meta: teamTargetCount,
      realizado: teamLogs.length,
      percentual: pct
    };
  }).filter(t => t.meta > 0 || totalMetas === 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Visão Geral Operacional
            </h1>
            <span className="text-xs text-gray-400 font-medium">Agosto 2026</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {totalExecutadas} operações executadas · {percentualGeral}% cumprimento da meta · {alertasCriticos.length} alertas críticos · {escalaHoje.length} militares no plantão
          </p>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="untitled-card p-5 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Operações Realizadas (Mês)
          </p>
          <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {totalExecutadas}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{percentualGeral}% atingido</span>
            <span className="text-gray-400 font-normal ml-0.5">vs meta {totalMetas}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="untitled-card p-5 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Alertas de Homicídios Ativos
          </p>
          <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {alerts.filter(a => a.status === 'ATIVO').length}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 pt-1">
            <Flame className="w-3.5 h-3.5" />
            <span>{alertasCriticos.length} com alto risco</span>
            <span className="text-gray-400 font-normal ml-0.5">em Salinas</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="untitled-card p-5 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Efetivo Escalado Hoje
          </p>
          <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {escalaHoje.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{escalaHoje.length > 0 ? 'Plantão em andamento' : 'Sem escala lançada hoje'}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="untitled-card p-5 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Interações Comunitárias
          </p>
          <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {logs.filter(l => {
              const op = operations.find(o => o.id === l.tipo_operacao_id);
              return op?.grupo === 'INTERACOES_COMUNITARIAS';
            }).length}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VCP e Visitas Tranquilizadoras</span>
          </div>
        </div>

      </div>

      {/* Main Grid Layout (2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Wide Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Main Data Table */}
          <div className="untitled-card p-6 space-y-4">
            
            {/* Header with Title + Dropdown Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                  ATIVIDADE OPERACIONAL (MÊS CORRENTE)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {totalExecutadas} operações
                  </span>
                  <span className="text-xs text-gray-500">
                    meta total {totalMetas} ({percentualGeral}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0E121A] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#283042] text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Agosto 2026</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#222938] text-gray-400 dark:text-gray-500 font-semibold text-[11px]">
                    <th className="pb-3 font-medium">Grupo / Natureza</th>
                    <th className="pb-3 font-medium">Executado</th>
                    <th className="pb-3 font-medium">% da Meta</th>
                    <th className="pb-3 font-medium">Equipe Destaque</th>
                    <th className="pb-3 font-medium text-right">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {dynamicTableRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.key} className="hover:bg-gray-50/50 dark:hover:bg-[#1D2432]/40 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${row.iconColor}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white block">{row.title}</span>
                              <span className="text-[11px] font-mono text-gray-400 block">{row.natureza}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-gray-900 dark:text-white font-mono">
                          {row.realizado}
                        </td>
                        <td className="py-3.5 font-medium text-gray-600 dark:text-gray-300">
                          {row.percent}
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300 text-[11px]">
                            {row.equipe}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-gray-500 text-[11px]">
                          {row.nota}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary row */}
                  <tr className="font-bold text-gray-900 dark:text-white pt-2">
                    <td className="py-3">Total Geral da Fração</td>
                    <td className="py-3 font-mono">{totalExecutadas} ops</td>
                    <td className="py-3">{percentualGeral}%</td>
                    <td className="py-3">—</td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400">
                      {totalMetas > 0 ? 'Meta em andamento' : 'Sem metas no mês'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {totalExecutadas === 0 && (
              <div className="p-3.5 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Nenhum lançamento registrado neste mês. Utilize o menu <strong>Lançar Operação</strong> para contabilizar.</span>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'SOF') && (
                  <Link href="/dashboard/operacoes/lancamento" className="btn-primary py-1 px-2.5 text-xs flex-shrink-0">
                    Lançar Agora
                  </Link>
                )}
              </div>
            )}

          </div>

          {/* Card 2: Lower Table (Prevenção de Homicídios) */}
          <div className="untitled-card p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  PREVENÇÃO DE HOMICÍDIOS & FEMINICÍDIOS (SALINAS)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Monitoramento qualificado de ocorrências graves com risco de evolução
                </p>
              </div>

              <Link
                href="/dashboard/alertas-homicidio"
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ver Todos os Alertas</span>
              </Link>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] space-y-2">
                <AlertTriangle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nenhum alerta de homicídio ativo no momento.
                </p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  A triagem de ocorrências de risco de Salinas pode ser cadastrada no menu Alertas de Homicídios.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#222938] text-gray-400 dark:text-gray-500 font-semibold text-[11px]">
                      <th className="pb-3 font-medium">Grau de Risco</th>
                      <th className="pb-3 font-medium">Nº REDS</th>
                      <th className="pb-3 font-medium">Bairro / Local</th>
                      <th className="pb-3 font-medium">Autores</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {alerts.slice(0, 4).map((alerta) => (
                      <tr key={alerta.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1D2432]/40 transition-colors">
                        <td className="py-3">
                          <RiskBadge risk={alerta.grau_risco} />
                        </td>
                        <td className="py-3 font-mono font-medium text-gray-800 dark:text-gray-200">
                          {alerta.reds_numero}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          <strong>{alerta.bairro}</strong> ({alerta.municipio})
                        </td>
                        <td className="py-3 text-gray-700 dark:text-gray-300 font-medium">
                          {alerta.autores}
                        </td>
                        <td className="py-3 text-right">
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

        {/* Right Column (1 col) */}
        <div className="space-y-6">
          
          {/* Card: Tier / Team Distribution */}
          <div className="untitled-card p-6 space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                DISTRIBUIÇÃO DE METAS POR EQUIPE
              </span>
              <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">
                {totalMetas} <span className="text-xs text-gray-500 font-normal">operações distribuídas</span>
              </div>
            </div>

            {totalMetas > 0 ? (
              <>
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs">
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-bold">
                    Cota Mensal Definida
                  </span>
                  <p className="text-[11px] text-emerald-100 mt-1">
                    {teamDistributionStats.length} equipes com cotas ativas no mês
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  {teamDistributionStats.map((t, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {t.team}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white font-mono">
                          {t.realizado} / {t.meta} ops ({t.percentual}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all" 
                          style={{ width: `${t.percentual}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] space-y-2">
                <SlidersHorizontal className="w-7 h-7 text-gray-400 mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nenhuma meta configurada
                </p>
                <p className="text-[11px] text-gray-500">
                  Defina a cota mensal de operações para distribuir entre as equipes.
                </p>
                {user?.role === 'ADMIN' && (
                  <Link href="/dashboard/operacoes/metas" className="btn-secondary py-1.5 px-3 text-xs inline-block mt-2">
                    Configurar Metas
                  </Link>
                )}
              </div>
            )}

          </div>

          {/* Card: Recent Activity */}
          <div className="untitled-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                ATIVIDADES RECENTES
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938]">
                Nenhuma operação registrada recentemente.
              </p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 4).map((log) => {
                  const op = operations.find(o => o.id === log.tipo_operacao_id);
                  return (
                    <div key={log.id} className="flex items-start gap-3 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-600 dark:text-gray-300 mt-0.5">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {op?.titulo}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {log.equipe} · {log.bairro || 'Salinas'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-[#222938]">
              <Link
                href="/dashboard/operacoes"
                className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Ver catálogo e diretrizes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
