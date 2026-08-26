'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { TARGET_TEAMS } from '@/lib/mock-data';
import { OperationType, MonthlyTarget, OperationExecutionLog } from '@/lib/types';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Users,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

export default function RelatoriosPage() {
  const [mes, setMes] = useState(8);
  const [ano, setAno] = useState(2026);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [logs, setLogs] = useState<OperationExecutionLog[]>([]);

  useEffect(() => {
    setOperations(storage.getOperations());
    setTargets(storage.getTargets(mes, ano));
    setLogs(storage.getLogs());
  }, [mes, ano]);

  const totalMetas = targets.reduce((acc, t) => acc + t.meta_total, 0);
  const totalExecutadas = logs.length;
  const percentualGeral = totalMetas > 0 ? Math.min(100, Math.round((totalExecutadas / totalMetas) * 100)) : 0;

  // Produtividade por Grupo
  const groupsSummary = [
    { key: 'POG', label: 'Operações POG' },
    { key: 'PROXIMIDADE', label: 'Policiamento de Proximidade' },
    { key: 'INTERACOES_COMUNITARIAS', label: 'Interações Comunitárias' },
    { key: 'ORDENS_SERVICO', label: 'Ordens de Serviço (OS)' },
  ].map(g => {
    const opsInGroup = operations.filter(o => o.grupo === g.key);
    const countLogs = logs.filter(l => opsInGroup.some(o => o.id === l.tipo_operacao_id)).length;
    const targetGroup = targets.filter(t => opsInGroup.some(o => o.id === t.tipo_operacao_id)).reduce((acc, t) => acc + t.meta_total, 0);
    const pct = targetGroup > 0 ? Math.min(100, Math.round((countLogs / targetGroup) * 100)) : (countLogs > 0 ? 100 : 0);

    return {
      ...g,
      realizado: countLogs,
      meta: targetGroup,
      percentual: pct
    };
  });

  // Produtividade por Equipe
  const teamStats = TARGET_TEAMS.map(team => {
    const teamLogs = logs.filter(l => l.equipe.toUpperCase().includes(team));
    const teamTargetCount = targets.reduce((acc, t) => {
      const dist = t.distribuicoes?.find(d => d.equipe.toUpperCase() === team);
      return acc + (dist ? dist.meta_quantitativa : 0);
    }, 0);

    const pct = teamTargetCount > 0 ? Math.min(100, Math.round((teamLogs.length / teamTargetCount) * 100)) : 0;

    return {
      team,
      realizado: teamLogs.length,
      meta: teamTargetCount,
      percentual: pct
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              PRODUTIVIDADE & BI
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Relatório de Produtividade Operacional</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Acompanhamento de metas vs execução, desempenho por grupos e cumprimento de ordens de serviço.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor Mês/Ano */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
            </select>
            <span className="font-bold text-slate-800 dark:text-slate-200">{ano}</span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Visão Geral (Progresso Geral) */}
      <div className="tactical-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Meta Global da Fração</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{totalExecutadas}</span>
              <span className="text-sm text-slate-500">operações executadas de <strong>{totalMetas}</strong> planejadas</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{percentualGeral}%</span>
            <span className="block text-xs text-slate-400">Atingimento da Meta</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden p-0.5">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${percentualGeral}%` }}
          />
        </div>
      </div>

      {/* Grid: Desempenho por Grupo e Desempenho por Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Desempenho por Grupos */}
        <div className="tactical-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Produtividade por Grupo Operacional
            </h3>
          </div>

          <div className="space-y-4">
            {groupsSummary.map((g) => (
              <div key={g.key} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{g.label}</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {g.realizado} / {g.meta} ({g.percentual}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${g.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho por Equipe */}
        <div className="tactical-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cumprimento de Metas por Equipe
            </h3>
          </div>

          <div className="space-y-3">
            {teamStats.map((t) => (
              <div key={t.team} className="p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-200 dark:border-gray-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{t.team}</span>
                  <span className="block text-[11px] text-slate-400">
                    {t.realizado} ops realizadas / meta: {t.meta}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{t.percentual}%</span>
                  <span className="block text-[10px] text-slate-400">cumprido</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
