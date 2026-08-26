'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
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
  DollarSign,
  Gift
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
  const escalaHoje = schedule.itens.filter(i => i.dia_mes === today && (i.legenda_codigo === 'S' || i.legenda_codigo === 'SN'));

  // Grupos e Naturezas para a Tabela Principal (estilo 1.webp)
  const mainTableRows = [
    { 
      id: 'r1', 
      icon: Bookmark, 
      iconColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300', 
      title: 'POG — Batida Policial & Presença', 
      natureza: 'Y07001 / Y07002',
      realizado: '24 ops', 
      percent: '60%', 
      equipe: 'ALFA 1', 
      nota: 'ZQC e corredores' 
    },
    { 
      id: 'r2', 
      icon: ShieldCheck, 
      iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300', 
      title: 'Proximidade — Patrulha Rural & Escolar', 
      natureza: 'Y15010 / Y15001',
      realizado: '10 ops', 
      percent: '25%', 
      equipe: 'RURAL 1', 
      nota: 'Setor produtivo' 
    },
    { 
      id: 'r3', 
      icon: Users, 
      iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300', 
      title: 'Interações — VCP & Visitas Tranquilizadoras', 
      natureza: 'A21.007 / A20.028',
      realizado: '8 visitas', 
      percent: '20%', 
      equipe: 'RPPM', 
      nota: 'Pós-delito e redes' 
    },
    { 
      id: 'r4', 
      icon: FileText, 
      iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300', 
      title: 'Ordens de Serviço — OS 3.038 Bares & Similares', 
      natureza: 'OS 3.038/2026',
      realizado: '6 fiscalizações', 
      percent: '15%', 
      equipe: 'BRAVO 1', 
      nota: 'Prevenção homicídios' 
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Overview (Matching 1.webp) */}
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

      {/* Top 4 KPI Cards (Matching exact 1.webp card style) */}
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
            <span>100% postos cobertos</span>
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

      {/* Main Grid Layout (Matching 1.webp 2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Wide Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Main Data Table (Matching "POINTS ACTIVITY (MTD)" from 1.webp) */}
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

            {/* Table Matching 1.webp */}
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
                  {mainTableRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1D2432]/40 transition-colors">
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
                    <td className="py-3">Total Executado</td>
                    <td className="py-3 font-mono">{totalExecutadas} ops</td>
                    <td className="py-3">{percentualGeral}%</td>
                    <td className="py-3">—</td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400">Meta ativa</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Card 2: Lower Table (Matching "LIABILITY FORECAST" from 1.webp) */}
          <div className="untitled-card p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  PREVENÇÃO DE HOMICÍDIOS & FEMINICÍDIOS (SALINAS)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Monitoramento qualificado de ocorrências graves em andamento
                </p>
              </div>

              <Link
                href="/dashboard/alertas-homicidio"
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ver Alertas</span>
              </Link>
            </div>

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
                  {alerts.slice(0, 3).map((alerta) => (
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

          </div>

        </div>

        {/* Right Column (1 col - Matching 1.webp Right Panel) */}
        <div className="space-y-6">
          
          {/* Card: Tier / Team Distribution (Matching "TIER DISTRIBUTION" from 1.webp) */}
          <div className="untitled-card p-6 space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                DISTRIBUIÇÃO DE METAS POR EQUIPE
              </span>
              <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">
                40 <span className="text-xs text-gray-500 font-normal">operações distribuídas</span>
              </div>
            </div>

            {/* Gradient Banner matching 1.webp */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-bold">
                Cota Mensal · 100% Alocada
              </span>
              <p className="text-[11px] text-emerald-100 mt-1">
                Equipes ALFA, BRAVO, CHARLIE, DELTA e RURAL
              </p>
            </div>

            {/* Equipes Progress list matching 1.webp */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Equipe ALFA
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">10 ops (100%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Equipe BRAVO
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">10 ops (100%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Equipe CHARLIE
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">10 ops (100%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Patrulha Rural & Outras
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">10 ops (100%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-full" />
                </div>
              </div>
            </div>

          </div>

          {/* Card: Recent Activity (Matching "RECENT ACTIVITY" from 1.webp) */}
          <div className="untitled-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                ATIVIDADES RECENTES
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-3">
              {logs.slice(0, 3).map((log) => {
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

            <div className="pt-2 border-t border-gray-100 dark:border-[#222938]">
              <Link
                href="/dashboard/operacoes"
                className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <span>Ver histórico completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
