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
      showToast('success', `${result.count} metas copiadas do mês anterior com sucesso.`);
    } else {
      showToast('error', 'Não foram encontradas metas cadastradas no mês anterior para cópia.');
    }
  };

  const handleAddTargetForOp = (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;

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
      showToast('success', 'Distribuição salva com sucesso.');
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

  const availableOpsForTarget = operations.filter(
    op => !targets.some(t => t.tipo_operacao_id === op.id)
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in slide-in-from-top-2 ${
          notification.type === 'success'
            ? 'bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800'
            : 'bg-error-50 text-error-800 border-error-200 dark:bg-error-950/60 dark:text-error-300 dark:border-error-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Metas Mensais & Distribuição
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Planejamento quantitativo das operações e distribuição entre as equipes (Igualitária ou Percentual).
          </p>
        </div>

        {/* Mês e Copiar Mês Anterior */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-[#161B26] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs text-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
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
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{ano}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyFromPrevious}
            className="btn-secondary"
            title="Copiar metas cadastradas no mês anterior"
          >
            <Copy className="w-4 h-4 text-gray-500" />
            <span>Copiar do Mês Anterior</span>
          </button>
        </div>
      </div>

      {/* Lista de Metas Configuradas */}
      <div className="space-y-4">
        {targets.length === 0 ? (
          <div className="untitled-card p-12 text-center space-y-3">
            <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Nenhuma meta cadastrada para {mes.toString().padStart(2, '0')}/{ano}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Clique em &ldquo;Copiar do Mês Anterior&rdquo; para reaproveitar os quantitativos ou adicione metas abaixo.
            </p>
          </div>
        ) : (
          targets.map((tgt) => {
            const op = operations.find(o => o.id === tgt.tipo_operacao_id);
            if (!op) return null;

            return (
              <div
                key={tgt.id}
                className="untitled-card p-5 space-y-4"
              >
                {/* Header da Operação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-mono font-semibold text-xs border border-brand-200 dark:border-brand-800">
                        {op.codigo_natureza}
                      </span>
                      <span className="text-xs font-medium text-gray-400">({op.grupo})</span>
                    </div>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                      {op.titulo}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 font-medium">Meta Total:</span>
                      <input
                        type="number"
                        min={1}
                        value={tgt.meta_total}
                        onChange={(e) => handleTotalChange(tgt.id, Math.max(1, Number(e.target.value)))}
                        className="w-16 bg-white dark:bg-gray-900 font-bold text-sm text-center text-gray-900 dark:text-white rounded-lg p-1 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <button
                      onClick={() => handleOpenDistributionModal(tgt)}
                      className="btn-secondary py-2 text-xs"
                    >
                      <PieChart className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span>Distribuir Equipes</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTarget(tgt.id)}
                      className="p-2 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid com a cota das equipes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {tgt.distribuicoes && tgt.distribuicoes.map((dst) => (
                    <div
                      key={dst.id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center"
                    >
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 block">
                        {dst.equipe}
                      </span>
                      <span className="text-base font-bold text-brand-600 dark:text-brand-400 block my-0.5">
                        {dst.meta_quantitativa}
                      </span>
                      <span className="text-[11px] text-gray-400 block font-mono">
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
        <div className="untitled-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              Adicionar Outras Operações à Grade de Metas do Mês
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableOpsForTarget.map((op) => (
              <button
                key={op.id}
                onClick={() => handleAddTargetForOp(op.id)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5 text-brand-600" />
                <span>{op.codigo_natureza} — {op.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Distribuição (Untitled UI Dialog) */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Distribuição da Meta da Operação</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total a distribuir: <strong>{selectedTarget.meta_total} operações</strong></p>
              </div>
              <button
                onClick={() => setSelectedTarget(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              {/* Seleção do Modo (Segmented Buttons) */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modo de Distribuição
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDistributionMode('EQUAL')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      distributionMode === 'EQUAL'
                        ? 'bg-white dark:bg-[#161B26] text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Divisão Igualitária
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistributionMode('PERCENTAGE')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      distributionMode === 'PERCENTAGE'
                        ? 'bg-white dark:bg-[#161B26] text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Por Percentual (%)
                  </button>
                </div>
              </div>

              {/* Seleção de Equipes */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecione as Equipes Envolvidas:
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
                        className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-200'
                            : 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400'
                        }`}
                      >
                        {team}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders para Modo PERCENTAGE */}
              {distributionMode === 'PERCENTAGE' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                    Defina as porcentagens por equipe:
                  </span>
                  <div className="space-y-2">
                    {selectedTeams.map((team) => (
                      <div key={team} className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 w-28">{team}</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={customPercentages[team] || 0}
                          onChange={(e) => setCustomPercentages({
                            ...customPercentages,
                            [team]: Number(e.target.value)
                          })}
                          className="flex-1 accent-brand-600"
                        />
                        <span className="font-mono font-bold w-12 text-right text-brand-600 dark:text-brand-400">
                          {customPercentages[team] || 0}%
                        </span>
                        <span className="font-mono text-gray-400 w-16 text-right">
                          ({Math.round((selectedTarget.meta_total * (customPercentages[team] || 0)) / 100)} ops)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo da Distribuição */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Distribuição Calculada:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTeams.map((t) => {
                    const count = distributionMode === 'EQUAL'
                      ? Math.floor(selectedTarget.meta_total / selectedTeams.length)
                      : Math.round((selectedTarget.meta_total * (customPercentages[t] || 0)) / 100);
                    return (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                        {t}: <strong className="text-brand-600 dark:text-brand-400">{count} ops</strong>
                      </span>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDistribution}
                className="btn-primary"
              >
                Aplicar e Salvar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
