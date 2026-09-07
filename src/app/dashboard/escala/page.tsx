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
  Sparkles,
  Tag,
  Palette,
  Settings2
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

const COLOR_PRESETS = [
  { name: 'Cinza Claro (Serviço Normal)', value: 'bg-gray-200 text-gray-900 font-bold border border-gray-300 dark:bg-gray-700 dark:text-gray-100' },
  { name: 'Verde Vivo (Folga)', value: 'bg-[#00E676] text-black font-extrabold border border-emerald-500' },
  { name: 'Verde Claro (Descanso / Permuta / BH)', value: 'bg-[#b2f2bb] text-emerald-950 font-bold border border-emerald-300' },
  { name: 'Preto (Extraordinário / Ordem Cmt)', value: 'bg-black text-white font-extrabold border border-gray-700' },
  { name: 'Azul Escuro (Férias / Treinamento)', value: 'bg-[#0d47a1] text-white font-bold border border-blue-900' },
  { name: 'Azul Médio (Licenças / Feriado)', value: 'bg-[#1976d2] text-white font-bold border border-blue-700' },
  { name: 'Roxo / Noturno', value: 'bg-indigo-600 text-white font-bold' },
  { name: 'Âmbar / Aviso', value: 'bg-amber-500 text-black font-bold border border-amber-600' },
  { name: 'Vermelho / Urgência', value: 'bg-rose-600 text-white font-bold border border-rose-700' },
  { name: 'Verde Petróleo / Curso', value: 'bg-teal-600 text-white font-bold' },
  { name: 'Púrpura Especial', value: 'bg-purple-600 text-white font-bold' }
];

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

  // Modal de Lançamento em Lote / Modelos de Escala (Administrativa, Dobradinha, etc.)
  const [isBatchPatternModalOpen, setIsBatchPatternModalOpen] = useState(false);
  const [batchTargetType, setBatchTargetType] = useState<'SINGLE' | 'TEAM' | 'ALL'>('SINGLE');
  const [batchSelectedMilitarId, setBatchSelectedMilitarId] = useState<string>('');
  const [batchSelectedTeam, setBatchSelectedTeam] = useState<string>('ALFA 1');
  const [batchPatternType, setBatchPatternType] = useState<'ADMINISTRATIVA' | 'DOBRADINHA_A' | 'DOBRADINHA_B' | 'ALTERNADO_1X1' | 'ZERAR_FOLGAS'>('DOBRADINHA_A');
  const [batchDutyCode, setBatchDutyCode] = useState<string>('S');

  // Modais de Gestão de Legendas
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [isEditLegendModalOpen, setIsEditLegendModalOpen] = useState(false);
  const [editingLegendCode, setEditingLegendCode] = useState<string | null>(null);
  const [deleteConfirmLegend, setDeleteConfirmLegend] = useState<ScheduleLegend | null>(null);

  const initialLegendForm = {
    codigo: '',
    descricao: '',
    conta_como_servico: false,
    cor_badge: COLOR_PRESETS[0].value
  };
  const [legendFormData, setLegendFormData] = useState(initialLegendForm);

  // Modais de Gestão do Efetivo
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isEditMilitarModalOpen, setIsEditMilitarModalOpen] = useState(false);
  const [editingMilitarId, setEditingMilitarId] = useState<string | null>(null);
  const [deleteConfirmMilitar, setDeleteConfirmMilitar] = useState<EscalaMilitar | null>(null);

  // Modais de Gestão de Equipes (CRUD)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [editingTeamOldName, setEditingTeamOldName] = useState<string | null>(null);
  const [teamFormName, setTeamFormName] = useState('');
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<string | null>(null);

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
    setTeams(storage.getTeams());
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

  // --- GESTÃO DE LEGENDAS (CRUD) ---
  const handleOpenAddLegend = () => {
    setEditingLegendCode(null);
    setLegendFormData(initialLegendForm);
    setIsEditLegendModalOpen(true);
  };

  const handleOpenEditLegend = (leg: ScheduleLegend) => {
    setEditingLegendCode(leg.codigo);
    setLegendFormData({
      codigo: leg.codigo,
      descricao: leg.descricao,
      conta_como_servico: leg.conta_como_servico,
      cor_badge: leg.cor_badge
    });
    setIsEditLegendModalOpen(true);
  };

  const handleSaveLegend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legendFormData.codigo.trim() || !legendFormData.descricao.trim()) return;

    const cleanCode = legendFormData.codigo.trim().toUpperCase();

    if (editingLegendCode) {
      storage.updateLegend(editingLegendCode, {
        codigo: cleanCode,
        descricao: legendFormData.descricao.trim(),
        conta_como_servico: legendFormData.conta_como_servico,
        cor_badge: legendFormData.cor_badge
      });
      showToast(`Legenda ${cleanCode} atualizada.`);
    } else {
      storage.addLegend({
        codigo: cleanCode,
        descricao: legendFormData.descricao.trim(),
        conta_como_servico: legendFormData.conta_como_servico,
        cor_badge: legendFormData.cor_badge
      });
      showToast(`Nova legenda ${cleanCode} criada.`);
    }

    setIsEditLegendModalOpen(false);
    setEditingLegendCode(null);
    setLegendFormData(initialLegendForm);
    setLegends(storage.getLegends());
  };

  const handleDeleteLegend = (codigo: string) => {
    storage.deleteLegend(codigo);
    setDeleteConfirmLegend(null);
    setLegends(storage.getLegends());
    showToast(`Legenda ${codigo} excluída.`);
  };

  // --- GESTÃO DE EQUIPES (CRUD) ---
  const handleOpenAddTeam = () => {
    setEditingTeamOldName(null);
    setTeamFormName('');
    setIsEditTeamModalOpen(true);
  };

  const handleOpenEditTeam = (teamName: string) => {
    setEditingTeamOldName(teamName);
    setTeamFormName(teamName);
    setIsEditTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = teamFormName.trim().toUpperCase();
    if (!clean) return;

    if (editingTeamOldName) {
      storage.updateTeam(editingTeamOldName, clean);
      showToast(`Equipe ${editingTeamOldName} alterada para ${clean}.`);
    } else {
      const added = storage.addTeam(clean);
      if (!added) {
        showToast(`A equipe ${clean} já existe.`);
        return;
      }
      showToast(`Nova equipe ${clean} criada.`);
    }

    setIsEditTeamModalOpen(false);
    setEditingTeamOldName(null);
    setTeamFormName('');
    loadAllData();
  };

  const handleDeleteTeam = (teamName: string) => {
    storage.deleteTeam(teamName);
    setDeleteConfirmTeam(null);
    loadAllData();
    showToast(`Equipe ${teamName} excluída.`);
  };

  // --- CÁLCULO DE PADRÕES DE ESCALA (ADMINISTRATIVA, DOBRADINHA, ETC.) ---
  const calculateDayPattern = (day: number, patternType: string, dutyCode: string) => {
    // 0 = Seg, 1 = Ter, 2 = Qua, 3 = Qui, 4 = Sex, 5 = Sáb, 6 = Dom
    const dow = (new Date(ano, mes - 1, day).getDay() + 6) % 7;

    if (patternType === 'ADMINISTRATIVA') {
      // Segunda a Sexta = Trabalho, Sábado e Domingo = Folga
      return dow >= 0 && dow <= 4 ? dutyCode : 'F';
    }

    if (patternType === 'DOBRADINHA_A' || patternType === 'DOBRADINHA_B') {
      // Cálculo da semana no mês considerando ciclo de 14 dias
      const firstOfMonth = new Date(ano, mes - 1, 1);
      const firstDow = (firstOfMonth.getDay() + 6) % 7;
      const firstMonday = new Date(ano, mes - 1, 1 - firstDow);
      const currentDay = new Date(ano, mes - 1, day);
      const diffWeeks = Math.floor((currentDay.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));

      // Semana A: Seg(T), Ter(F), Qua(T), Qui(F), Sex(F), Sab(T), Dom(T) -> Trabalhou quarta -> folga qui/sex e trabalha sab/dom
      // Semana B: Seg(F), Ter(T), Qua(F), Qui(T), Sex(T), Sab(F), Dom(F) -> Folgou quarta -> trabalha qui/sex e folga sab/dom
      const isWeekA = patternType === 'DOBRADINHA_A' ? (diffWeeks % 2 === 0) : (diffWeeks % 2 !== 0);
      const weekAPattern = [true, false, true, false, false, true, true];
      const weekBPattern = [false, true, false, true, true, false, false];

      const isDuty = isWeekA ? weekAPattern[dow] : weekBPattern[dow];
      return isDuty ? dutyCode : 'F';
    }

    if (patternType === 'ALTERNADO_1X1') {
      return day % 2 !== 0 ? dutyCode : 'F';
    }

    if (patternType === 'ZERAR_FOLGAS') {
      return 'F';
    }

    return 'F';
  };

  // Limpeza rápida de serviço para Folga (ao clicar no X da célula)
  const handleQuickClearShift = (militarId: string, day: number) => {
    if (!schedule || !isAdmin) return;
    const updatedItens = schedule.itens.map(i => {
      if (i.militar_id === militarId && i.dia_mes === day) {
        return {
          ...i,
          legenda_codigo: 'F'
        };
      }
      return i;
    });
    const updatedSchedule = { ...schedule, itens: updatedItens };
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
    showToast(`Dia ${day} transformado em Folga (F).`);
  };

  // Abrir Modal de Lançamento em Lote / Modelos de Escala
  const handleOpenBatchPattern = (militarId?: string) => {
    if (!schedule || !isAdmin) return;
    if (militarId) {
      setBatchTargetType('SINGLE');
      setBatchSelectedMilitarId(militarId);
    } else {
      setBatchTargetType('ALL');
      if (militares.length > 0) {
        setBatchSelectedMilitarId(militares[0].id);
      }
    }
    setIsBatchPatternModalOpen(true);
  };

  // Aplica o Modelo de Escala selecionado para os militares escolhidos
  const handleApplyBatchPattern = () => {
    if (!schedule || !isAdmin) return;
    
    let targetMilitaryIds: string[] = [];
    if (batchTargetType === 'SINGLE') {
      if (!batchSelectedMilitarId) return;
      targetMilitaryIds = [batchSelectedMilitarId];
    } else if (batchTargetType === 'TEAM') {
      targetMilitaryIds = sortedMilitaryList
        .filter(m => m.equipe === batchSelectedTeam)
        .map(m => m.id);
    } else {
      targetMilitaryIds = militares.map(m => m.id);
    }

    if (targetMilitaryIds.length === 0) {
      showToast('Nenhum militar selecionado para aplicação em lote.');
      return;
    }

    const updatedItens = schedule.itens.map(i => {
      if (targetMilitaryIds.includes(i.militar_id)) {
        const newCode = calculateDayPattern(i.dia_mes, batchPatternType, batchDutyCode);
        return {
          ...i,
          legenda_codigo: newCode
        };
      }
      return i;
    });

    const updatedSchedule = { ...schedule, itens: updatedItens };
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
    setIsBatchPatternModalOpen(false);

    const patternLabels: Record<string, string> = {
      ADMINISTRATIVA: 'Escala Administrativa (Seg a Sex)',
      DOBRADINHA_A: 'Escala Dobradinha - Turma A',
      DOBRADINHA_B: 'Escala Dobradinha - Turma B',
      ALTERNADO_1X1: 'Dias Alternados (1x1)',
      ZERAR_FOLGAS: 'Folga Geral (F)'
    };

    const targetDesc = batchTargetType === 'SINGLE'
      ? `militar selecionado`
      : batchTargetType === 'TEAM'
      ? `equipe ${batchSelectedTeam} (${targetMilitaryIds.length} militares)`
      : `todos os ${targetMilitaryIds.length} militares`;

    showToast(`${patternLabels[batchPatternType]} aplicada para ${targetDesc}.`);
  };

  // --- ABERTURA DO EDITOR DE PLANTÃO (AO CLICAR NA CÉLULA) ---
  const handleOpenShiftEditor = (militarId: string, militarNome: string, militarNumeroPm: string, defaultTeam: string, day: number) => {
    if (!schedule || !isAdmin) return;
    const item = schedule.itens.find(i => i.militar_id === militarId && i.dia_mes === day);
    const code = item?.legenda_codigo || 'F';
    const currentTeam = item?.equipe !== undefined ? item.equipe : (defaultTeam || '');

    setEditingShift({
      militarId,
      militarNome,
      militarNumeroPm,
      equipePadrao: defaultTeam || '',
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
      equipe: militarScheduleItem?.equipe || ''
    };
  }).sort((a, b) => a.ordem - b.ordem);

  // Aplica filtros de pesquisa e equipe
  const filteredMilitaryList = sortedMilitaryList.filter(m => {
    const matchesSearch = 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.numero_pm.includes(searchTerm) ||
      (m.equipe && m.equipe.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTeam = true;
    if (teamFilter === 'TODAS') {
      matchesTeam = true;
    } else if (teamFilter === 'SEM_EQUIPE') {
      matchesTeam = !m.equipe;
    } else {
      matchesTeam = m.equipe === teamFilter;
    }
    return matchesSearch && matchesTeam;
  });

  // Retorna a cor do badge cadastrada dinamicamente para a legenda
  const getBadgeForLegend = (code: string) => {
    const found = legends.find(l => l.codigo === code);
    if (found?.cor_badge) return found.cor_badge;

    // Padrão de fallback
    if (code === 'S') return 'bg-gray-200 text-gray-900 font-bold border border-gray-300 dark:bg-gray-700 dark:text-gray-100';
    if (code === 'F') return 'bg-[#00E676] text-black font-extrabold border border-emerald-600 shadow-2xs';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium';
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

        {/* Controles de Mês, Efetivo, Legendas e Exportação */}
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
            <span>Efetivo ({militares.length})</span>
          </button>

          {/* Botão para Gerenciar Equipes (CRUD) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              className="btn-secondary py-1.5 px-3 text-xs"
              title="Gerenciar equipes operacionais (CRUD)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Equipes ({teams.length})</span>
            </button>
          )}

          {/* Botão para Rolar até as Legendas */}
          <button
            type="button"
            onClick={() => document.getElementById('secao-legendas')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary py-1.5 px-3 text-xs"
            title="Rolar página até a legenda da escala"
          >
            <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ver Legendas ({legends.length})</span>
          </button>

          {/* Botão de Lançamento em Lote / Modelos de Escala */}
          {schedule && isAdmin && (
            <button
              type="button"
              onClick={() => handleOpenBatchPattern()}
              className="btn-secondary py-1.5 px-3 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              title="Lançar escala em lote (Administrativa, Dobradinha Turma A/B, etc.)"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Lançar em Lote</span>
            </button>
          )}

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
              Não existe escala operacional gerada para este mês. Ao criar uma nova escala, todos os {militares.length} militares iniciarão automaticamente com vínculos de equipe zerados e <strong>F (Folga)</strong>.
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
          {/* Barra de Busca e Filtros */}
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
                <option value="SEM_EQUIPE">
                  Sem Equipe ({sortedMilitaryList.filter(m => !m.equipe).length})
                </option>
                {teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela Matriz da Escala com Scroll Interno e Cabeçalho Fixo (Sticky Header) */}
          <div className="untitled-card overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-w-full max-h-[70vh] relative border-b border-gray-100 dark:border-[#222938]">
              <table className="w-full text-center border-collapse text-xs">
                <thead className="sticky top-0 z-30 bg-gray-50/95 dark:bg-[#0E121A]/95 backdrop-blur-md shadow-xs">
                  <tr className="border-b border-gray-200 dark:border-[#222938]">
                    <th className="p-2.5 text-center w-10 sticky top-0 left-0 bg-gray-100 dark:bg-[#151A23] z-40 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      Nº
                    </th>
                    <th className="p-2.5 text-left min-w-[180px] sticky top-0 left-10 bg-gray-100 dark:bg-[#151A23] z-40 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      Militar
                    </th>
                    <th className="p-2.5 text-left min-w-[130px] sticky top-0 bg-gray-50/95 dark:bg-[#0E121A]/95 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      Equipe Base
                    </th>
                    
                    {/* Cabeçalho dos Dias: Número do Dia + Dia da Semana (Sáb/Dom em Vermelho) */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dayInfo = getDayOfWeekInfo(day);
                      return (
                        <th 
                          key={day} 
                          className={`p-1 min-w-[34px] text-center border-l border-gray-200/60 dark:border-[#222938] sticky top-0 ${dayInfo.isWeekend ? 'bg-red-50/80 dark:bg-red-950/60' : 'bg-gray-50/95 dark:bg-[#0E121A]/95'}`}
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

                    <th className="p-2.5 text-center min-w-[65px] font-bold text-emerald-600 dark:text-emerald-400 text-[11px] sticky top-0 bg-gray-50/95 dark:bg-[#0E121A]/95">
                      Total Sv.
                    </th>
                    {isAdmin && <th className="p-2.5 text-center w-20 text-[11px] font-bold text-gray-500 sticky top-0 bg-gray-50/95 dark:bg-[#0E121A]/95">Ações</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-sans">
                  {filteredMilitaryList.map((militar, idx) => {
                    const milData = militares.find(m => m.id === militar.id);
                    const militarScheduleItems = schedule?.itens.filter(i => i.militar_id === militar.id) || [];
                    
                    // Conta dias com serviço conforme cadastro da legenda
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
                              value={militar.equipe || ''}
                              onChange={(e) => handleBaseTeamChange(militar.id, e.target.value)}
                              className={`w-full border rounded-lg px-2 py-1 text-[11px] font-semibold focus:outline-none cursor-pointer transition-colors ${
                                !militar.equipe
                                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-300'
                                  : 'bg-gray-50 dark:bg-[#0E121A] border-gray-200 dark:border-[#283042] text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              <option value="">— Sem Equipe —</option>
                              {teams.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              !militar.equipe
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}>
                              {militar.equipe || '— Sem Equipe —'}
                            </span>
                          )}
                        </td>

                        {/* Células dos Dias 1 a 31 com botão X para apagar/transformar em folga */}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const item = militarScheduleItems.find(it => it.dia_mes === day);
                          const code = item?.legenda_codigo || 'F';
                          const dayTeam = item?.equipe || militar.equipe;
                          const isDifferentTeam = dayTeam !== militar.equipe;
                          const dayInfo = getDayOfWeekInfo(day);
                          const badgeClass = getBadgeForLegend(code);
                          const isDuty = code !== 'F';

                          return (
                            <td 
                              key={day} 
                              className={`p-1 text-center border-l border-gray-100 dark:border-[#222938]/60 ${dayInfo.isWeekend ? 'bg-red-50/20 dark:bg-red-950/10' : ''}`}
                            >
                              {isAdmin ? (
                                <div className="relative inline-flex items-center justify-center group/cell">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenShiftEditor(militar.id, militar.nome, militar.numero_pm, militar.equipe, day)}
                                    title={`Dia ${day} (${dayInfo.name}): ${code} | Equipe: ${dayTeam} (Clique para editar)`}
                                    className={`w-7 h-7 rounded-lg text-[10px] font-mono transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center relative ${badgeClass}`}
                                  >
                                    <span>{code}</span>
                                    {isDifferentTeam && (
                                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" title={`Equipe especial: ${dayTeam}`} />
                                    )}
                                  </button>

                                  {/* Botão X rápido para apagar o serviço e transformar em Folga */}
                                  {isDuty && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickClearShift(militar.id, day);
                                      }}
                                      title={`Apagar serviço do dia ${day} -> transformar em Folga (F)`}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md text-[10px] font-black opacity-0 group-hover/cell:opacity-100 hover:scale-125 transition-all z-20 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
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

                        {/* Ações: Lançar Padrão / Remover da Escala */}
                        {isAdmin && (
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenBatchPattern(militar.id)}
                                title="Aplicar modelo de escala (Administrativa ou Dobradinha) para este militar"
                                className="p-1 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMilitaryFromSchedule(militar.id)}
                                title="Remover militar desta escala"
                                className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seção Inferior: Régua Completa de Legendas */}
          <div id="secao-legendas" className="bg-white dark:bg-[#151A23] p-4 rounded-2xl border border-gray-200 dark:border-[#222938] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-[#222938]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Legenda da Escala Mensal
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {legends.length} siglas ativas configuradas para as escalas
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddLegend}
                    className="btn-primary py-1 px-2.5 text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nova Legenda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLegendModalOpen(true)}
                    className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1"
                  >
                    <Settings2 className="w-3 h-3 text-blue-500" />
                    <span>Gerenciar Legendas</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {legends.map((leg) => (
                <span
                  key={leg.codigo}
                  title={leg.descricao}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] cursor-help ${getBadgeForLegend(leg.codigo)}`}
                >
                  <span>{leg.codigo}</span>
                  <span className="opacity-90 font-normal">· {leg.descricao}</span>
                  {leg.conta_como_servico && <span className="opacity-75 font-semibold text-[9px]">(Sv)</span>}
                </span>
              ))}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-gray-800 dark:text-gray-200">
                    1. Selecione a Legenda do Plantão
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingShift(null);
                      setIsLegendModalOpen(true);
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    + Gerenciar Legendas
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {legends.map((leg) => {
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
                    Base: <strong>{editingShift.equipePadrao || 'Sem equipe'}</strong>
                  </span>
                </div>
                <select
                  value={editingShift.team || ''}
                  onChange={(e) => setEditingShift({ ...editingShift, team: e.target.value })}
                  className="w-full bg-white dark:bg-[#151A23] border border-gray-300 dark:border-[#283042] rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">— Sem Equipe —</option>
                  {teams.map((t) => (
                    <option key={t} value={t}>
                      {t} {t === editingShift.equipePadrao ? '(Equipe Base)' : ''}
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

              {/* 3. APLICAÇÃO RÁPIDA EM LOTE */}
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

            {/* Footer Fixo */}
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
      {/* MODAL 2: GESTÃO DE LEGENDAS (LISTAR, EDITAR, CRIAR, EXCLUIR) */}
      {/* ========================================================= */}
      {isLegendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Gerenciamento de Legendas da Escala
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {legends.length} legendas cadastradas para compor as escalas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddLegend}
                  className="btn-primary py-1.5 px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Legenda</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLegendModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabela de Legendas */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <div className="border border-gray-200 dark:border-[#222938] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#0E121A] border-b border-gray-200 dark:border-[#222938] text-[11px] font-bold text-gray-500">
                      <th className="p-2.5 w-24">Sigla</th>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 w-32 text-center">Conta Serviço?</th>
                      <th className="p-2.5 text-right w-20">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {legends.map((leg) => (
                      <tr key={leg.codigo} className="hover:bg-gray-50/60 dark:hover:bg-[#1D2432]/40 transition-colors">
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono inline-block ${getBadgeForLegend(leg.codigo)}`}>
                            {leg.codigo}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">
                          {leg.descricao}
                        </td>
                        <td className="p-2.5 text-center">
                          {leg.conta_como_servico ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                              Sim (Sv)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-medium">
                              Não
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLegend(leg)}
                              title="Editar legenda"
                              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmLegend(leg)}
                              title="Excluir legenda"
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Fixo */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between bg-gray-50/50 dark:bg-[#0E121A]">
              <span className="text-[11px] text-gray-400">
                Você pode personalizar as siglas, descrições e cores para as escalas da sua unidade.
              </span>
              <button
                type="button"
                onClick={() => setIsLegendModalOpen(false)}
                className="btn-secondary py-1.5 px-4 text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CADASTRO / EDIÇÃO DE LEGENDA */}
      {/* ========================================================= */}
      {isEditLegendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                {editingLegendCode ? `Editar Legenda ${editingLegendCode}` : 'Nova Legenda da Escala'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditLegendModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLegend} className="p-4 sm:p-5 space-y-3.5 text-xs">
              
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sigla / Código *
                </label>
                <input
                  type="text"
                  placeholder="Ex: S, F, DE, E, S2..."
                  value={legendFormData.codigo}
                  onChange={(e) => setLegendFormData({ ...legendFormData, codigo: e.target.value })}
                  className="untitled-input font-bold uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição Completa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Serviço Operacional Normal"
                  value={legendFormData.descricao}
                  onChange={(e) => setLegendFormData({ ...legendFormData, descricao: e.target.value })}
                  className="untitled-input font-medium"
                  required
                />
              </div>

              {/* Seletor de Estilo / Cor */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cor de Fundo / Estilo do Badge
                </label>
                <select
                  value={legendFormData.cor_badge}
                  onChange={(e) => setLegendFormData({ ...legendFormData, cor_badge: e.target.value })}
                  className="untitled-input font-semibold cursor-pointer"
                >
                  {COLOR_PRESETS.map((preset) => (
                    <option key={preset.name} value={preset.value}>
                      {preset.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-2 rounded-xl bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Prévia do Badge:</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono ${legendFormData.cor_badge}`}>
                    {legendFormData.codigo || 'SIGLA'}
                  </span>
                </div>
              </div>

              {/* Checkbox: Conta como Serviço */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legendFormData.conta_como_servico}
                    onChange={(e) => setLegendFormData({ ...legendFormData, conta_como_servico: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700"
                  />
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    Conta como dia de serviço no total mensal (Sv.)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditLegendModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs"
                >
                  {editingLegendCode ? 'Salvar Alterações' : 'Criar Legenda'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CONFIRMAÇÃO DE EXCLUSÃO DE LEGENDA */}
      {/* ========================================================= */}
      {deleteConfirmLegend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Legenda {deleteConfirmLegend.codigo}?
              </h3>
              <p className="text-gray-500">
                Tem certeza que deseja remover a legenda <strong>{deleteConfirmLegend.descricao}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLegend(null)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLegend(deleteConfirmLegend.codigo)}
                className="py-2 px-4 flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: LISTAGEM DO EFETIVO DA ESCALA */}
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
      {/* MODAL 6: CADASTRO / EDIÇÃO DE MILITAR DO EFETIVO */}
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
                  {teams.map((t) => (
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
      {/* MODAL 7: CONFIRMAÇÃO DE EXCLUSÃO DE MILITAR DO EFETIVO */}
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
      {/* MODAL 8: CONFIRMAÇÃO DE EXCLUSÃO DA ESCALA DO MÊS */}
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

      {/* ========================================================= */}
      {/* MODAL 9: LANÇAMENTO EM LOTE / MODELOS DE ESCALA (ADMINISTRATIVA, DOBRADINHA) */}
      {/* ========================================================= */}
      {isBatchPatternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0 bg-gray-50/50 dark:bg-[#0E121A]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Lançamento em Lote — Modelos de Escala
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Preenchimento automático para {monthNames[mes - 1]} de {ano}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBatchPatternModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Seleção de Alvo, Modelo, Legenda e Prévia */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* 1. SELEÇÃO DO ALVO (QUEM RECEBERÁ A ESCALA) */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-800 dark:text-gray-200">
                  1. Aplicar escala para quem?
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchTargetType('SINGLE')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      batchTargetType === 'SINGLE'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500'
                        : 'border-gray-200 dark:border-[#283042] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                    }`}
                  >
                    Um Militar
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchTargetType('TEAM')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      batchTargetType === 'TEAM'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500'
                        : 'border-gray-200 dark:border-[#283042] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                    }`}
                  >
                    Toda a Equipe
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchTargetType('ALL')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      batchTargetType === 'ALL'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500'
                        : 'border-gray-200 dark:border-[#283042] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                    }`}
                  >
                    Todo o Efetivo ({militares.length})
                  </button>
                </div>

                {/* Dropdown condicional de acordo com o alvo */}
                {batchTargetType === 'SINGLE' && (
                  <div className="pt-1">
                    <select
                      value={batchSelectedMilitarId}
                      onChange={(e) => setBatchSelectedMilitarId(e.target.value)}
                      className="untitled-input font-bold"
                    >
                      {sortedMilitaryList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome} — PM {m.numero_pm} ({m.equipe || 'Sem equipe'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {batchTargetType === 'TEAM' && (
                  <div className="pt-1">
                    <select
                      value={batchSelectedTeam}
                      onChange={(e) => setBatchSelectedTeam(e.target.value)}
                      className="untitled-input font-bold"
                    >
                      {teams.map((t) => (
                        <option key={t} value={t}>
                          Equipe {t} ({sortedMilitaryList.filter(m => m.equipe === t).length} militares)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. SELEÇÃO DO MODELO DE ESCALA */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-800 dark:text-gray-200">
                  2. Escolha o Modelo de Escala
                </label>

                <div className="space-y-2">
                  
                  {/* Escala Administrativa */}
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    batchPatternType === 'ADMINISTRATIVA'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500'
                      : 'border-gray-200 dark:border-[#283042] hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                  }`}>
                    <input
                      type="radio"
                      name="patternType"
                      checked={batchPatternType === 'ADMINISTRATIVA'}
                      onChange={() => setBatchPatternType('ADMINISTRATIVA')}
                      className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 dark:text-white block text-xs">
                        🏢 Escala Administrativa (Segunda a Sexta)
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        Trabalha de <strong>Segunda a Sexta-feira</strong> e folga aos <strong>Sábados e Domingos</strong>.
                      </p>
                    </div>
                  </label>

                  {/* Dobradinha - Turma A */}
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    batchPatternType === 'DOBRADINHA_A'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500'
                      : 'border-gray-200 dark:border-[#283042] hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                  }`}>
                    <input
                      type="radio"
                      name="patternType"
                      checked={batchPatternType === 'DOBRADINHA_A'}
                      onChange={() => setBatchPatternType('DOBRADINHA_A')}
                      className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 dark:text-white block text-xs">
                        🔄 Escala Dobradinha — Turma A (Trabalha 1ª Seg, Qua, Sáb, Dom)
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        <strong>Semana 1:</strong> Seg, Qua, Sáb, Dom (Folga Ter, Qui, Sex).<br />
                        <strong>Semana 2:</strong> Ter, Qui, Sex (Folga Seg, Qua, Sáb, Dom).<br />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          * Regra: Como trabalhou na quarta, folga qui/sex e trabalha sáb/dom.
                        </span>
                      </p>
                    </div>
                  </label>

                  {/* Dobradinha - Turma B */}
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    batchPatternType === 'DOBRADINHA_B'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500'
                      : 'border-gray-200 dark:border-[#283042] hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                  }`}>
                    <input
                      type="radio"
                      name="patternType"
                      checked={batchPatternType === 'DOBRADINHA_B'}
                      onChange={() => setBatchPatternType('DOBRADINHA_B')}
                      className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 dark:text-white block text-xs">
                        🔄 Escala Dobradinha — Turma B (Trabalha 1ª Ter, Qui, Sex)
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        <strong>Semana 1:</strong> Ter, Qui, Sex (Folga Seg, Qua, Sáb, Dom).<br />
                        <strong>Semana 2:</strong> Seg, Qua, Sáb, Dom (Folga Ter, Qui, Sex).<br />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          * Regra: Como folgou na quarta, dobra na qui/sex e folga sáb/dom.
                        </span>
                      </p>
                    </div>
                  </label>

                  {/* Dias Alternados Simples */}
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    batchPatternType === 'ALTERNADO_1X1'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500'
                      : 'border-gray-200 dark:border-[#283042] hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                  }`}>
                    <input
                      type="radio"
                      name="patternType"
                      checked={batchPatternType === 'ALTERNADO_1X1'}
                      onChange={() => setBatchPatternType('ALTERNADO_1X1')}
                      className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 dark:text-white block text-xs">
                        ⏱️ Dias Alternados Simples (Dia Sim / Dia Não)
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        Trabalha em dias ímpares (01, 03, 05...) e folga em dias pares (02, 04, 06...).
                      </p>
                    </div>
                  </label>

                  {/* Zerar Escala */}
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    batchPatternType === 'ZERAR_FOLGAS'
                      ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-500'
                      : 'border-gray-200 dark:border-[#283042] hover:bg-gray-50 dark:hover:bg-[#1D2432]'
                  }`}>
                    <input
                      type="radio"
                      name="patternType"
                      checked={batchPatternType === 'ZERAR_FOLGAS'}
                      onChange={() => setBatchPatternType('ZERAR_FOLGAS')}
                      className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block text-xs">
                        🏖️ Zerar Escala (Todas Folgas - F)
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        Reseta todos os dias do período para <strong>F (Folga)</strong>.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* 3. SELEÇÃO DA LEGENDA DE SERVIÇO */}
              {batchPatternType !== 'ZERAR_FOLGAS' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-800 dark:text-gray-200">
                    3. Legenda a aplicar nos dias de trabalho
                  </label>
                  <select
                    value={batchDutyCode}
                    onChange={(e) => setBatchDutyCode(e.target.value)}
                    className="untitled-input font-bold"
                  >
                    {legends.map((leg) => (
                      <option key={leg.codigo} value={leg.codigo}>
                        {leg.codigo} — {leg.descricao} {leg.conta_como_servico ? '(Conta como Sv)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. PRÉVIA VISUAL DO PADRÃO PARA O MÊS */}
              <div className="bg-gray-50 dark:bg-[#0E121A] p-3 rounded-xl border border-gray-200 dark:border-[#222938] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                    Prévia do Calendário ({monthNames[mes - 1]}/{ano})
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Total previsto:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => calculateDayPattern(d, batchPatternType, batchDutyCode) !== 'F').length} serviços
                    </strong>
                  </span>
                </div>

                {/* Grade dos dias 1 a 31 da prévia */}
                <div className="overflow-x-auto pb-1">
                  <div className="flex gap-1 min-w-max">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dayCode = calculateDayPattern(day, batchPatternType, batchDutyCode);
                      const dayInfo = getDayOfWeekInfo(day);
                      const badgeClass = getBadgeForLegend(dayCode);

                      return (
                        <div
                          key={day}
                          className="flex flex-col items-center justify-center p-1 rounded-lg bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#283042] min-w-[28px]"
                        >
                          <span className="text-[9px] font-mono text-gray-400 font-bold">
                            {day.toString().padStart(2, '0')}
                          </span>
                          <span className={`text-[8px] uppercase font-extrabold ${dayInfo.isWeekend ? 'text-red-500' : 'text-gray-400'}`}>
                            {dayInfo.name}
                          </span>
                          <span className={`w-5 h-5 rounded text-[9px] font-mono flex items-center justify-center mt-0.5 ${badgeClass}`}>
                            {dayCode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Fixo */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2 bg-gray-50/50 dark:bg-[#0E121A]">
              <button
                type="button"
                onClick={() => setIsBatchPatternModalOpen(false)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyBatchPattern}
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aplicar Modelo na Escala</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 10: GESTÃO DE EQUIPES (CRUD - LISTAR, CRIAR, EDITAR, EXCLUIR) */}
      {/* ========================================================= */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Gerenciamento de Equipes Operacionais
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {teams.length} equipes cadastradas para o 2º Pelotão Salinas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddTeam}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Equipe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista / Tabela de Equipes */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <div className="border border-gray-200 dark:border-[#222938] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#0E121A] border-b border-gray-200 dark:border-[#222938] text-[11px] font-bold text-gray-500">
                      <th className="p-2.5 w-12 text-center">Nº</th>
                      <th className="p-2.5">Nome da Equipe</th>
                      <th className="p-2.5 w-36 text-center">Efetivo Alocado</th>
                      <th className="p-2.5 text-right w-24">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {teams.map((t, idx) => {
                      const countInEfetivo = sortedMilitaryList.filter(m => m.equipe === t).length;
                      return (
                        <tr key={t} className="hover:bg-gray-50/60 dark:hover:bg-[#1D2432]/40 transition-colors">
                          <td className="p-2.5 text-center font-mono font-bold text-gray-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-gray-900 dark:text-white">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                              {t}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              countInEfetivo > 0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {countInEfetivo} militar{countInEfetivo !== 1 ? 'es' : ''}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTeam(t)}
                                title="Editar nome da equipe"
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmTeam(t)}
                                title="Excluir equipe"
                                className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Fixo */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between bg-gray-50/50 dark:bg-[#0E121A]">
              <span className="text-[11px] text-gray-400">
                Você pode cadastrar, renomear ou remover equipes para alocar seus militares.
              </span>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="btn-secondary py-1.5 px-4 text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 11: CADASTRO / EDIÇÃO DE EQUIPE */}
      {/* ========================================================= */}
      {isEditTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                {editingTeamOldName ? `Editar Equipe ${editingTeamOldName}` : 'Nova Equipe Operacional'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditTeamModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome / Identificador da Equipe *
                </label>
                <input
                  type="text"
                  placeholder="Ex: ALFA 3, PATRULHA RURAL 3, CPU 2..."
                  value={teamFormName}
                  onChange={(e) => setTeamFormName(e.target.value)}
                  className="untitled-input font-bold uppercase"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTeamModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  {editingTeamOldName ? 'Salvar Alterações' : 'Criar Equipe'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 12: CONFIRMAÇÃO DE EXCLUSÃO DE EQUIPE */}
      {/* ========================================================= */}
      {deleteConfirmTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Equipe {deleteConfirmTeam}?
              </h3>
              <p className="text-gray-500">
                Tem certeza que deseja remover a equipe <strong>{deleteConfirmTeam}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTeam(null)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTeam(deleteConfirmTeam)}
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
