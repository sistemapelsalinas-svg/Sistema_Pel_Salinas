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
  AlertCircle,
  Copy,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface EditingShiftData {
  militarId: string;
  militarNome: string;
  militarNumeroPm: string;
  equipePadrao: string;
  day: number;
  code: string;
  team: string;
}

export default function EscalaPage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [ano, setAno] = useState(currentDate.getFullYear());
  const [schedule, setSchedule] = useState<MonthlySchedule | null>(null);
  const [legends, setLegends] = useState<ScheduleLegend[]>([]);
  const [militares, setMilitares] = useState<EscalaMilitar[]>([]);
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('TODAS');
  const [notification, setNotification] = useState<string | null>(null);
  const [deleteScheduleConfirm, setDeleteScheduleConfirm] = useState(false);

  // Editor do Plantão Diário
  const [editingShift, setEditingShift] = useState<EditingShiftData | null>(null);
  const [batchDaysCount, setBatchDaysCount] = useState(1);

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
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

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

  // Retorna informações do dia da semana (abreviado com 3 letras e flag de final de semana)
  const getDayOfWeekInfo = (day: number) => {
    const date = new Date(ano, mes - 1, day);
    const dayIndex = date.getDay(); // 0 = DOM, 1 = SEG, 2 = TER, 3 = QUA, 4 = QUI, 5 = SEX, 6 = SÁB
    const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return {
      name: daysOfWeek[dayIndex],
      isWeekend: dayIndex === 0 || dayIndex === 6
    };
  };

  // --- CRIAÇÃO / CÓPIA / EXCLUSÃO DE ESCALA DO MÊS ---
  const handleCreateSchedule = () => {
    const newSch = storage.createSchedule(mes, ano);
    setSchedule(newSch);
    showToast(`Escala de ${monthNames[mes - 1]}/${ano} criada com sucesso.`);
  };

  const handleCopyPrevious = () => {
    const res = storage.copyScheduleFromPreviousMonth(mes, ano);
    if (res.success && res.schedule) {
      setSchedule(res.schedule);
      showToast(`Escala copiada do mês anterior com sucesso.`);
    } else {
      showToast('Nenhuma escala encontrada no mês anterior para cópia.');
    }
  };

  const handleDeleteCurrentSchedule = () => {
    storage.deleteSchedule(mes, ano);
    setSchedule(null);
    setDeleteScheduleConfirm(false);
    showToast(`Escala de ${monthNames[mes - 1]}/${ano} excluída com sucesso.`);
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

  // --- ABERTURA DO EDITOR DE PLANTÃO (AO CLICAR NA CÉLULA) ---
  const handleOpenShiftEditor = (militarId: string, militarNome: string, militarNumeroPm: string, defaultTeam: string, day: number) => {
    if (!schedule || !isAdmin) return;
    const item = schedule.itens.find(i => i.militar_id === militarId && i.dia_mes === day);
    const code = item?.legenda_codigo || 'F';
    const currentTeam = item?.equipe || defaultTeam || 'ALFA 1';

    setEditingShift({
      militarId,
      militarNome,
      militarNumeroPm,
      equipePadrao: defaultTeam,
      day,
      code,
      team: currentTeam
    });
    setBatchDaysCount(1);
  };

  // Salva alterações do plantão (legenda e/ou equipe)
  const handleSaveShift = (applyBatch: boolean = false) => {
    if (!schedule || !editingShift) return;

    const startDay = editingShift.day;
    const endDay = applyBatch ? Math.min(daysInMonth, startDay + batchDaysCount - 1) : startDay;

    const updatedItens = schedule.itens.map(i => {
      if (i.militar_id === editingShift.militarId && i.dia_mes >= startDay && i.dia_mes <= endDay) {
        return {
          ...i,
          legenda_codigo: editingShift.code,
          equipe: editingShift.team
        };
      }
      return i;
    });

    const updatedSchedule = { ...schedule, itens: updatedItens };
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);

    if (applyBatch && batchDaysCount > 1) {
      showToast(`Plantão atualizado do dia ${startDay} ao dia ${endDay}.`);
    } else {
      showToast(`Plantão do dia ${startDay} atualizado.`);
    }

    setEditingShift(null);
  };

  // Replica equipe para o mês todo do militar
  const handleReplicateTeamToAllDays = () => {
    if (!schedule || !editingShift) return;

    const updatedItens = schedule.itens.map(i => {
      if (i.militar_id === editingShift.militarId) {
        return {
          ...i,
          equipe: editingShift.team
        };
      }
      return i;
    });

    const updatedSchedule = { ...schedule, itens: updatedItens };
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
    showToast(`Equipe ${editingShift.team} aplicada a todo o mês.`);
  };

  // Troca rápida de equipe na linha do militar
  const handleBaseTeamChange = (militarId: string, newTeam: string) => {
    if (!schedule) return;
    const updatedItens = schedule.itens.map(i => {
      if (i.militar_id === militarId) {
        return { ...i, equipe: newTeam };
      }
      return i;
    });
    const updatedSchedule = { ...schedule, itens: updatedItens };
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
    showToast(`Equipe do militar alterada para ${newTeam}.`);
  };

  const handleRemoveMilitaryFromSchedule = (militarId: string) => {
    if (!schedule) return;
    const updatedSchedule = {
      ...schedule,
      itens: schedule.itens.filter(i => i.militar_id !== militarId)
    };
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
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

  // Lista de militares cadastrados no efetivo manual
  const sortedMilitaryList = militares.map(mil => {
    const militarScheduleItem = schedule?.itens.find(i => i.militar_id === mil.id);
    return {
      id: mil.id,
      ordem: mil.ordem,
      graduacao: mil.graduacao,
      nome_guerra: mil.nome_guerra,
      nome: `${mil.graduacao} ${mil.nome_guerra}`,
      numero_pm: mil.numero_pm,
      equipe: militarScheduleItem?.equipe || mil.equipe_padrao || 'ALFA 1'
    };
  }).sort((a, b) => a.ordem - b.ordem);

  // Aplica filtros de pesquisa e equipe
  const filteredMilitaryList = sortedMilitaryList.filter(m => {
    const matchesSearch = 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.numero_pm.includes(searchTerm) ||
      m.equipe.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = teamFilter === 'TODAS' || m.equipe === teamFilter;
    return matchesSearch && matchesTeam;
  });

  // Estilização com as cores exatas da legenda oficial da imagem
  const getBadgeForLegend = (code: string) => {
    switch (code) {
      case 'F':
        return 'bg-[#00E676] text-black font-extrabold border border-emerald-600 shadow-2xs';
      case 'DE':
      case 'PE':
      case 'BH':
        return 'bg-[#b2f2bb] text-emerald-950 font-bold border border-emerald-400';
      case 'E':
        return 'bg-black text-white font-extrabold border border-gray-700';
      case 'F.A':
      case 'T.R':
      case 'TPM':
        return 'bg-[#0d47a1] text-white font-bold border border-blue-900';
      case 'FPR':
      case 'L.M':
      case 'LI':
        return 'bg-[#1976d2] text-white font-bold border border-blue-700';
      case 'S':
        return 'bg-emerald-600 text-white font-bold';
      case 'SN':
        return 'bg-indigo-600 text-white font-bold';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium';
    }
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
            Escala Mensal
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            2º Pelotão Salinas · {militares.length} militares no efetivo · {schedule ? `${sortedMilitaryList.length} alocados em ${monthNames[mes - 1]}/${ano}` : 'Sem escala cadastrada'}
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
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>{name}</option>
              ))}
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
          {schedule && isAdmin && (
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
          {schedule && (
            <button
              type="button"
              onClick={handleExportPdf}
              className="btn-secondary py-1.5 px-3 text-xs"
              title="Exportar no layout padrão PMMG"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Exportar PDF</span>
            </button>
          )}

          {/* Excluir Escala do Mês */}
          {schedule && isAdmin && (
            <button
              type="button"
              onClick={() => setDeleteScheduleConfirm(true)}
              className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs"
              title="Excluir escala deste mês"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
      </div>

      {/* CASO NÃO HAJA ESCALA CADASTRADA PARA ESTE MÊS */}
      {!schedule ? (
        <div className="untitled-card p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#0E121A] border border-gray-200 dark:border-[#222938] text-gray-400 flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              Nenhuma escala cadastrada para {monthNames[mes - 1]} de {ano}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Não existe escala operacional gerada para este mês. Ao criar uma nova escala, todos os {militares.length} militares iniciarão automaticamente com <strong>F (Folga)</strong>.
            </p>
          </div>

          {isAdmin ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCreateSchedule}
                className="btn-primary py-2 px-4 text-xs w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Escala para {monthNames[mes - 1]}/{ano}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyPrevious}
                className="btn-secondary py-2 px-4 text-xs w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copiar do Mês Anterior</span>
              </button>
            </div>
          ) : (
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 pt-2">
              Aguarde a administração publicar a escala deste período.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Barra de Filtros e Legendas Oficiais */}
          <div className="space-y-3">
            
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
                  <option value="TODAS">Todas as Equipes ({militares.length})</option>
                  {DEFAULT_TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Dica de Edição Rápida */}
              {isAdmin && (
                <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 dark:bg-[#0E121A] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-[#222938]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clique em qualquer dia para editar a legenda ou mudar a equipe.</span>
                </div>
              )}
            </div>

            {/* Régua de Legendas Oficiais Conforme Diretriz PMMG */}
            <div className="bg-white dark:bg-[#151A23] p-3 rounded-2xl border border-gray-200 dark:border-[#222938] shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-100 dark:border-[#222938]">
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Legenda Oficial da Escala
                </span>
                <span className="text-[10px] text-gray-400">
                  Total de {DEFAULT_LEGENDS.length} legendas padronizadas
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {DEFAULT_LEGENDS.map((leg) => (
                  <span
                    key={leg.codigo}
                    title={leg.descricao}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] cursor-help ${getBadgeForLegend(leg.codigo)}`}
                  >
                    <span>{leg.codigo}</span>
                    <span className="opacity-90 font-normal">· {leg.descricao}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Tabela Matriz da Escala com Dias e Dias da Semana (SAB/DOM em Vermelho) */}
          <div className="untitled-card overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 dark:bg-[#0E121A] border-b border-gray-200 dark:border-[#222938]">
                    <th className="p-2.5 text-center w-10 sticky left-0 bg-gray-50 dark:bg-[#0E121A] z-20 text-[11px] font-bold text-gray-500">
                      Nº
                    </th>
                    <th className="p-2.5 text-left min-w-[180px] sticky left-10 bg-gray-50 dark:bg-[#0E121A] z-20 text-[11px] font-bold text-gray-500">
                      Militar
                    </th>
                    <th className="p-2.5 text-left min-w-[130px] text-[11px] font-bold text-gray-500">
                      Equipe Base
                    </th>
                    
                    {/* Cabeçalho dos Dias: Número do Dia + Dia da Semana (Sáb/Dom em Vermelho) */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dayInfo = getDayOfWeekInfo(day);
                      return (
                        <th 
                          key={day} 
                          className={`p-1 min-w-[34px] text-center border-l border-gray-100 dark:border-[#222938] ${dayInfo.isWeekend ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                        >
                          <span className="font-mono text-[11px] block font-bold text-gray-800 dark:text-gray-200">
                            {day.toString().padStart(2, '0')}
                          </span>
                          <span className={`text-[9px] block uppercase font-extrabold ${dayInfo.isWeekend ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                            {dayInfo.name}
                          </span>
                        </th>
                      );
                    })}

                    <th className="p-2.5 text-center min-w-[65px] font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                      Total Sv.
                    </th>
                    {isAdmin && <th className="p-2.5 text-center w-12 text-[11px] font-bold text-gray-500">Ação</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-sans">
                  {filteredMilitaryList.map((militar, idx) => {
                    const milData = militares.find(m => m.id === militar.id);
                    const militarScheduleItems = schedule?.itens.filter(i => i.militar_id === militar.id) || [];
                    
                    // Conta dias com serviço operacional / extraordinário / treinamento
                    const totalServicos = militarScheduleItems.filter(i => {
                      const leg = legends.find(l => l.codigo === i.legenda_codigo);
                      return leg ? leg.conta_como_servico : (i.legenda_codigo === 'S' || i.legenda_codigo === 'SN' || i.legenda_codigo === 'E');
                    }).length;

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

                        {/* Dropdown de Equipe Base do Militar */}
                        <td className="p-2 text-left min-w-[130px]">
                          {isAdmin ? (
                            <select
                              value={militar.equipe}
                              onChange={(e) => handleBaseTeamChange(militar.id, e.target.value)}
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

                        {/* Células dos Dias 1 a 31 */}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const item = militarScheduleItems.find(it => it.dia_mes === day);
                          const code = item?.legenda_codigo || 'F';
                          const dayTeam = item?.equipe || militar.equipe;
                          const isDifferentTeam = dayTeam !== militar.equipe;
                          const dayInfo = getDayOfWeekInfo(day);
                          const badgeClass = getBadgeForLegend(code);

                          return (
                            <td 
                              key={day} 
                              className={`p-1 text-center border-l border-gray-100 dark:border-[#222938]/60 ${dayInfo.isWeekend ? 'bg-red-50/20 dark:bg-red-950/10' : ''}`}
                            >
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenShiftEditor(militar.id, militar.nome, militar.numero_pm, militar.equipe, day)}
                                  title={`Dia ${day} (${dayInfo.name}): ${code} | Equipe: ${dayTeam} (Clique para editar)`}
                                  className={`w-7 h-7 rounded-lg text-[10px] font-mono transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center mx-auto relative ${badgeClass}`}
                                >
                                  <span>{code}</span>
                                  {isDifferentTeam && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" title={`Equipe especial: ${dayTeam}`} />
                                  )}
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
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: EDITOR INTELIGENTE DE PLANTÃO / DIA / EQUIPE */}
      {/* ========================================================= */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Editar Plantão — Dia {editingShift.day.toString().padStart(2, '0')} ({getDayOfWeekInfo(editingShift.day).name})
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    <strong>{editingShift.militarNome}</strong> · PM {editingShift.militarNumeroPm}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Seleção de Legenda e Equipe Flexível */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* 1. SELEÇÃO DA LEGENDA */}
              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                  1. Selecione a Legenda do Plantão
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {DEFAULT_LEGENDS.map((leg) => {
                    const isSelected = editingShift.code === leg.codigo;
                    return (
                      <button
                        key={leg.codigo}
                        type="button"
                        onClick={() => setEditingShift({ ...editingShift, code: leg.codigo })}
                        className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 ${
                          isSelected 
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs' 
                            : 'border-gray-200 dark:border-[#283042] hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${getBadgeForLegend(leg.codigo)}`}>
                            {leg.codigo}
                          </span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-300 font-medium leading-tight">
                          {leg.descricao}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. EQUIPE OPERACIONAL ESPECÍFICA DESTE DIA */}
              <div className="bg-gray-50 dark:bg-[#0E121A] p-3 rounded-xl border border-gray-200 dark:border-[#222938] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 dark:text-gray-200">
                    2. Equipe Escalada para Este Dia
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Base: <strong>{editingShift.equipePadrao}</strong>
                  </span>
                </div>
                <select
                  value={editingShift.team}
                  onChange={(e) => setEditingShift({ ...editingShift, team: e.target.value })}
                  className="w-full bg-white dark:bg-[#151A23] border border-gray-300 dark:border-[#283042] rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {DEFAULT_TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t} {t === editingShift.equipePadrao ? '(Equipe Padrão)' : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400">
                    Mudar a equipe deste dia não altera os outros dias do militar.
                  </span>
                  <button
                    type="button"
                    onClick={handleReplicateTeamToAllDays}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                  >
                    Replicar equipe para o mês todo
                  </button>
                </div>
              </div>

              {/* 3. APLICAÇÃO RÁPIDA EM LOTE (Ex: Férias, Licenças, Sequências) */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-2">
                <span className="font-bold text-blue-900 dark:text-blue-300 block text-[11px]">
                  ⚡ Aplicar em Lote (Sequência de Dias)
                </span>
                <p className="text-[10px] text-blue-700 dark:text-blue-300">
                  Ideal para lançar períodos de <strong>F.A (Férias)</strong>, <strong>L.M (Licença)</strong> ou folgas contínuas.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-300">Repetir por:</span>
                  {[1, 5, 10, 15, 30].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBatchDaysCount(count)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        batchDaysCount === count 
                          ? 'bg-blue-600 text-white shadow-2xs' 
                          : 'bg-white dark:bg-[#151A23] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#222938]'
                      }`}
                    >
                      {count === 1 ? 'Só este dia' : `${count} dias`}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Fixo com Botão de Salvar */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2 bg-gray-50/50 dark:bg-[#0E121A]">
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveShift(batchDaysCount > 1)}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                Salvar Plantão {batchDaysCount > 1 ? `(${batchDaysCount} dias)` : ''}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: LISTAGEM COMPLETA DO EFETIVO DA ESCALA (43 MILITARES) */}
      {/* ========================================================= */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
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
      {/* MODAL 3: CADASTRO / EDIÇÃO DE MILITAR DO EFETIVO */}
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
      {/* MODAL 4: CONFIRMAÇÃO DE EXCLUSÃO DE MILITAR DO EFETIVO */}
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

      {/* ========================================================= */}
      {/* MODAL 5: CONFIRMAÇÃO DE EXCLUSÃO DA ESCALA DO MÊS */}
      {/* ========================================================= */}
      {deleteScheduleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Escala de {monthNames[mes - 1]}/{ano}?
              </h3>
              <p className="text-gray-500">
                Esta ação removerá toda a escala salva deste período. Os militares não perderão seus cadastros no efetivo.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteScheduleConfirm(false)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentSchedule}
                className="py-2 px-4 flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sim, Excluir Escala
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
