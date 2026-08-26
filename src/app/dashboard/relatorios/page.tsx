'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { TARGET_TEAMS } from '@/lib/mock-data';
import { OperationType, MonthlyTarget, OperationExecutionLog } from '@/lib/types';
import { 
  BarChart2, 
  Calendar, 
  Target, 
  Users,
  Printer
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Relatório de Produtividade Operacional</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhamento de metas vs execução, desempenho por grupos e cumprimento de ordens de serviço.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white dark:bg-[#161B26] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs text-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
            </select>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{ano}</span>
          </div>

          <button
            onClick={handlePrint}
            className="btn-secondary"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Visão Geral (Progresso Geral) */}
      <div className="untitled-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Meta Global da Fração</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalExecutadas}</span>
              <span className="text-sm text-gray-500">operações executadas de <strong>{totalMetas}</strong></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">{percentualGeral}%</span>
            <span className="block text-xs text-gray-500">Atingimento da Meta</span>
          </div>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-brand-600 dark:bg-brand-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${percentualGeral}%` }}
          />
        </div>
      </div>

      {/* Grid: Desempenho por Grupo e Desempenho por Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Desempenho por Grupos */}
        <div className="untitled-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Produtividade por Grupo Operacional
            </h3>
          </div>

          <div className="space-y-4">
            {groupsSummary.map((g) => (
              <div key={g.key} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{g.label}</span>
                  <span className="font-medium text-gray-500">
                    {g.realizado} / {g.meta} ({g.percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-600 dark:bg-brand-500 h-2 rounded-full transition-all"
                    style={{ width: `${g.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho por Equipe */}
        <div className="untitled-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Cumprimento de Metas por Equipe
            </h3>
          </div>

          <div className="space-y-2">
            {teamStats.map((t) => (
              <div key={t.team} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{t.team}</span>
                  <span className="block text-xs text-gray-500">
                    {t.realizado} ops / meta: {t.meta}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-600 dark:text-brand-400 text-base">{t.percentual}%</span>
                  <span className="block text-[11px] text-gray-400">cumprido</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
