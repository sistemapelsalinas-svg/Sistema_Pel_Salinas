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
  CheckCircle, 
  ExternalLink, 
  Calendar, 
  Users, 
  Flame, 
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Despacho Operacional
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Compass className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Minha Missão do Dia</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Direcionamento tático do policiamento ostensivo, metas do plantão e alertas prioritários para o turno.
          </p>
        </div>

        {/* User Switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#161B26] p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium hidden md:inline">Militar:</span>
          <select
            value={selectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                {u.graduacao} {u.nome_guerra} ({u.numero_pm}) — {u.equipe_padrao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Status Card (Untitled UI Style) */}
      <div className={`p-6 rounded-2xl border shadow-xs transition-all ${
        mission.deServicoHoje
          ? 'bg-brand-50/60 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800/80'
          : 'untitled-card'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
              mission.deServicoHoje 
                ? 'bg-brand-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              <Shield className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mission.militar.graduacao} {mission.militar.nome_guerra}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  PM {mission.militar.numero_pm}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200 border border-brand-200 dark:border-brand-800">
                  Equipe: {mission.equipeHoje}
                </span>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 pt-0.5">
                {mission.deServicoHoje ? (
                  <span className="text-brand-700 dark:text-brand-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Escalado de Serviço Operacional Hoje (Legenda: {mission.legendaHoje}) — Boa missão!
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    Não escalado de serviço no dia de hoje (Legenda: {mission.legendaHoje}).
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#161B26] p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="text-center px-3 border-r border-gray-200 dark:border-gray-700">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{mission.servicosRestantesMes}</span>
              <span className="block text-[11px] text-gray-500 font-medium">Serviços no Mês</span>
            </div>
            <div className="text-center px-3">
              <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                {mission.metasEquipe.reduce((acc, m) => acc + m.restantes, 0)}
              </span>
              <span className="block text-[11px] text-gray-500 font-medium">Ops p/ Meta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Pendência (Untitled UI Warning Style) */}
      {mission.pendenciasUltimoServico.length > 0 && (
        <div className="p-4 rounded-xl bg-warning-50 dark:bg-warning-950/40 border border-warning-200 dark:border-warning-800/80 flex items-start gap-3 text-xs text-warning-900 dark:text-warning-200 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-semibold text-warning-900 dark:text-warning-300">
              Aviso Operacional de Pendência
            </h4>
            {mission.pendenciasUltimoServico.map((p, idx) => (
              <p key={idx} className="font-medium text-warning-800 dark:text-warning-200">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Metas da Equipe & Foco no Patrulhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Metas Operacionais */}
        <div className="lg:col-span-2 untitled-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Metas Operacionais da Sua Equipe ({mission.equipeHoje.split(' ')[0]})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ritmo ideal e quantitativo necessário para conclusão da cota mensal
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mission.metasEquipe.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Nenhuma meta configurada para este mês.</p>
            ) : (
              mission.metasEquipe.map((item, idx) => {
                const percent = item.metaMensal > 0 ? Math.min(100, Math.round((item.executadas / item.metaMensal) * 100)) : 100;
                return (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-[#0C111D]/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-mono font-semibold text-xs border border-brand-200 dark:border-brand-800">
                          {item.operacao.codigo_natureza}
                        </span>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {item.operacao.titulo}
                        </span>
                      </div>
                      
                      {item.operacao.link_google_drive && (
                        <a
                          href={item.operacao.link_google_drive}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <span>Diretriz Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.operacao.descricao}
                    </p>

                    {/* Barra de Progresso Untitled UI */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Realizado: <strong className="text-gray-900 dark:text-white">{item.executadas}</strong> de <strong className="text-gray-900 dark:text-white">{item.metaMensal}</strong>
                        </span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {percent}% Concluído
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-brand-600 dark:bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Ritmo */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Faltam <strong>{item.restantes}</strong> operações no mês.
                      </span>
                      <span className="font-semibold text-brand-700 dark:text-brand-300">
                        Ritmo: {item.mediaNecessariaPorPlantao} op/plantão
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Alertas no Setor */}
        <div className="untitled-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Foco no Patrulhamento
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alertas prioritários no município de Salinas
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mission.alertasSetor.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Nenhum alerta crítico ativo no setor.</p>
            ) : (
              mission.alertasSetor.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0C111D]/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <RiskBadge risk={alerta.grau_risco} />
                    <span className="text-[11px] font-mono text-gray-500">{alerta.reds_numero}</span>
                  </div>

                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {alerta.natureza_ocorrencia}
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    📍 <strong>{alerta.bairro}:</strong> {alerta.endereco_completo}
                  </p>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-xs space-y-1 text-gray-600 dark:text-gray-400">
                    <p><strong>Autor:</strong> {alerta.autores}</p>
                    <p><strong>Vítima:</strong> {alerta.vitimas}</p>
                    <p className="text-brand-700 dark:text-brand-300 font-medium mt-1">
                      🛡️ <strong>Ação:</strong> {alerta.acoes_preventivas_adotadas}
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
