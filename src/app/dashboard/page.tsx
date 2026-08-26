'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { 
  Target, 
  AlertTriangle, 
  CalendarDays, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  Clock, 
  Flame,
  ExternalLink,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';
import { RoleBadge } from '@/components/role-badge';

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
      
      {/* Banner Principal de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/60 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                COMANDO OPERACIONAL
              </span>
              <span className="text-xs text-slate-400">2º Pel / 2ª Cia PM Ind / 11ª RPM - Salinas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Olá, {user?.graduacao} {user?.nome_guerra}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Sistema integrado de metas operacionais, prevenção qualificada de homicídios e direcionamento do policiamento ostensivo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/missao-do-dia"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-sm font-black shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
            >
              <Compass className="w-5 h-5 text-slate-950" />
              <span>Ver Minha Missão do Dia</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Execução x Metas */}
        <div className="tactical-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Operações Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{totalExecutadas}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ meta de {totalMetas}</span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${percentualGeral}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>Progresso Geral</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{percentualGeral}% cumprido</span>
          </div>
        </div>

        {/* Card 2: Alertas de Homicídio */}
        <div className="tactical-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Alertas Ativos
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-600 dark:text-red-400">{alerts.filter(a => a.status === 'ATIVO').length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">em monitoramento</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              {alertasCriticos.length} de Alto Risco / Críticos
            </p>
          </div>
          <Link
            href="/dashboard/alertas-homicidio"
            className="flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline pt-1"
          >
            <span>Ver ocorrências filtradas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Efetivo no Plantão Hoje */}
        <div className="tactical-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Militares de Serviço Hoje
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{escalaHoje.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">escalados no dia</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              Turnos: Normal, Noturno e Expediente
            </p>
          </div>
          <Link
            href="/dashboard/escala"
            className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
          >
            <span>Consultar escala completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Prevenção & Proximidade */}
        <div className="tactical-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Interações Comunitárias
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {logs.filter(l => {
                  const op = operations.find(o => o.id === l.tipo_operacao_id);
                  return op?.grupo === 'INTERACOES_COMUNITARIAS';
                }).length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">visitas / reuniões</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              VCP, VT Furto e Reuniões
            </p>
          </div>
          <Link
            href="/dashboard/operacoes"
            className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline pt-1"
          >
            <span>Ver regras e naturezas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Seção Central Dividida: Alertas Urgentes + Últimas Operações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Alertas de Homicídio com Risco Alto/Crítico */}
        <div className="lg:col-span-2 tactical-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Ocorrências com Potencial de Homicídio / Feminicídio (Salinas)
              </h2>
            </div>
            <Link
              href="/dashboard/alertas-homicidio"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Gerenciar Alertas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alerta) => (
              <div 
                key={alerta.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-800 space-y-2 hover:border-slate-300 dark:hover:border-gray-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={alerta.grau_risco} />
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{alerta.reds_numero}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Bairro: <strong className="text-slate-800 dark:text-slate-200">{alerta.bairro}</strong> ({alerta.municipio})
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {alerta.natureza_ocorrencia}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {alerta.avaliacao_cenario}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Autores: <strong className="text-slate-700 dark:text-slate-300">{alerta.autores}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Vítimas: <strong className="text-slate-700 dark:text-slate-300">{alerta.vitimas}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 3: Últimas Operações Lançadas */}
        <div className="tactical-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Últimos Registros
              </h2>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'SOF') && (
              <Link
                href="/dashboard/operacoes/lancamento"
                className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                title="Lançar Nova Operação"
              >
                <PlusCircle className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum registro recente.</p>
            ) : (
              logs.slice(0, 4).map((log) => {
                const op = operations.find(o => o.id === log.tipo_operacao_id);
                return (
                  <div 
                    key={log.id} 
                    className="p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-200 dark:border-gray-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {op?.codigo_natureza} — {op?.titulo}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                        {log.equipe}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-1">
                      {log.local_fato || log.bairro || 'Salinas/MG'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Data: {log.data_execucao}</span>
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
