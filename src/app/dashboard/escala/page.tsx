'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { DEFAULT_TEAMS, DEFAULT_LEGENDS } from '@/lib/mock-data';
import { MonthlySchedule, ScheduleLegend, ScheduleItem, EscalaMilitar } from '@/lib/types';
import { generatePmmgSchedulePdf } from '@/lib/pdf-service';
import { useAuth } from '@/lib/auth-context';
import { 
  CalendarDays, 
  Download, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle, 
  Users, 
  Calendar,
  Info,
  Search,
  Pencil,
  X,
  Shield,
  Filter,
  AlertCircle
} from 'lucide-react';

export default function EscalaPage() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [mes, setMes] = useState(8);
  const [ano, setAno] = useState(2026);
  const [schedule, setSchedule] = useState<MonthlySchedule | null>(null);
  const [legends, setLegends] = useState<ScheduleLegend[]>([]);
  const [militares, setMilitares] = useState<EscalaMilitar[]>([]);
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('TODAS');
  const [notification, setNotification] = useState<string | null>(null);

  // Modais de Gestão do Efetivo
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isEditMilitarModalOpen, setIsEditMilitarModalOpen] = useState(false);
  const [editingMilitarId, setEditingMilitarId] = useState<string | null>(null);
  const [deleteConfirmMilitar, setDeleteConfirmMilitar] = useState<EscalaMilitar | null>(null);

  const initialMilitarForm = {
    graduacao: 'SD',
    nome_guerra: '',
    numero_pm: '',
    equipe_padrao: 'ALFA 1'
  };
  const [militarFormData, setMilitarFormData] = useState(initialMilitarForm);

  const isAdmin = user?.role === 'ADMIN';
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const graduacoes = ['TEN', 'ST', '1º SGT', '2º SGT', '3º SGT', 'SGT', 'CB', 'SD', 'CAP', 'MAJ', 'TEN CEL', 'CEL'];

  useEffect(() => {
    loadAllData();
  }, [mes, ano]);

  const loadAllData = () => {
    const milList = storage.getMilitaresEscala();
    setMilitares(milList);
    setLegends(storage.getLegends());
    const sch = storage.getSchedule(mes, ano);
    setSchedule(sch);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSchedule = () => {
    if (!schedule) return;
    storage.saveSchedule(schedule);
    showToast('Escala salva com sucesso.');
  };

  const handleExportPdf = () => {
    if (!schedule) return;
    generatePmmgSchedulePdf(schedule, legends);
  };

  // --- GESTÃO DE DIAS DA ESCALA ---
  const handleDayCodeChange = (militarId: string, day: number, newCode: string) => {
    if (!schedule) return;
    const upperCode = newCode.toUpperCase().trim();
    setSchedule({
      ...schedule,
      itens: schedule.itens.map(i => {
        if (i.militar_id === militarId && i.dia_mes === day) {
          return { ...i, legenda_codigo: upperCode };
        }
        return i;
      })
    });
  };

  const handleCycleDayCode = (militarId: string, day: number, currentCode: string) => {
    if (!isAdmin) return;
    const codeOrder = ['F', 'S', 'SN', 'FA', 'L', 'DISP', 'CUR', 'A'];
    const currentIdx = codeOrder.indexOf(currentCode);
    const nextCode = codeOrder[(currentIdx + 1) % codeOrder.length] || 'F';
    handleDayCodeChange(militarId, day, nextCode);
  };

  const handleTeamChange = (militarId: string, newTeam: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      itens: schedule.itens.map(i => {
        if (i.militar_id === militarId) {
          return { ...i, equipe: newTeam };
        }
        return i;
      })
    });
  };

  const handleRemoveMilitaryFromSchedule = (militarId: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      itens: schedule.itens.filter(i => i.militar_id !== militarId)
    });
    showToast('Militar removido da escala deste mês.');
  };

  // --- GESTÃO DO EFETIVO DE MILITARES (CRUD) ---
  const handleOpenAddMilitar = () => {
    setEditingMilitarId(null);
    setMilitarFormData(initialMilitarForm);
    setIsEditMilitarModalOpen(true);
  };

  const handleOpenEditMilitar = (m: EscalaMilitar) => {
    setEditingMilitarId(m.id);
    setMilitarFormData({
      graduacao: m.graduacao,
      nome_guerra: m.nome_guerra,
      numero_pm: m.numero_pm,
      equipe_padrao: m.equipe_padrao || 'ALFA 1'
    });
    setIsEditMilitarModalOpen(true);
  };

  const handleSaveMilitar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!militarFormData.nome_guerra.trim() || !militarFormData.numero_pm.trim()) return;

    if (editingMilitarId) {
      storage.updateMilitarEscala(editingMilitarId, {
        graduacao: militarFormData.graduacao,
        nome_guerra: militarFormData.nome_guerra.trim().toUpperCase(),
        numero_pm: militarFormData.numero_pm.trim(),
        equipe_padrao: militarFormData.equipe_padrao
      });
      showToast('Dados do militar atualizados com sucesso.');
    } else {
      storage.addMilitarEscala({
        graduacao: militarFormData.graduacao,
        nome_guerra: militarFormData.nome_guerra.trim().toUpperCase(),
        numero_pm: militarFormData.numero_pm.trim(),
        equipe_padrao: militarFormData.equipe_padrao,
        ativo: true
      });
      showToast('Novo militar cadastrado no efetivo da escala.');
    }

    setIsEditMilitarModalOpen(false);
    setEditingMilitarId(null);
    setMilitarFormData(initialMilitarForm);
    loadAllData();
  };

  const handleDeleteMilitar = (m: EscalaMilitar) => {
    storage.deleteMilitarEscala(m.id);
    if (schedule) {
      const updatedSchedule = {
        ...schedule,
        itens: schedule.itens.filter(i => i.militar_id !== m.id)
      };
      storage.saveSchedule(updatedSchedule);
    }
    setDeleteConfirmMilitar(null);
    loadAllData();
    showToast(`Militar ${m.graduacao} ${m.nome_guerra} excluído do efetivo.`);
  };

  // Extrai lista única de militares da escala atual
  const distinctMilitaryList = Array.from(
    new Map(
      schedule?.itens.map(item => [
        item.militar_id,
        {
          id: item.militar_id,
          nome: item.militar_nome || 'Militar',
          numero_pm: item.militar_numero_pm || '',
          equipe: item.equipe
        }
      ]) || []
    ).values()
  );

  // Ordena os militares de acordo com a ordem do efetivo cadastrado
  const sortedMilitaryList = distinctMilitaryList.sort((a, b) => {
    const milA = militares.find(m => m.id === a.id);
    const milB = militares.find(m => m.id === b.id);
    const orderA = milA?.ordem ?? 999;
    const orderB = milB?.ordem ?? 999;
    return orderA - orderB;
  });

  // Aplica filtros de pesquisa e equipe
  const filteredMilitaryList = sortedMilitaryList.filter(m => {
    const matchesSearch = 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.numero_pm.includes(searchTerm) ||
      m.equipe.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = teamFilter === 'TODAS' || m.equipe === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const getBadgeForLegend = (code: string) => {
    const l = legends.find(leg => leg.codigo === code);
    if (code === 'S') return 'bg-emerald-600 text-white font-bold';
    if (code === 'SN') return 'bg-blue-600 text-white font-bold';
    if (code === 'FA') return 'bg-amber-600 text-white font-bold';
    if (code === 'F') return 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium';
    return l?.cor_badge || 'bg-purple-600 text-white font-bold';
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header com Ações Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Escala Operacional Mensal
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            2º Pelotão Salinas · {militares.length} militares no efetivo · {sortedMilitaryList.length} alocados no mês
          </p>
        </div>

        {/* Controles de Mês, Efetivo e Exportação */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Seletor Mês / Ano */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151A23] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#222938] shadow-xs text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
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
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Botão para Gerenciar Efetivo de Militares */}
          <button
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Efetivo da Escala ({militares.length})</span>
          </button>

          {/* Salvar Escala */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleSaveSchedule}
              className="btn-primary py-1.5 px-3 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Escala</span>
            </button>
          )}

          {/* Exportar PDF */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="btn-secondary py-1.5 px-3 text-xs"
            title="Exportar no layout padrão PMMG"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Exportar PDF</span>
          </button>

        </div>
      </div>

      {/* Barra de Filtros e Legenda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151A23] p-3 rounded-2xl border border-gray-200 dark:border-[#222938] shadow-xs">
        
        {/* Busca por Militar / Nº PM */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, graduação ou Nº PM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filtro por Equipe */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="TODAS">Todas as Equipes ({distinctMilitaryList.length})</option>
            {DEFAULT_TEAMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Legendas Rápidas */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px]">
          <span className="font-semibold text-gray-400 mr-1">LEGENDA:</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">S: Serviço</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">SN: Noturno</span>
          <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">F: Folga</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-bold">FA: Férias</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold">L: Licença</span>
        </div>

      </div>

      {/* Tabela Matriz da Escala (Com Todos os 43 Militares e Scroll Horizontal Seguro) */}
      <div className="untitled-card overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-[#0E121A] border-b border-gray-200 dark:border-[#222938] text-[11px] font-bold text-gray-600 dark:text-gray-300">
                <th className="p-2.5 text-center w-10 sticky left-0 bg-gray-50 dark:bg-[#0E121A] z-10">Nº</th>
                <th className="p-2.5 text-left min-w-[180px] sticky left-10 bg-gray-50 dark:bg-[#0E121A] z-10">Militar</th>
                <th className="p-2.5 text-left min-w-[130px]">Equipe</th>
                
                {/* Cabeçalho dos Dias 1 a 31 */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <th key={day} className="p-1.5 min-w-[32px] font-mono text-[10px] text-gray-500 dark:text-gray-400">
                    {day.toString().padStart(2, '0')}
                  </th>
                ))}

                <th className="p-2.5 text-center min-w-[65px] font-bold text-emerald-600 dark:text-emerald-400">Sv.</th>
                {isAdmin && <th className="p-2.5 text-center w-12">Ação</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-sans">
              {filteredMilitaryList.map((militar, idx) => {
                const milData = militares.find(m => m.id === militar.id);
                const militarScheduleItems = schedule?.itens.filter(i => i.militar_id === militar.id) || [];
                const totalServicos = militarScheduleItems.filter(i => i.legenda_codigo === 'S' || i.legenda_codigo === 'SN').length;

                return (
                  <tr key={militar.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1D2432]/40 transition-colors">
                    
                    {/* Número de Ordem */}
                    <td className="p-2 text-center text-gray-400 font-mono font-semibold sticky left-0 bg-white dark:bg-[#151A23] z-10">
                      {milData?.ordem || idx + 1}
                    </td>

                    {/* Nome do Militar e Nº PM */}
                    <td className="p-2 text-left sticky left-10 bg-white dark:bg-[#151A23] z-10 min-w-[180px]">
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white block truncate text-xs">
                          {militar.nome}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 block">
                          PM {militar.numero_pm}
                        </span>
                      </div>
                    </td>

                    {/* Dropdown de Equipe */}
                    <td className="p-2 text-left min-w-[130px]">
                      {isAdmin ? (
                        <select
                          value={militar.equipe}
                          onChange={(e) => handleTeamChange(militar.id, e.target.value)}
                          className="w-full bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                        >
                          {DEFAULT_TEAMS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                          {militar.equipe}
                        </span>
                      )}
                    </td>

                    {/* Dias 1 a 31 com Badges Interativos */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const item = militarScheduleItems.find(it => it.dia_mes === day);
                      const code = item?.legenda_codigo || 'F';
                      const badgeClass = getBadgeForLegend(code);

                      return (
                        <td key={day} className="p-1 text-center">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleCycleDayCode(militar.id, day, code)}
                              title={`Dia ${day}: ${code} (Clique para alternar)`}
                              className={`w-7 h-7 rounded-lg text-[10px] font-mono transition-transform active:scale-90 flex items-center justify-center mx-auto shadow-2xs ${badgeClass}`}
                            >
                              {code}
                            </button>
                          ) : (
                            <span className={`w-7 h-7 rounded-lg text-[10px] font-mono flex items-center justify-center mx-auto ${badgeClass}`}>
                              {code}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total de Serviços no Mês */}
                    <td className="p-2 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {totalServicos}
                    </td>

                    {/* Ação de Remover da Escala */}
                    {isAdmin && (
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMilitaryFromSchedule(militar.id)}
                          title="Remover militar desta escala"
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: LISTAGEM COMPLETA DO EFETIVO DA ESCALA (43 MILITARES) */}
      {/* ========================================================= */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Efetivo Cadastrado para a Escala
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Total de <strong>{militares.length} militares</strong> cadastrados no 2º Pelotão Salinas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenAddMilitar}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Militar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabela do Efetivo com Rolagem Interna */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <div className="border border-gray-200 dark:border-[#222938] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#0E121A] border-b border-gray-200 dark:border-[#222938] text-[11px] font-bold text-gray-500">
                      <th className="p-2.5 w-12 text-center">Nº</th>
                      <th className="p-2.5 w-24">Graduação</th>
                      <th className="p-2.5">Nome de Guerra</th>
                      <th className="p-2.5">Nº PM</th>
                      <th className="p-2.5">Equipe Padrão</th>
                      {isAdmin && <th className="p-2.5 text-right w-20">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {militares.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1D2432]/40 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-gray-400">{m.ordem}</td>
                        <td className="p-2.5 font-bold text-gray-700 dark:text-gray-300">{m.graduacao}</td>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">{m.nome_guerra}</td>
                        <td className="p-2.5 font-mono text-gray-600 dark:text-gray-400">{m.numero_pm}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                            {m.equipe_padrao || 'ALFA 1'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditMilitar(m)}
                                title="Editar dados do militar"
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmMilitar(m)}
                                title="Excluir militar do efetivo"
                                className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Fixo */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between bg-gray-50/50 dark:bg-[#0E121A]">
              <span className="text-[11px] text-gray-400">
                Estes militares compõem as escalas mensais do 2º Pelotão.
              </span>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="btn-secondary py-1.5 px-4 text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CADASTRO / EDIÇÃO DE MILITAR DO EFETIVO */}
      {/* ========================================================= */}
      {isEditMilitarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                {editingMilitarId ? 'Editar Militar do Efetivo' : 'Novo Militar para a Escala'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditMilitarModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilitar} className="p-4 sm:p-5 space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Graduação *
                  </label>
                  <select
                    value={militarFormData.graduacao}
                    onChange={(e) => setMilitarFormData({ ...militarFormData, graduacao: e.target.value })}
                    className="untitled-input font-bold"
                    required
                  >
                    {graduacoes.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nº PM *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 157.842-6"
                    value={militarFormData.numero_pm}
                    onChange={(e) => setMilitarFormData({ ...militarFormData, numero_pm: e.target.value })}
                    className="untitled-input font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome de Guerra *
                </label>
                <input
                  type="text"
                  placeholder="Ex: ANDRE SANTOS ou VILELLA"
                  value={militarFormData.nome_guerra}
                  onChange={(e) => setMilitarFormData({ ...militarFormData, nome_guerra: e.target.value })}
                  className="untitled-input font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equipe Padrão
                </label>
                <select
                  value={militarFormData.equipe_padrao}
                  onChange={(e) => setMilitarFormData({ ...militarFormData, equipe_padrao: e.target.value })}
                  className="untitled-input font-semibold"
                >
                  {DEFAULT_TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditMilitarModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs"
                >
                  {editingMilitarId ? 'Salvar Alterações' : 'Cadastrar Militar'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO DE MILITAR DO EFETIVO */}
      {/* ========================================================= */}
      {deleteConfirmMilitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Militar do Efetivo?
              </h3>
              <p className="text-gray-500">
                Tem certeza que deseja remover <strong>{deleteConfirmMilitar.graduacao} {deleteConfirmMilitar.nome_guerra}</strong> (PM {deleteConfirmMilitar.numero_pm}) do efetivo de escalas?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMilitar(null)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMilitar(deleteConfirmMilitar)}
                className="py-2 px-4 flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
