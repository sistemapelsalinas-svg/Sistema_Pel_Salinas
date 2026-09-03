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
  X,
  Check
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
    const initialTeams = ['ALFA 1', 'ALFA 2', 'BRAVO 1', 'BRAVO 2', 'CHARLIE 1', 'CHARLIE 2'];
    const equalDist = distributeEqually(defaultTotal, initialTeams);

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
    const existingTeams = target.distribuicoes && target.distribuicoes.length > 0
      ? target.distribuicoes.map(d => d.equipe)
      : ['ALFA 1', 'ALFA 2', 'BRAVO 1', 'BRAVO 2', 'CHARLIE 1', 'CHARLIE 2'];
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

  const handleSelectAllTeams = () => {
    setSelectedTeams([...TARGET_TEAMS]);
  };

  const handleSelectMainShiftTeams = () => {
    setSelectedTeams(['ALFA 1', 'ALFA 2', 'BRAVO 1', 'BRAVO 2', 'CHARLIE 1', 'CHARLIE 2']);
  };

  const handleClearTeams = () => {
    if (TARGET_TEAMS.length > 0) {
      setSelectedTeams([TARGET_TEAMS[0]]);
    }
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
    const teams = t.distribuicoes && t.distribuicoes.length > 0
      ? t.distribuicoes.map(d => d.equipe)
      : ['ALFA 1', 'ALFA 2', 'BRAVO 1', 'BRAVO 2'];
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in slide-in-from-top-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Metas Mensais & Distribuição
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Planejamento quantitativo das operações e distribuição entre as equipes executoras.
          </p>
        </div>

        {/* Mês e Copiar Mês Anterior */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-[#151A23] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#222938] shadow-xs text-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
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
            <span className="font-bold text-gray-700 dark:text-gray-300">{ano}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyFromPrevious}
            className="btn-secondary py-1.5 px-3 text-xs"
            title="Copiar metas cadastradas no mês anterior"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>Copiar do Mês Anterior</span>
          </button>
        </div>
      </div>

      {/* Lista de Metas Configuradas */}
      <div className="space-y-4">
        {targets.length === 0 ? (
          <div className="untitled-card p-8 text-center space-y-3">
            <Target className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
              Nenhuma meta cadastrada para este mês.
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Adicione operações abaixo para definir metas quantitativas e distribuir entre as equipes.
            </p>
          </div>
        ) : (
          targets.map((tgt) => {
            const op = operations.find(o => o.id === tgt.tipo_operacao_id);
            if (!op) return null;

            return (
              <div
                key={tgt.id}
                className="untitled-card p-4 sm:p-5 space-y-4"
              >
                {/* Linha Superior: Nome da Op, Meta Total e Ações */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono font-bold text-[11px] text-gray-700 dark:text-gray-300">
                          {op.codigo_natureza}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          {op.titulo}
                        </h3>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{op.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Input Meta Total */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0E121A] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#222938]">
                      <span className="text-xs text-gray-500 font-medium">Meta Total:</span>
                      <input
                        type="number"
                        min="1"
                        value={tgt.meta_total}
                        onChange={(e) => handleTotalChange(tgt.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 bg-transparent text-right font-bold text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                      <span className="text-xs text-gray-400">ops</span>
                    </div>

                    <button
                      onClick={() => handleOpenDistributionModal(tgt)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Distribuir Equipes</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTarget(tgt.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid com a cota das equipes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-3 border-t border-gray-100 dark:border-[#222938]">
                  {tgt.distribuicoes && tgt.distribuicoes.map((dst) => (
                    <div
                      key={dst.id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#222938] text-center"
                    >
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block truncate">
                        {dst.equipe}
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block my-0.5">
                        {dst.meta_quantitativa} ops
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
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
        <div className="untitled-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
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
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>{op.codigo_natureza} — {op.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Distribuição Responsivo (Nunca corta no Desktop ou Mobile) */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  Distribuição da Meta da Operação
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Total a distribuir: <strong className="text-emerald-600 dark:text-emerald-400">{selectedTarget.meta_total} operações</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedTarget(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Rolagem Interna Independente */}
            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Seleção do Modo (Segmented Control) */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-[11px] uppercase tracking-wider">
                  Modo de Distribuição
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#0E121A] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDistributionMode('EQUAL')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all ${
                      distributionMode === 'EQUAL'
                        ? 'bg-white dark:bg-[#1E2636] text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Divisão Igualitária
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistributionMode('PERCENTAGE')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all ${
                      distributionMode === 'PERCENTAGE'
                        ? 'bg-white dark:bg-[#1E2636] text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Por Percentual (%)
                  </button>
                </div>
              </div>

              {/* Seleção de Equipes com Atalhos Rápidos */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider">
                    Equipes Selecionadas ({selectedTeams.length} de {TARGET_TEAMS.length})
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllTeams}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Todas ({TARGET_TEAMS.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectMainShiftTeams}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Alfa/Bravo/Charlie
                    </button>
                    <button
                      type="button"
                      onClick={handleClearTeams}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Grid das 21 Equipes em formato compacto e organizado */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 border border-gray-100 dark:border-[#222938] rounded-xl bg-gray-50/50 dark:bg-[#0E121A]/50">
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
                        className={`py-1.5 px-2 rounded-lg border text-center font-semibold text-[11px] truncate transition-all ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-xs'
                            : 'bg-white dark:bg-[#151A23] border-gray-200 dark:border-[#222938] text-gray-400 hover:text-gray-700'
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
                <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#222938] space-y-2.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block text-[11px]">
                    Defina as porcentagens por equipe selecionada:
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTeams.map((team) => (
                      <div key={team} className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 w-28 truncate">{team}</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={customPercentages[team] || 0}
                          onChange={(e) => setCustomPercentages({
                            ...customPercentages,
                            [team]: Number(e.target.value)
                          })}
                          className="flex-1 accent-emerald-600"
                        />
                        <span className="font-mono font-bold w-10 text-right text-emerald-600 dark:text-emerald-400">
                          {customPercentages[team] || 0}%
                        </span>
                        <span className="font-mono text-gray-400 w-14 text-right text-[10px]">
                          ({Math.round((selectedTarget.meta_total * (customPercentages[team] || 0)) / 100)} ops)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo da Distribuição Calculada */}
              <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#222938]">
                <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5 text-[11px]">
                  Cota Calculada por Equipe:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {selectedTeams.map((t) => {
                    const count = distributionMode === 'EQUAL'
                      ? Math.floor(selectedTarget.meta_total / selectedTeams.length)
                      : Math.round((selectedTarget.meta_total * (customPercentages[t] || 0)) / 100);
                    return (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] font-medium text-gray-700 dark:text-gray-300 text-[10px]">
                        {t}: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{count} ops</strong>
                      </span>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Fixo com Botões Visíveis */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2 flex-shrink-0 bg-gray-50/50 dark:bg-[#0E121A]">
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDistribution}
                className="btn-primary py-2 px-4 text-xs"
              >
                Salvar Distribuição
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
