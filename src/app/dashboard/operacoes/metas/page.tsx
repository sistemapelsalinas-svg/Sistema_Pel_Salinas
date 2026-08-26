'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { TARGET_TEAMS } from '@/lib/mock-data';
import { MonthlyTarget, OperationType } from '@/lib/types';
import { distributeEqually, distributeByPercentages } from '@/lib/validation';
import { 
  Target, 
  Copy, 
  Save, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Sliders, 
  PieChart, 
  Calendar, 
  Users, 
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

export default function GestaoMetasPage() {
  const [mes, setMes] = useState(8);
  const [ano, setAno] = useState(2026);
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Distribuição para uma Operação
  const [selectedTarget, setSelectedTarget] = useState<MonthlyTarget | null>(null);
  const [distributionMode, setDistributionMode] = useState<'EQUAL' | 'PERCENTAGE'>('EQUAL');
  const [selectedTeams, setSelectedTeams] = useState<string[]>(TARGET_TEAMS);
  const [customPercentages, setCustomPercentages] = useState<{ [team: string]: number }>({});

  useEffect(() => {
    setOperations(storage.getOperations());
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

  const handleCopyFromPrevious = () => {
    const result = storage.copyTargetsFromPreviousMonth(mes, ano);
    if (result.success) {
      loadTargets();
      showToast('success', `Sucesso! ${result.count} metas copiadas do mês anterior com distribuição preservada.`);
    } else {
      showToast('error', 'Não foram encontradas metas cadastradas no mês anterior para cópia.');
    }
  };

  const handleAddTargetForOp = (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;

    // Default target total: 20
    const defaultTotal = 20;
    const equalDist = distributeEqually(defaultTotal, TARGET_TEAMS.slice(0, 4));

    const newTarget: MonthlyTarget = {
      id: `tgt-${Date.now()}`,
      mes,
      ano,
      tipo_operacao_id: opId,
      meta_total: defaultTotal,
      distribuicoes: Object.entries(equalDist).map(([team, data]) => ({
        id: `dst-${Date.now()}-${team}`,
        meta_mensal_id: `tgt-${Date.now()}`,
        equipe: team,
        percentual_alocado: data.percent,
        meta_quantitativa: data.count
      }))
    };

    const all = storage.getAllTargets();
    const updated = [...all, newTarget];
    storage.saveTargets(updated);
    loadTargets();
    showToast('success', `Meta para ${op.titulo} adicionada.`);
  };

  const handleOpenDistributionModal = (target: MonthlyTarget) => {
    setSelectedTarget(target);
    const existingTeams = target.distribuicoes?.map(d => d.equipe) || TARGET_TEAMS.slice(0, 4);
    setSelectedTeams(existingTeams);

    // Initial percentages
    const pcts: { [team: string]: number } = {};
    if (target.distribuicoes && target.distribuicoes.length > 0) {
      target.distribuicoes.forEach(d => {
        pcts[d.equipe] = d.percentual_alocado || Number((100 / target.distribuicoes!.length).toFixed(1));
      });
    } else {
      const defaultPct = Number((100 / existingTeams.length).toFixed(1));
      existingTeams.forEach(t => { pcts[t] = defaultPct; });
    }
    setCustomPercentages(pcts);
  };

  const handleSaveDistribution = () => {
    if (!selectedTarget) return;

    let newDistributions = [];
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

    const all = storage.getAllTargets();
    const idx = all.findIndex(t => t.id === selectedTarget.id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        distribuicoes: newDistributions
      };
      storage.saveTargets(all);
      loadTargets();
      showToast('success', 'Distribuição de metas atualizada com sucesso.');
    }
    setSelectedTarget(null);
  };

  const handleTotalChange = (targetId: string, newTotal: number) => {
    const all = storage.getAllTargets();
    const idx = all.findIndex(t => t.id === targetId);
    if (idx === -1) return;

    const t = all[idx];
    const teams = t.distribuicoes?.map(d => d.equipe) || TARGET_TEAMS.slice(0, 4);
    const dist = distributeEqually(newTotal, teams);

    all[idx] = {
      ...t,
      meta_total: newTotal,
      distribuicoes: Object.entries(dist).map(([team, data]) => ({
        id: `dst-${Date.now()}-${team}`,
        meta_mensal_id: t.id,
        equipe: team,
        percentual_alocado: data.percent,
        meta_quantitativa: data.count
      }))
    };

    storage.saveTargets(all);
    loadTargets();
  };

  const handleDeleteTarget = (targetId: string) => {
    const all = storage.getAllTargets();
    const filtered = all.filter(t => t.id !== targetId);
    storage.saveTargets(filtered);
    loadTargets();
    showToast('success', 'Meta removida.');
  };

  // Operations that don't have a target yet in this month
  const availableOpsForTarget = operations.filter(
    op => !targets.some(t => t.tipo_operacao_id === op.id)
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'success'
            ? 'bg-emerald-900 text-white border-emerald-600'
            : 'bg-red-900 text-white border-red-600'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header com Seletor de Mês e Botão de Cópia Inteligente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              PLANEJAMENTO DE METAS
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Sliders className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Definição & Distribuição de Metas Mensais</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Estabeleça os quantitativos mensais e distribua entre as equipes operacionais (Igualitária ou Percentual).
          </p>
        </div>

        {/* Controles de Mês / Ano & Copiar Mês Anterior */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </select>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none border-l pl-2 border-slate-200 dark:border-gray-800"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopyFromPrevious}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
            title="Puxar as mesmas metas configuradas no mês anterior"
          >
            <Copy className="w-4 h-4 text-amber-400" />
            <span>Copiar Metas do Mês Anterior</span>
          </button>
        </div>
      </div>

      {/* Lista de Metas Configuradas */}
      <div className="space-y-4">
        {targets.length === 0 ? (
          <div className="tactical-card p-12 text-center space-y-3">
            <Target className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              Nenhuma meta cadastrada para {mes.toString().padStart(2, '0')}/{ano}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Você pode clicar em &ldquo;Copiar Metas do Mês Anterior&rdquo; para carregar automaticamente ou adicionar operações individualmente abaixo.
            </p>
          </div>
        ) : (
          targets.map((tgt) => {
            const op = operations.find(o => o.id === tgt.tipo_operacao_id);
            if (!op) return null;

            return (
              <div
                key={tgt.id}
                className="tactical-card p-5 space-y-4 border-l-4 border-l-emerald-500"
              >
                {/* Header da Operação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs">
                        {op.codigo_natureza}
                      </span>
                      <span className="text-xs font-bold text-slate-400">({op.grupo})</span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {op.titulo}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700">
                      <span className="text-xs text-slate-500 font-bold uppercase">Meta do Mês:</span>
                      <input
                        type="number"
                        min={1}
                        value={tgt.meta_total}
                        onChange={(e) => handleTotalChange(tgt.id, Math.max(1, Number(e.target.value)))}
                        className="w-16 bg-white dark:bg-gray-900 font-black text-sm text-center text-emerald-600 dark:text-emerald-400 rounded-lg p-1 border border-slate-300 dark:border-gray-700 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleOpenDistributionModal(tgt)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                      <PieChart className="w-4 h-4" />
                      <span>Distribuir entre Equipes</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTarget(tgt.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid com a cota das equipes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-100 dark:border-gray-800">
                  {tgt.distribuicoes && tgt.distribuicoes.map((dst) => (
                    <div
                      key={dst.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 text-center"
                    >
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                        {dst.equipe}
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block my-0.5">
                        {dst.meta_quantitativa}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {dst.percentual_alocado}%
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Adicionar Mais Metas */}
      {availableOpsForTarget.length > 0 && (
        <div className="tactical-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Adicionar Meta para Outras Operações do Catálogo
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableOpsForTarget.map((op) => (
              <button
                key={op.id}
                onClick={() => handleAddTargetForOp(op.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold border border-slate-200 dark:border-gray-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>{op.codigo_natureza} — {op.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Distribuição Inteligente (Igualitária ou Percentual) */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="bg-slate-900 dark:bg-black p-5 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Distribuição de Metas da Operação</h3>
                  <p className="text-xs text-slate-400">Total a distribuir: <strong>{selectedTarget.meta_total} operações</strong></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              {/* Seleção do Modo */}
              <div>
                <label className="block font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Modo de Distribuição
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDistributionMode('EQUAL')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      distributionMode === 'EQUAL'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-gray-700'
                    }`}
                  >
                    Distribuição Igualitária (Divisão Automática)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistributionMode('PERCENTAGE')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      distributionMode === 'PERCENTAGE'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-gray-700'
                    }`}
                  >
                    Distribuição por Percentual (%)
                  </button>
                </div>
              </div>

              {/* Seleção de Equipes Envolvidas */}
              <div>
                <label className="block font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Selecione as Equipes que realizarão esta Operação:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TARGET_TEAMS.map((team) => {
                    const isSelected = selectedTeams.includes(team);
                    return (
                      <button
                        key={team}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedTeams.length > 1) {
                              setSelectedTeams(selectedTeams.filter(t => t !== team));
                            }
                          } else {
                            setSelectedTeams([...selectedTeams, team]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 text-slate-400'
                        }`}
                      >
                        {team}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ajuste de Percentuais caso modo seja PERCENTAGE */}
              {distributionMode === 'PERCENTAGE' && (
                <div className="p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Defina o Percentual de Cada Equipe (Total ideal: 100%):
                  </span>
                  <div className="space-y-2">
                    {selectedTeams.map((team) => (
                      <div key={team} className="flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 w-28">{team}</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={customPercentages[team] || 0}
                          onChange={(e) => setCustomPercentages({
                            ...customPercentages,
                            [team]: Number(e.target.value)
                          })}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="font-mono font-bold w-12 text-right text-emerald-600 dark:text-emerald-400">
                          {customPercentages[team] || 0}%
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 w-16 text-right">
                          ({Math.round((selectedTarget.meta_total * (customPercentages[team] || 0)) / 100)} ops)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pré-visualização da Distribuição */}
              <div className="p-3 bg-slate-100 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Resultado Previsto:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTeams.map((t) => {
                    const count = distributionMode === 'EQUAL'
                      ? Math.floor(selectedTarget.meta_total / selectedTeams.length)
                      : Math.round((selectedTarget.meta_total * (customPercentages[t] || 0)) / 100);
                    return (
                      <span key={t} className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                        {t}: <strong>{count} ops</strong>
                      </span>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="p-5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-slate-300 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDistribution}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                Aplicar e Salvar Distribuição
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
