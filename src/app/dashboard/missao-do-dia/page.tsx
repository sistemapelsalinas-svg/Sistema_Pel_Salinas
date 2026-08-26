'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { DailyMissionData, UserProfile } from '@/lib/types';
import { 
  Compass, 
  Shield, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Calendar, 
  Users, 
  Flame, 
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';

export default function MissaoDoDiaPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [mission, setMission] = useState<DailyMissionData | null>(null);

  useEffect(() => {
    const users = storage.getUsers();
    setAllUsers(users);
    if (user) {
      setSelectedUserId(user.id);
      setMission(storage.getDailyMission(user));
    }
  }, [user]);

  const handleUserChange = (uId: string) => {
    setSelectedUserId(uId);
    const targetUser = allUsers.find(u => u.id === uId);
    if (targetUser) {
      setMission(storage.getDailyMission(targetUser));
    }
  };

  if (!mission || !user) return null;

  return (
    <div className="space-y-6">
      
      {/* Header Tático */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              DESPACHO OPERACIONAL
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão PM / Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
            <span>Minha Missão do Dia</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Direcionamento tático do policiamento ostensivo, metas do plantão e alertas prioritários.
          </p>
        </div>

        {/* Seletor de Militar (Para visualização do Comandante ou troca de turno) */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold hidden md:inline">Visualizar Militar:</span>
          <select
            value={selectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                {u.graduacao} {u.nome_guerra} ({u.numero_pm}) - {u.equipe_padrao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card de Status do Serviço do Militar */}
      <div className={`p-6 rounded-3xl border shadow-lg transition-all ${
        mission.deServicoHoje
          ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-gray-950 border-emerald-700/60 text-white shadow-emerald-950/40'
          : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 border-gray-800 text-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
              mission.deServicoHoje 
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Shield className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight">
                  {mission.militar.graduacao} {mission.militar.nome_guerra}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  PM {mission.militar.numero_pm}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Equipe: {mission.equipeHoje}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {mission.deServicoHoje ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    ESCALADO DE SERVIÇO HOJE (Legenda: {mission.legendaHoje}) — BOA MISSÃO!
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1.5 mt-1">
                    <Info className="w-4 h-4" />
                    Não escalado de serviço operacional no dia de hoje (Legenda: {mission.legendaHoje}).
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Contador de Ritmo */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-2xl font-black text-emerald-400">{mission.servicosRestantesMes}</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Serviços Restantes no Mês</span>
            </div>
            <div className="text-center px-3">
              <span className="text-2xl font-black text-amber-400">
                {mission.metasEquipe.reduce((acc, m) => acc + m.restantes, 0)}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Ops Restantes p/ Meta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Pendência Operacional do Último Serviço */}
      {mission.pendenciasUltimoServico.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700/60 flex items-start gap-3.5 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Aviso Operacional de Pendência
            </h4>
            {mission.pendenciasUltimoServico.map((p, idx) => (
              <p key={idx} className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Metas da Equipe para o Plantão & Alertas no Setor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Metas Operacionais da Equipe com Cálculo de Ritmo */}
        <div className="lg:col-span-2 tactical-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Metas Operacionais da Sua Equipe ({mission.equipeHoje.split(' ')[0]})
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">Mês Corrente</span>
          </div>

          <div className="space-y-3">
            {mission.metasEquipe.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhuma meta configurada para este mês.</p>
            ) : (
              mission.metasEquipe.map((item, idx) => {
                const percent = item.metaMensal > 0 ? Math.min(100, Math.round((item.executadas / item.metaMensal) * 100)) : 100;
                return (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-3 hover:border-slate-300 dark:hover:border-gray-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs">
                          {item.operacao.codigo_natureza}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.operacao.titulo}
                        </span>
                      </div>
                      
                      {item.operacao.link_google_drive && (
                        <a
                          href={item.operacao.link_google_drive}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>Diretriz Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {item.operacao.descricao}
                    </p>

                    {/* Barra de Progresso da Equipe */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Realizado: <strong className="text-slate-900 dark:text-white">{item.executadas}</strong> de <strong className="text-slate-900 dark:text-white">{item.metaMensal}</strong>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {percent}% Concluído
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Caixa de Ritmo do Plantão */}
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        ⚡ Faltam <strong>{item.restantes}</strong> operações para a meta do mês.
                      </span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        Ideal: {item.mediaNecessariaPorPlantao} op/plantão
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Alertas Prioritários no Setor (Para Atenção na Viatura) */}
        <div className="tactical-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Foco no Patrulhamento
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
              URGENTE
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ocorrências com elevado risco de homicídio em Salinas que exigem saturação e abordagem qualificada no turno:
          </p>

          <div className="space-y-3">
            {mission.alertasSetor.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-gray-800 rounded-xl text-center text-xs text-slate-500">
                Nenhum alerta crítico pendente no momento.
              </div>
            ) : (
              mission.alertasSetor.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <RiskBadge risk={alerta.grau_risco} />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{alerta.reds_numero}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {alerta.natureza_ocorrencia}
                  </p>

                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    📍 <strong>{alerta.bairro}:</strong> {alerta.endereco_completo}
                  </p>

                  <div className="pt-2 border-t border-red-200 dark:border-red-900/30 text-[11px] space-y-1">
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Autores:</strong> {alerta.autores}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Vítimas:</strong> {alerta.vitimas}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                      🛡️ <strong>Ação Recomendada:</strong> {alerta.acoes_preventivas_adotadas}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
