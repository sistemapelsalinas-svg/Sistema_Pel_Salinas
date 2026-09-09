'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { DailyMissionData, UserProfile, OperationGroup } from '@/lib/types';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Users, 
  Flame, 
  Sparkles,
  Printer,
  PlusCircle,
  Check,
  TrendingUp,
  FileText,
  Radio,
  UserCheck,
  MapPin
} from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';

export default function MissaoDoDiaPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [mission, setMission] = useState<DailyMissionData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<OperationGroup | 'TODAS'>('TODAS');

  useEffect(() => {
    const users = storage.getUsers();
    const teams = storage.getTeams();
    setAllUsers(users);
    setAllTeams(teams);
    if (user) {
      setSelectedUserId(user.id);
      const initialMission = storage.getDailyMission(user);
      setMission(initialMission);
      setSelectedTeam(initialMission.equipeHoje || '');
    }
  }, [user]);

  const handleUserChange = (uId: string) => {
    setSelectedUserId(uId);
    const targetUser = allUsers.find(u => u.id === uId);
    if (targetUser) {
      const newMission = storage.getDailyMission(targetUser);
      setMission(newMission);
      setSelectedTeam(newMission.equipeHoje || '');
    }
  };

  const handleTeamChange = (teamName: string) => {
    setSelectedTeam(teamName);
    const targetUser = allUsers.find(u => u.id === selectedUserId) || user;
    if (targetUser) {
      setMission(storage.getDailyMission(targetUser, new Date(), teamName));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mission || !user) return null;

  const isAdminOrSof = user.role === 'ADMIN' || user.role === 'SOF';

  // Formatador limpo de nome (evita duplicações como "3º Sgt Sgt...")
  const cleanMilitarName = (grad?: string, guerra?: string) => {
    if (!guerra) return '';
    const g = guerra.trim();
    if (grad && g.toLowerCase().startsWith(grad.toLowerCase())) return g;
    return `${grad || ''} ${g}`.trim();
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Filtragem das metas por grupo
  const filteredMetas = selectedGroup === 'TODAS'
    ? mission.metasEquipe
    : mission.metasEquipe.filter(m => m.operacao.grupo === selectedGroup);

  const groupCounts = {
    TODAS: mission.metasEquipe.length,
    POG: mission.metasEquipe.filter(m => m.operacao.grupo === 'POG').length,
    ORDENS_SERVICO: mission.metasEquipe.filter(m => m.operacao.grupo === 'ORDENS_SERVICO').length,
    INTERACOES_COMUNITARIAS: mission.metasEquipe.filter(m => m.operacao.grupo === 'INTERACOES_COMUNITARIAS').length,
    PROXIMIDADE: mission.metasEquipe.filter(m => m.operacao.grupo === 'PROXIMIDADE').length,
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto print:p-0 print:m-0 print:max-w-none">
      
      {/* ========================================================= */}
      {/* 1. BARRA SUPERIOR DE AÇÕES E CONSULTA (ADMIN / SOF) */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151A23] p-3.5 rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs print:hidden">
        
        {/* Identificação de Data do Briefing */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider block">
              Briefing Operacional Diário
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {mission.diaSemana}, {mission.dia} de {monthNames[mission.mes - 1]} de {mission.ano}
            </span>
          </div>
        </div>

        {/* Controles de Ação e Seletor de Militar e Equipe */}
        <div className="flex items-center flex-wrap gap-2">
          {isAdminOrSof && (
            <>
              {/* Seletor de Equipe */}
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0E121A] px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-[#283042] text-xs">
                <span className="text-gray-500 font-medium">Equipe:</span>
                <select
                  value={selectedTeam}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Todas as Equipes (Geral da Fração)
                  </option>
                  {allTeams.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Equipe {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seletor de Militar */}
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0E121A] px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-[#283042] text-xs">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 font-medium">Militar:</span>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {cleanMilitarName(u.graduacao, u.nome_guerra)} (PM {u.numero_pm})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            title="Imprimir Briefing da Guarnição para a viatura"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Imprimir Briefing</span>
          </button>

          <Link
            href={`/dashboard/operacoes/lancamento?equipe=${encodeURIComponent(mission.equipeHoje)}`}
            className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lançar Operação</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CARTÃO PRINCIPAL: STATUS DO POLICIAL E GUARNIÇÃO DO DIA */}
      {/* ========================================================= */}
      <div className={`untitled-card p-5 border-l-4 transition-all ${
        mission.deServicoHoje
          ? 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-[#151A23] dark:to-[#151A23]'
          : 'border-l-gray-400 bg-gradient-to-r from-gray-50/60 via-white to-white dark:from-[#1D2432]/30 dark:via-[#151A23] dark:to-[#151A23]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Identificação do Militar */}
          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                mission.deServicoHoje
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${mission.deServicoHoje ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                {mission.deServicoHoje ? `DE SERVIÇO (${mission.legendaHoje} · ${mission.legendaDescricao})` : `FOLGA / DISPENSA (${mission.legendaHoje} · ${mission.legendaDescricao})`}
              </span>

              {mission.militar.role === 'ADMIN' && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-extrabold flex items-center gap-1">
                  Administrador Geral do Sistema
                </span>
              )}

              {mission.equipeHoje ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-extrabold">
                  Equipe: {mission.equipeHoje}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 text-xs font-bold">
                  Visão Geral da Fração (Todas as Equipes)
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {cleanMilitarName(mission.militar.graduacao, mission.militar.nome_guerra)}
              </h2>
              <span className="font-mono text-sm font-semibold text-gray-500 dark:text-gray-400">
                Nº PM: {mission.militar.numero_pm}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mission.plantaoAtualIndex > 0 ? (
                <span>
                  <strong>{mission.plantaoAtualIndex}º serviço</strong> de um total de <strong>{mission.totalPlantaoMes} plantões</strong> previstos na escala de {monthNames[mission.mes - 1]}/{mission.ano} · Restam <strong>{mission.servicosRestantesMes} serviços</strong> no mês.
                </span>
              ) : (
                <span>Sem serviços operacionais cumpridos até esta data no mês de {monthNames[mission.mes - 1]}/{mission.ano}.</span>
              )}
            </p>
          </div>

          {/* Guarnição de Serviço do Dia (Companheiros de Turno) */}
          <div className="bg-white/80 dark:bg-[#0E121A]/80 p-3.5 rounded-xl border border-gray-200 dark:border-[#283042] min-w-[280px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Guarnição de Serviço ({mission.guarnicaoHoje.length} policiais)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {mission.equipeHoje || 'Geral'}
              </span>
            </div>

            {mission.guarnicaoHoje.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">
                Nenhum outro policial escalado nesta equipe para a data de hoje.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {mission.guarnicaoHoje.map((m) => (
                  <span
                    key={m.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                      m.isCurrentUser
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-[#151A23] dark:text-gray-200 dark:border-[#283042]'
                    }`}
                  >
                    <span>{m.militar_nome}</span>
                    <span className="font-mono text-[10px] text-gray-400">({m.militar_numero_pm})</span>
                    {m.isCurrentUser && <span className="text-[9px] font-bold text-emerald-600">(Você)</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. RESUMO EXECUTIVO DAS METAS DA EQUIPE (4 CARDS DE KPI) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Total da Meta da Equipe */}
        <div className="untitled-card p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Meta Mensal Equipe
            </span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {mission.totalMetasEquipe} <span className="text-xs font-medium text-gray-400">operações</span>
          </div>
          <span className="text-[11px] text-gray-500 block">
            Distribuídas para {mission.equipeHoje || 'sua equipe'}
          </span>
        </div>

        {/* Card 2: Realizadas no Mês */}
        <div className="untitled-card p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Realizadas no Mês
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {mission.totalRealizadasEquipe} <span className="text-xs font-medium text-gray-400">executadas</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            {mission.percentualGeralEquipe}% da meta global atingida
          </span>
        </div>

        {/* Card 3: Faltam para Bater a Meta */}
        <div className="untitled-card p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Faltam para Meta
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {mission.totalRestantesEquipe} <span className="text-xs font-medium text-gray-400">restantes</span>
          </div>
          <span className="text-[11px] text-gray-500 block">
            Saldo a cumprir até o fim do mês
          </span>
        </div>

        {/* Card 4: Ritmo / Meta Sugerida para o Plantão de Hoje */}
        <div className="untitled-card p-3.5 space-y-1 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-[#151A23] border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Cota Recomendada Hoje
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {mission.deServicoHoje 
              ? `${mission.metasEquipe.reduce((acc, m) => acc + m.sugestaoHoje, 0)} ops`
              : '0 ops'
            }
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
            {mission.deServicoHoje 
              ? `Ritmo ideal para os ${mission.servicosRestantesMes} plantões restantes`
              : 'Militar em período de folga/dispensa'
            }
          </span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. AVISOS OPERACIONAIS E PENDÊNCIAS DE ORDENS DE SERVIÇO */}
      {/* ========================================================= */}
      {mission.pendenciasUltimoServico.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
              Diretrizes Prioritárias do Turno
            </h4>
            {mission.pendenciasUltimoServico.map((p, idx) => (
              <p key={idx} className="font-medium text-amber-900 dark:text-amber-100 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DOSSIER DETALHADO: O QUE A EQUIPE DEVE EXECUTAR */}
      {/* ========================================================= */}
      <div className="space-y-3">
        
        {/* Header do Dossier com Filtro de Categorias */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-200 dark:border-[#222938]">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Dossier de Operações da Equipe ({mission.equipeHoje || 'Geral'})</span>
            </h3>
            <p className="text-xs text-gray-500">
              Instruções detalhadas de cada operação, cota mensal, total executado e sugestão para este plantão.
            </p>
          </div>

          {/* Filtro de Grupos */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 print:hidden">
            <button
              type="button"
              onClick={() => setSelectedGroup('TODAS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGroup === 'TODAS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Todas ({groupCounts.TODAS})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('POG')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGroup === 'POG'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              POG ({groupCounts.POG})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('ORDENS_SERVICO')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGroup === 'ORDENS_SERVICO'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              OS ({groupCounts.ORDENS_SERVICO})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('INTERACOES_COMUNITARIAS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGroup === 'INTERACOES_COMUNITARIAS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Comunitárias ({groupCounts.INTERACOES_COMUNITARIAS})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('PROXIMIDADE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGroup === 'PROXIMIDADE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Proximidade ({groupCounts.PROXIMIDADE})
            </button>
          </div>
        </div>

        {/* Lista de Cartões de Metas da Equipe */}
        {filteredMetas.length === 0 ? (
          <div className="untitled-card p-8 text-center space-y-2">
            <Target className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              Nenhuma meta atribuída neste grupo para a equipe {mission.equipeHoje || ''}
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Utilize o módulo de <strong>Operações &gt; Metas</strong> para cadastrar e distribuir as cotas de operações para as equipes no mês.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMetas.map((item, idx) => {
              const op = item.operacao;

              return (
                <div 
                  key={idx}
                  className="untitled-card p-4 space-y-3 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all border border-gray-200 dark:border-[#222938]"
                >
                  {/* Topo do Card: Código, Grupo e Status da Meta */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#0E121A] text-gray-900 dark:text-white border border-gray-200 dark:border-[#283042]">
                            {op.codigo_natureza}
                          </span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            op.grupo === 'POG' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                            op.grupo === 'ORDENS_SERVICO' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                            op.grupo === 'INTERACOES_COMUNITARIAS' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {op.grupo === 'ORDENS_SERVICO' ? 'Ordem de Serviço' :
                             op.grupo === 'INTERACOES_COMUNITARIAS' ? 'Interação Comunitária' :
                             op.grupo === 'PROXIMIDADE' ? 'Proximidade' : 'POG'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 dark:text-white pt-1">
                          {op.titulo}
                        </h4>
                      </div>

                      {/* Badge de Status da Meta */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap ${
                        item.statusMeta === 'ATINGIDA' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300' :
                        item.statusMeta === 'NO_RITMO' ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200' :
                        item.statusMeta === 'ATENCAO' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200' :
                        'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                      }`}>
                        {item.statusMeta === 'ATINGIDA' ? '✓ Cota 100%' :
                         item.statusMeta === 'NO_RITMO' ? 'No Ritmo' :
                         item.statusMeta === 'ATENCAO' ? 'Acelerar Cota' : 'Meta Crítica'}
                      </span>
                    </div>

                    {/* Descrição e Regras Operacionais */}
                    {op.descricao && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {op.descricao}
                      </p>
                    )}

                    {/* Tags de Regras Especiais */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                      {op.requer_reds_origem && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 font-semibold">
                          ⚠️ Exige REDS Origem
                        </span>
                      )}
                      {op.area_rural_obrigatoria && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 font-semibold">
                          🚜 Área Rural
                        </span>
                      )}
                      {op.min_envolvidos && op.min_envolvidos > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 font-semibold">
                          👥 Mín. {op.min_envolvidos} envolvidos
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Números da Meta & Barra de Progresso */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#222938]">
                    
                    {/* Barra de Progresso */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-600 dark:text-gray-400">
                          Realizado: <strong className="text-gray-900 dark:text-white">{item.executadas}</strong> de <strong className="text-gray-900 dark:text-white">{item.metaMensal} ops</strong>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {item.percentual}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            item.percentual >= 100 ? 'bg-emerald-500' :
                            item.percentual >= 60 ? 'bg-blue-500' :
                            item.percentual >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, item.percentual)}%` }}
                        />
                      </div>
                    </div>

                    {/* Bloco de Ritmo do Plantão & Ação */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#283042] text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-gray-500 block">
                          Faltam <strong>{item.restantes} ops</strong> no mês
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px] block">
                          🎯 Meta sugerida hoje: <strong>{item.sugestaoHoje} op(s)</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {op.link_google_drive && (
                          <a
                            href={op.link_google_drive}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Abrir Diretriz / Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          href={`/dashboard/operacoes/lancamento?opId=${op.id}&equipe=${encodeURIComponent(mission.equipeHoje)}`}
                          className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Lançar</span>
                        </Link>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. ALERTAS DE HOMICÍDIO & PONTOS CRÍTICOS DO SETOR */}
      {/* ========================================================= */}
      <div className="untitled-card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#222938]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Pontos de Atenção & Alertas de Homicídio no Setor
              </h3>
              <p className="text-xs text-gray-500">
                Ocorrências com potencial de evolução violenta para patrulhamento qualificado durante o turno.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 text-xs font-bold">
            {mission.alertasSetor.length} ativos
          </span>
        </div>

        {mission.alertasSetor.length === 0 ? (
          <div className="p-6 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938]">
            <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Nenhum alerta crítico ativo no momento.
            </p>
            <p className="text-[11px] text-gray-500">
              Manter patrulhamento preventivo e visibilidade nas zonas quentes habituais.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mission.alertasSetor.map((alerta) => (
              <div 
                key={alerta.id}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-[#222938] bg-gray-50/50 dark:bg-[#0E121A]/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <RiskBadge risk={alerta.grau_risco} />
                  <span className="font-mono text-gray-500 font-bold text-[11px]">REDS: {alerta.reds_numero}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>{alerta.bairro} — {alerta.endereco_completo || 'Salinas/MG'}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                    <strong>Cenário:</strong> {alerta.avaliacao_cenario || alerta.natureza_ocorrencia}
                  </p>

                  {alerta.acoes_preventivas_adotadas && (
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px] leading-relaxed pt-0.5">
                      <strong>Ação Recomendada:</strong> {alerta.acoes_preventivas_adotadas}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
