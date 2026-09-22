'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { 
  DailyMissionData, 
  UserProfile, 
  OperationGroupDef, 
  EgressoFiscalizacao, 
  ShiftNotice 
} from '@/lib/types';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Users, 
  Flame, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Shield, 
  FileText, 
  PlusCircle, 
  Printer, 
  Check, 
  Radio, 
  TrendingUp, 
  Zap, 
  UserCheck,
  Bell,
  X,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
  CheckCheck
} from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MissaoDoDiaPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [operationGroups, setOperationGroups] = useState<OperationGroupDef[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [mission, setMission] = useState<DailyMissionData | null>(null);
  
  // 3 Grupos de Missão: 'OPERACOES' | 'ALERTAS_HOMICIDIO' | 'EGRESSOS'
  const [activeTab, setActiveTab] = useState<'OPERACOES' | 'ALERTAS_HOMICIDIO' | 'EGRESSOS'>('OPERACOES');

  // Filtro interno para Operações (Todos os grupos ou grupo específico)
  const [selectedOpGroup, setSelectedOpGroup] = useState<string>('TODAS');

  // Modais
  const [selectedEgresso, setSelectedEgresso] = useState<EgressoFiscalizacao | null>(null);
  const [selectedNoticeToRead, setSelectedNoticeToRead] = useState<ShiftNotice | null>(null);
  const [fiscalizacaoRelato, setFiscalizacaoRelato] = useState<string>('');
  const [fiscalizacaoResultado, setFiscalizacaoResultado] = useState<'CONFORME' | 'DESCUMPRIMENTO'>('CONFORME');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const users = storage.getUsers();
    const teams = storage.getTeams();
    const grps = storage.getOperationGroups();
    setAllUsers(users);
    setAllTeams(teams);
    setOperationGroups(grps);
    if (user) {
      setSelectedUserId(user.id);
      loadMissionData(user);
    }
  }, [user]);

  const loadMissionData = (targetUser: UserProfile, teamName?: string) => {
    const data = storage.getDailyMission(targetUser, new Date(), teamName);
    setMission(data);
    setSelectedTeam(data.equipeHoje || '');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUserChange = (uId: string) => {
    setSelectedUserId(uId);
    const targetUser = allUsers.find(u => u.id === uId);
    if (targetUser) {
      loadMissionData(targetUser);
    }
  };

  const handleTeamChange = (teamName: string) => {
    setSelectedTeam(teamName);
    const targetUser = allUsers.find(u => u.id === selectedUserId) || user;
    if (targetUser) {
      loadMissionData(targetUser, teamName);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Confirmação de Leitura de Recado
  const handleConfirmNoticeRead = (noticeId: string) => {
    if (!user) return;
    storage.confirmShiftNoticeRead(noticeId, user, mission?.equipeHoje);
    const targetUser = allUsers.find(u => u.id === selectedUserId) || user;
    loadMissionData(targetUser, selectedTeam);
    setSelectedNoticeToRead(null);
    showToast('Leitura e ciência do recado confirmadas com sucesso.');
  };

  // Registro de Fiscalização de Egresso
  const handleSaveFiscalizacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEgresso || !user) return;

    storage.registerEgressoFiscalizacao(
      selectedEgresso.id,
      fiscalizacaoResultado,
      fiscalizacaoRelato.trim(),
      user,
      mission?.equipeHoje || 'Geral'
    );

    const targetUser = allUsers.find(u => u.id === selectedUserId) || user;
    loadMissionData(targetUser, selectedTeam);
    setSelectedEgresso(null);
    setFiscalizacaoRelato('');
    showToast(`Fiscalização de ${selectedEgresso.nome_completo} registrada com sucesso.`);
  };

  if (!mission || !user) return null;

  const isAdminOrSof = user.role === 'ADMIN' || user.role === 'SOF';

  // Formatador limpo de nome
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

  // Egressos
  const egressos = mission.egressosSetor || [];
  const totalEgressos = egressos.length;
  const totalVisitasRealizadas = egressos.reduce((acc, e) => acc + (e.visitas_realizadas_mes || 0), 0);
  const totalVisitasPrevistas = egressos.reduce((acc, e) => acc + (e.visitas_meta_mes || 0), 0);

  // Alertas
  const alertas = mission.alertasSetor || [];

  // Metas filtradas por subgrupo (caso usuário filtre)
  const filteredMetas = selectedOpGroup === 'TODAS'
    ? mission.metasEquipe
    : mission.metasEquipe.filter(m => m.operacao.grupo === selectedOpGroup);

  const totalSugestaoHoje = mission.deServicoHoje 
    ? mission.metasEquipe.reduce((acc, m) => acc + (m.sugestaoHoje || 0), 0)
    : 0;

  // Recados do turno
  const recados = mission.recadosAtivos || [];
  const userPmClean = (user.numero_pm || '').replace(/\D/g, '');

  return (
    <div className="space-y-5 max-w-6xl mx-auto print:p-0 print:m-0 print:max-w-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SEÇÃO DE RECADOS / ORIENTAÇÕES DO TURNO (DESTAQUE LIMPO) */}
      {/* ========================================================= */}
      {recados.length > 0 && (
        <div className="space-y-2.5 print:hidden">
          {recados.map((recado) => {
            const hasRead = recado.leituras_confirmadas?.some(
              l => l.usuario_id === user.id || (userPmClean && (l.numero_pm || '').replace(/\D/g, '') === userPmClean)
            );

            return (
              <div 
                key={recado.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                  hasRead
                    ? 'bg-gray-50/80 dark:bg-[#151A23] border-gray-200 dark:border-[#222938]'
                    : recado.prioridade === 'URGENTE'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 animate-in fade-in'
                    : recado.prioridade === 'IMPORTANTE'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 animate-in fade-in'
                    : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 animate-in fade-in'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    hasRead
                      ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      : recado.prioridade === 'URGENTE'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : recado.prioridade === 'IMPORTANTE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-md bg-white/80 dark:bg-black/30 border border-current">
                        {recado.prioridade}
                      </span>
                      <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {recado.titulo}
                      </span>
                      {hasRead ? (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.2 rounded-full border border-emerald-300">
                          ✓ Ciência Confirmada
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.2 rounded-full border border-rose-300">
                          Pendente de Leitura
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {recado.mensagem}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedNoticeToRead(recado)}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      hasRead
                        ? 'bg-white dark:bg-[#1F242F] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                    }`}
                  >
                    {hasRead ? <Eye className="w-3.5 h-3.5" /> : <CheckCheck className="w-3.5 h-3.5" />}
                    <span>{hasRead ? 'Visualizar Recado' : 'Ler e Confirmar Ciência'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CABEÇALHO LIMPO: STATUS DO POLICIAL & GUARNIÇÃO */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#151A23] p-4 rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs space-y-3">
        
        {/* Linha Superior: Data, Status e Controles Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-[#222938]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider block">
                Minha Missão do Turno
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {mission.diaSemana}, {mission.dia} de {monthNames[mission.mes - 1]} de {mission.ano}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap print:hidden">
            {isAdminOrSof && (
              <>
                {/* Seletor de Equipe */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0E121A] px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-[#283042] text-xs">
                  <span className="text-gray-400 font-medium">Equipe:</span>
                  <select
                    value={selectedTeam}
                    onChange={(e) => handleTeamChange(e.target.value)}
                    className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Geral da Fração
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
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleUserChange(e.target.value)}
                    className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                        {cleanMilitarName(u.graduacao, u.nome_guerra)} ({u.numero_pm})
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
              title="Imprimir Briefing"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Linha Inferior: Militar, Status de Escala e Guarnição */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
              mission.deServicoHoje
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${mission.deServicoHoje ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {mission.deServicoHoje ? `DE SERVIÇO (${mission.legendaHoje} · ${mission.legendaDescricao})` : `FOLGA (${mission.legendaHoje})`}
            </span>

            <span className="font-bold text-gray-900 dark:text-white">
              {cleanMilitarName(mission.militar.graduacao, mission.militar.nome_guerra)}
            </span>
            <span className="font-mono text-gray-400">({mission.militar.numero_pm})</span>

            <span className="px-2 py-0.2 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200">
              {mission.equipeHoje ? `Equipe ${mission.equipeHoje}` : 'Geral da Fração'}
            </span>

            {mission.plantaoAtualIndex > 0 && (
              <span className="text-[11px] text-gray-400">
                • {mission.plantaoAtualIndex}º de {mission.totalPlantaoMes} plantões no mês
              </span>
            )}
          </div>

          {/* Guarnição de Serviço */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-400 font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Guarnição:
            </span>
            {mission.guarnicaoHoje.length === 0 ? (
              <span className="text-gray-400 italic">Sem outros policiais escalados</span>
            ) : (
              mission.guarnicaoHoje.map((m) => (
                <span
                  key={m.id}
                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${
                    m.isCurrentUser
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-[#0E121A] dark:text-gray-300 dark:border-[#283042]'
                  }`}
                >
                  {m.militar_nome}
                </span>
              ))
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. SELETOR VISUAL DOS 3 GRUPOS PRINCIPAIS (LIMPO & COESO) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        
        {/* Grupo 1: Operações e Metas */}
        <button
          type="button"
          onClick={() => setActiveTab('OPERACOES')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 cursor-pointer ${
            activeTab === 'OPERACOES'
              ? 'bg-white dark:bg-[#151A23] border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white/80 dark:bg-[#151A23]/80 border-gray-200 dark:border-[#222938] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'OPERACOES' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
              }`}>
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Operações & Metas
                </h3>
                <span className="text-[11px] text-gray-400">
                  {mission.metasEquipe.length} cadastradas
                </span>
              </div>
            </div>

            <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              {totalSugestaoHoje} <span className="text-xs font-medium text-gray-400">hoje</span>
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="w-full bg-gray-100 dark:bg-[#1E2636] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, mission.percentualGeralEquipe)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>{mission.totalRealizadasEquipe} de {mission.totalMetasEquipe} ops</span>
              <span className="font-bold text-blue-600">{mission.percentualGeralEquipe}% concluído</span>
            </div>
          </div>
        </button>

        {/* Grupo 2: Alertas de Homicídios */}
        <button
          type="button"
          onClick={() => setActiveTab('ALERTAS_HOMICIDIO')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 cursor-pointer ${
            activeTab === 'ALERTAS_HOMICIDIO'
              ? 'bg-white dark:bg-[#151A23] border-rose-500 ring-2 ring-rose-500/20 shadow-md'
              : 'bg-white/80 dark:bg-[#151A23]/80 border-gray-200 dark:border-[#222938] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'ALERTAS_HOMICIDIO' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
              }`}>
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Alertas de Homicídios
                </h3>
                <span className="text-[11px] text-gray-400">
                  Pontos críticos no setor
                </span>
              </div>
            </div>

            <span className={`text-xl font-black font-mono ${alertas.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
              {alertas.length} <span className="text-xs font-medium text-gray-400">ativos</span>
            </span>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">
              {alertas.length === 0 ? 'Sem ocorrências críticas ativas' : `${alertas.filter(a => a.grau_risco === 'CRITICO').length} risco crítico`}
            </span>
            <span className="font-bold text-rose-600 flex items-center gap-0.5">
              <span>Ver detalhes</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* Grupo 3: Visitas a Egressos */}
        <button
          type="button"
          onClick={() => setActiveTab('EGRESSOS')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 cursor-pointer ${
            activeTab === 'EGRESSOS'
              ? 'bg-white dark:bg-[#151A23] border-purple-500 ring-2 ring-purple-500/20 shadow-md'
              : 'bg-white/80 dark:bg-[#151A23]/80 border-gray-200 dark:border-[#222938] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'EGRESSOS' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
              }`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Visitas a Egressos
                </h3>
                <span className="text-[11px] text-gray-400">
                  Fiscalização cautelar
                </span>
              </div>
            </div>

            <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
              {totalEgressos} <span className="text-xs font-medium text-gray-400">apenados</span>
            </span>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">
              {totalVisitasRealizadas} de {totalVisitasPrevistas} visitas no mês
            </span>
            <span className="font-bold text-purple-600 flex items-center gap-0.5">
              <span>Ver lista</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

      </div>

      {/* ========================================================= */}
      {/* 4. CONTEÚDO DETALHADO DO GRUPO SELECIONADO (LISTA/TABELA) */}
      {/* ========================================================= */}

      {/* --------------------------------------------------------- */}
      {/* TAB 1: OPERAÇÕES & METAS (TABELA / LISTA LIMPA) */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'OPERACOES' && (
        <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#222938]">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Metas e Operações do Turno ({mission.equipeHoje || 'Geral'})</span>
              </h3>
              <p className="text-xs text-gray-500">
                Lista de operações previstas para a equipe, cotas sugeridas para hoje e atalho de lançamento.
              </p>
            </div>

            {/* Filtro rápido de Grupos de Operação */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedOpGroup('TODAS')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedOpGroup === 'TODAS'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                Todas ({mission.metasEquipe.length})
              </button>

              {operationGroups.map((grp) => {
                const count = mission.metasEquipe.filter(m => m.operacao.grupo === grp.id).length;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSelectedOpGroup(grp.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedOpGroup === grp.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {grp.nome} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {filteredMetas.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Nenhuma meta cadastrada para este grupo na equipe {mission.equipeHoje || ''}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#283042] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Operação / Natureza</th>
                    <th className="py-2.5 px-3 text-center">Meta Mês</th>
                    <th className="py-2.5 px-3 text-center">Realizado</th>
                    <th className="py-2.5 px-3 text-center">Saldo</th>
                    <th className="py-2.5 px-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                      Sugerido Hoje
                    </th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#222938]">
                  {filteredMetas.map((item, idx) => {
                    const op = item.operacao;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-[#1D2432]/50 transition-colors">
                        
                        {/* Código */}
                        <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {op.codigo_natureza}
                        </td>

                        {/* Operação */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {op.titulo}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-400">
                              {op.grupo}
                            </span>
                            {op.link_google_drive && (
                              <a
                                href={op.link_google_drive}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                                title="Abrir Diretriz"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>Diretriz</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Meta Mês */}
                        <td className="py-3 px-3 text-center font-bold text-gray-700 dark:text-gray-300">
                          {item.metaMensal}
                        </td>

                        {/* Realizado */}
                        <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {item.executadas}
                        </td>

                        {/* Saldo */}
                        <td className="py-3 px-3 text-center font-bold text-gray-500">
                          {item.restantes}
                        </td>

                        {/* Sugerido Hoje */}
                        <td className="py-3 px-3 text-center font-black text-sm text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/10">
                          {item.sugestaoHoje}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                            item.statusMeta === 'ATINGIDA'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : item.statusMeta === 'NO_RITMO'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                              : item.statusMeta === 'ATENCAO'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}>
                            {item.statusMeta === 'ATINGIDA' ? '✓ 100%' : item.statusMeta === 'NO_RITMO' ? 'No Ritmo' : item.statusMeta === 'ATENCAO' ? 'Acelerar' : 'Crítica'}
                          </span>
                        </td>

                        {/* Ação */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            href={`/dashboard/operacoes/lancamento?opId=${op.id}&equipe=${encodeURIComponent(mission.equipeHoje)}`}
                            className="inline-flex items-center gap-1 btn-primary py-1 px-2.5 text-xs font-bold"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Lançar</span>
                          </Link>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: ALERTAS DE HOMICÍDIOS (LISTA LIMPA) */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'ALERTAS_HOMICIDIO' && (
        <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs space-y-3 p-4 sm:p-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#222938]">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Pontos de Atenção & Alertas de Homicídio no Setor</span>
              </h3>
              <p className="text-xs text-gray-500">
                Ocorrências de alta gravidade com potencial de evolução para policiamento qualificado no turno.
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 text-xs font-bold">
              {alertas.length} ativos
            </span>
          </div>

          {alertas.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#283042] space-y-1">
              <Check className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-bold text-xs text-gray-800 dark:text-gray-200">
                Nenhum alerta crítico ativo no setor no momento.
              </p>
              <p className="text-[11px] text-gray-400">
                Manter o patrulhamento preventivo e visibilidade nas zonas de calor habituais.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#222938]">
              {alertas.map((alerta) => (
                <div key={alerta.id} className="py-3.5 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RiskBadge risk={alerta.grau_risco} />
                      <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">
                        REDS: {alerta.reds_numero}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        • {alerta.natureza_ocorrencia}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{alerta.bairro} — {alerta.endereco_completo || 'Salinas/MG'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-gray-50/70 dark:bg-[#0E121A]/60 p-3 rounded-xl border border-gray-200/60 dark:border-[#283042]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Cenário / Envolvidos:</span>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-[11px]">
                        {alerta.avaliacao_cenario || 'Conflito interpessoal com risco de retaliação armada.'}
                      </p>
                      <div className="text-[10px] text-gray-400 pt-0.5">
                        <span>Autores: <strong>{alerta.autores || 'A apurar'}</strong></span> • <span>Vítimas: <strong>{alerta.vitimas || 'A apurar'}</strong></span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Ação Preventiva Recomendada:</span>
                      <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed text-[11px] font-medium">
                        {alerta.acoes_preventivas_adotadas || 'Patrulhamento qualificado com abordagens sistemáticas e parada base no local.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: VISITAS A EGRESSOS (LISTA LIMPA & MODAL) */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'EGRESSOS' && (
        <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs space-y-3 p-4 sm:p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#222938]">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Fiscalização e Visitas a Egressos do Sistema Prisional</span>
              </h3>
              <p className="text-xs text-gray-500">
                Apenados sob cautelares no setor. Clique no nome para abrir a ficha completa e registrar a fiscalização.
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 text-xs font-bold">
              {totalVisitasRealizadas} de {totalVisitasPrevistas} visitas concluídas
            </span>
          </div>

          {egressos.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Nenhum egresso cadastrado no setor.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#222938]">
              {egressos.map((egresso) => (
                <div 
                  key={egresso.id}
                  onClick={() => setSelectedEgresso(egresso)}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-purple-50/30 dark:hover:bg-purple-950/10 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {egresso.nome_completo.charAt(0)}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {egresso.nome_completo}
                        </span>
                        {egresso.alcunha && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            ("{egresso.alcunha}")
                          </span>
                        )}
                        <span className="px-2 py-0.2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold">
                          {egresso.beneficio === 'PRISAO_DOMICILIAR' ? 'Prisão Domiciliar' :
                           egresso.beneficio === 'LIVRAMENTO_CONDICIONAL' ? 'Livramento Condicional' :
                           egresso.beneficio === 'MONITORAMENTO_ELETRONICO' ? 'Tornozeleira' : 'Medida Cautelar'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {egresso.bairro} • Recolhimento: {egresso.horario_recolhimento || '20h às 06h'}
                      </span>
                    </div>
                  </div>

                  {/* Quantidade de Visitas Realizadas / A Fazer na Frente */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-xs text-gray-900 dark:text-white">
                        <span className="text-emerald-600 dark:text-emerald-400">{egresso.visitas_realizadas_mes}</span>
                        <span className="text-gray-400"> / {egresso.visitas_meta_mes}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        visitas no mês
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FICHA DETALHADA DO EGRESSO & REGISTRO DE VISITA */}
      {/* ========================================================= */}
      {selectedEgresso && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200 dark:border-[#283042] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#222938]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Ficha de Fiscalização do Egresso
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Processo: {selectedEgresso.numero_processo || '0014523-88.2023.8.13.0570'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEgresso(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações Principais */}
            <div className="space-y-3 text-xs">
              
              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {selectedEgresso.nome_completo}
                  </h4>
                  {selectedEgresso.alcunha && (
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      Vulgo: "{selectedEgresso.alcunha}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-600 dark:text-gray-300 pt-1">
                  <span>Crime/Artigo: <strong>{selectedEgresso.artigo_crime || 'Art. 33 (Tráfico de Drogas)'}</strong></span>
                  <span>•</span>
                  <span>Benefício: <strong>{selectedEgresso.beneficio}</strong></span>
                </div>
              </div>

              {/* Endereço e Horário */}
              <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{selectedEgresso.endereco_completo}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Horário Obrigatório de Recolhimento: <strong>{selectedEgresso.horario_recolhimento || '20:00 às 06:00'}</strong></span>
                </div>
              </div>

              {/* Regras e Condições Judiciais */}
              <div className="space-y-1">
                <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-[10px] block">
                  Regras e Condições Impostas pelo Juízo:
                </span>
                <ul className="space-y-1 list-disc pl-4 text-gray-600 dark:text-gray-400 text-[11px]">
                  {selectedEgresso.regras_condicoes?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Última Fiscalização */}
              {selectedEgresso.ultima_fiscalizacao && (
                <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-0.5">
                  <span className="font-bold block">Última Fiscalização Realizada:</span>
                  <span>{selectedEgresso.ultima_fiscalizacao.data_hora} por {selectedEgresso.ultima_fiscalizacao.militar_nome} ({selectedEgresso.ultima_fiscalizacao.equipe}) — {selectedEgresso.ultima_fiscalizacao.resultado}</span>
                </div>
              )}

              {/* Formulário de Registro de Nova Fiscalização */}
              <form onSubmit={handleSaveFiscalizacao} className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-[#222938]">
                <span className="font-bold text-gray-900 dark:text-white uppercase text-[11px] block">
                  Registrar Fiscalização no Turno de Hoje:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFiscalizacaoResultado('CONFORME')}
                    className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                      fiscalizacaoResultado === 'CONFORME'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-[#0E121A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#283042]'
                    }`}
                  >
                    ✓ Em Conformidade
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiscalizacaoResultado('DESCUMPRIMENTO')}
                    className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                      fiscalizacaoResultado === 'DESCUMPRIMENTO'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-[#0E121A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#283042]'
                    }`}
                  >
                    ⚠️ Descumprimento
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Relato sucinto (ex: Encontrado no domicílio, em repouso)..."
                  value={fiscalizacaoRelato}
                  onChange={(e) => setFiscalizacaoRelato(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEgresso(null)}
                    className="btn-secondary py-1.5 px-3 text-xs font-bold"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Fiscalização (+1 Visita)</span>
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LEITURA COMPLETA DO RECADO DO TURNO */}
      {/* ========================================================= */}
      {selectedNoticeToRead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200 dark:border-[#283042] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#222938]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Comunicado / Orientação do Turno
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeToRead(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300">
                  {selectedNoticeToRead.prioridade}
                </span>
                <span className="text-gray-400">
                  Emitido em {format(new Date(selectedNoticeToRead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} por <strong>{selectedNoticeToRead.created_by_nome}</strong>
                </span>
              </div>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {selectedNoticeToRead.titulo}
              </h4>

              <div className="p-4 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 text-xs">
                {selectedNoticeToRead.mensagem}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                Ao clicar no botão abaixo, sua ciência e leitura serão registradas no sistema para controle e conferência dos Oficiais e da Seção de Emprego Operacional (SOF).
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#222938]">
              <button
                type="button"
                onClick={() => setSelectedNoticeToRead(null)}
                className="btn-secondary py-2 px-4 text-xs font-bold"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmNoticeRead(selectedNoticeToRead.id)}
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Confirmar Leitura / Estou Ciente</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
