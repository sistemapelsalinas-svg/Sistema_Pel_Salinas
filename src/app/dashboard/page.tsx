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
      title: 'POG — Batida & Presença',
      icon: Bookmark,
      iconColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300',
      natureza: 'Y07001, Y07002...',
      nota: 'Saturação e ZQC'
    },
    {
      key: 'PROXIMIDADE',
      title: 'Proximidade & Rural',
      icon: ShieldCheck,
      iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
      natureza: 'Rural, Escolar, BSC...',
      nota: 'Comunidade e prevenção'
    },
    {
      key: 'INTERACOES_COMUNITARIAS',
      title: 'Interações Comunitárias',
      icon: Users,
      iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',
      natureza: 'VCP, RC, RCR, MRPP, VT...',
      nota: 'Aproximação social'
    },
    {
      key: 'ORDENS_SERVICO',
      title: 'Ordens de Serviço (OS)',
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300',
      natureza: 'OS 3.028, OS 3.038...',
      nota: 'Diretrizes da fração'
    }
  ];

  const dynamicTableRows = groupConfigs.map(cfg => {
    const opsInGroup = operations.filter(o => o.grupo === cfg.key);
    const countLogs = logs.filter(l => opsInGroup.some(o => o.id === l.tipo_operacao_id)).length;
    const targetGroup = targets.filter(t => opsInGroup.some(o => o.id === t.tipo_operacao_id)).reduce((acc, t) => acc + t.meta_total, 0);
    const pct = targetGroup > 0 ? Math.min(100, Math.round((countLogs / targetGroup) * 100)) : (countLogs > 0 ? 100 : 0);

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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      
      {/* Top Header Overview Limpo e Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Visão Geral Operacional
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Agosto 2026 · {totalExecutadas} ops · {percentualGeral}% da meta · {alertasCriticos.length} alertas críticos · {escalaHoje.length} no plantão
          </p>
        </div>
      </div>

      {/* Top 4 KPI Cards (Grid 2x2 no mobile para visual ultra-organizado) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1 */}
        <div className="untitled-card p-3.5 sm:p-5 space-y-1 sm:space-y-2">
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
            Operações (Mês)
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {totalExecutadas}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
            <TrendingUp className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{percentualGeral}% vs meta {totalMetas}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="untitled-card p-3.5 sm:p-5 space-y-1 sm:space-y-2">
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
            Alertas de Homicídios
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {alerts.filter(a => a.status === 'ATIVO').length}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 pt-0.5">
            <Flame className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{alertasCriticos.length} críticos em Salinas</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="untitled-card p-3.5 sm:p-5 space-y-1 sm:space-y-2">
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
            Efetivo no Plantão
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {escalaHoje.length}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{escalaHoje.length > 0 ? 'Plantão ativo' : 'Sem escala'}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="untitled-card p-3.5 sm:p-5 space-y-1 sm:space-y-2">
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
            Interações Comunitárias
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {logs.filter(l => {
              const op = operations.find(o => o.id === l.tipo_operacao_id);
              return op?.grupo === 'INTERACOES_COMUNITARIAS';
            }).length}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
            <ShieldCheck className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">VCP e Visitas</span>
          </div>
        </div>

      </div>

      {/* Main Grid Layout (2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left / Wide Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Card 1: Main Data Table */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  ATIVIDADE OPERACIONAL (MÊS CORRENTE)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {totalExecutadas} operações
                  </span>
                  <span className="text-xs text-gray-500">
                    meta total {totalMetas} ({percentualGeral}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-50 dark:bg-[#0E121A] px-2.5 py-1 rounded-xl border border-gray-200 dark:border-[#283042] text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Agosto 2026</span>
              </div>
            </div>

            {/* Table com Scroll Horizontal Seguro */}
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="min-w-[480px] w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#222938] text-gray-400 dark:text-gray-500 font-semibold text-[11px]">
                    <th className="pb-3 font-medium">Grupo / Natureza</th>
                    <th className="pb-3 font-medium">Executado</th>
                    <th className="pb-3 font-medium">% Meta</th>
                    <th className="pb-3 font-medium">Destaque</th>
                    <th className="pb-3 font-medium text-right">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {dynamicTableRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.key} className="hover:bg-gray-50/50 dark:hover:bg-[#1D2432]/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${row.iconColor}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 dark:text-white block truncate">{row.title}</span>
                              <span className="text-[10px] font-mono text-gray-400 block truncate">{row.natureza}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-gray-900 dark:text-white font-mono">
                          {row.realizado}
                        </td>
                        <td className="py-3 font-medium text-gray-600 dark:text-gray-300">
                          {row.percent}
                        </td>
                        <td className="py-3">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300 text-[10px]">
                            {row.equipe}
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-500 text-[10px]">
                          {row.nota}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalExecutadas === 0 && (
              <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Nenhum lançamento registrado neste mês.</span>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'SOF') && (
                  <Link href="/dashboard/operacoes/lancamento" className="btn-primary py-1 px-2.5 text-xs self-start sm:self-auto flex-shrink-0">
                    Lançar Agora
                  </Link>
                )}
              </div>
            )}

          </div>

          {/* Card 2: Lower Table (Prevenção de Homicídios) */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  PREVENÇÃO DE HOMICÍDIOS
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

        {/* Right Column (1 col) */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Card: Tier / Team Distribution */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                DISTRIBUIÇÃO DE METAS POR EQUIPE
              </span>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
                {totalMetas} <span className="text-xs text-gray-500 font-normal">operações</span>
              </div>
            </div>

            {totalMetas > 0 ? (
              <div className="space-y-3 pt-1 text-xs">
                {teamDistributionStats.map((t, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {t.team}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {t.realizado}/{t.meta} ({t.percentual}%)
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
            ) : (
              <div className="p-4 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] space-y-1 text-xs">
                <SlidersHorizontal className="w-5 h-5 text-gray-400 mx-auto" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">Nenhuma meta configurada</p>
                {user?.role === 'ADMIN' && (
                  <Link href="/dashboard/operacoes/metas" className="btn-secondary py-1 px-2.5 text-xs inline-block mt-1.5">
                    Configurar
                  </Link>
                )}
              </div>
            )}

          </div>

          {/* Card: Recent Activity */}
          <div className="untitled-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                ATIVIDADES RECENTES
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938]">
                Nenhuma operação recente.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {logs.slice(0, 4).map((log) => {
                  const op = operations.find(o => o.id === log.tipo_operacao_id);
                  return (
                    <div key={log.id} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-600 dark:text-gray-300 mt-0.5">
                        <Shield className="w-3 h-3" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {op?.titulo}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
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
                <span>Ver catálogo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
