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
  MoreVertical
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

  return (
    <div className="space-y-6">
      
      {/* Untitled UI Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Painel Operacional — 2º Pelotão
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestão estratégica de metas, prevenção criminal e direcionamento tático das equipes em Salinas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/missao-do-dia"
            className="btn-primary"
          >
            <Compass className="w-4 h-4" />
            <span>Minha Missão do Dia</span>
          </Link>
        </div>
      </div>

      {/* Untitled UI Metric Cards (4 colunas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Operações Executadas */}
        <div className="untitled-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Operações no Mês
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              <TrendingUp className="w-3 h-3" />
              {percentualGeral}%
            </span>
          </div>

          <div>
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {totalExecutadas} <span className="text-sm font-normal text-gray-500">/ {totalMetas}</span>
            </h3>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-brand-600 dark:bg-brand-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${percentualGeral}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Meta global da fração em cumprimento
            </p>
          </div>
        </div>

        {/* Card 2: Alertas de Homicídio */}
        <div className="untitled-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Alertas de Homicídios
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-error-50 text-error-700 dark:bg-error-950/60 dark:text-error-300 border border-error-200 dark:border-error-800">
              <Flame className="w-3 h-3" />
              {alertasCriticos.length} críticos
            </span>
          </div>

          <div>
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {alerts.filter(a => a.status === 'ATIVO').length}
            </h3>
          </div>

          <div className="pt-1">
            <Link
              href="/dashboard/alertas-homicidio"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver triagem de ocorrências</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Efetivo no Plantão */}
        <div className="untitled-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Efetivo Escalado Hoje
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {escalaHoje.length} <span className="text-sm font-normal text-gray-500">militares</span>
            </h3>
          </div>

          <div className="pt-1">
            <Link
              href="/dashboard/escala"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Consultar grade da escala</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Interações Comunitárias */}
        <div className="untitled-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Interações Comunitárias
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {logs.filter(l => {
                const op = operations.find(o => o.id === l.tipo_operacao_id);
                return op?.grupo === 'INTERACOES_COMUNITARIAS';
              }).length}
            </h3>
          </div>

          <div className="pt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              VCP, Visitas Tranquilizadoras e Reuniões
            </p>
          </div>
        </div>

      </div>

      {/* Seção Central Untitled UI (2 Colunas: Alertas & Histórico Recente) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Ocorrências de Prevenção a Homicídios */}
        <div className="lg:col-span-2 untitled-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Ocorrências com Potencial de Evolução (Salinas)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Acompanhamento qualificado para contenção de homicídios e feminicídios
              </p>
            </div>
            <Link
              href="/dashboard/alertas-homicidio"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {alerts.slice(0, 3).map((alerta) => (
              <div key={alerta.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={alerta.grau_risco} />
                    <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {alerta.reds_numero}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Bairro: <strong className="text-gray-900 dark:text-gray-200">{alerta.bairro}</strong>
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {alerta.natureza_ocorrencia}
                </p>

                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {alerta.avaliacao_cenario}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Autor: <strong className="text-gray-800 dark:text-gray-300">{alerta.autores}</strong></span>
                  <span>Vítima: <strong className="text-gray-800 dark:text-gray-300">{alerta.vitimas}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 3: Últimas Operações Lançadas */}
        <div className="untitled-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Últimos Lançamentos
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registros enviados pela SOF
              </p>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'SOF') && (
              <Link
                href="/dashboard/operacoes/lancamento"
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                title="Lançar Operação"
              >
                <Plus className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Nenhum registro recente.</p>
            ) : (
              logs.slice(0, 4).map((log) => {
                const op = operations.find(o => o.id === log.tipo_operacao_id);
                return (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {op?.titulo}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300 font-mono flex-shrink-0">
                        {log.equipe}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {log.local_fato || log.bairro || 'Salinas'}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                      <span>{log.data_execucao}</span>
                      <span>Resp: {log.militar_responsavel_nome || 'SOF'}</span>
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
