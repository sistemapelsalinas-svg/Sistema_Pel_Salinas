'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { DailyMissionData, UserProfile } from '@/lib/types';
import { 
  Shield, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Calendar, 
  Users, 
  Flame, 
  Info,
  ChevronRight,
  Sparkles
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

  const isAdminOrSof = user.role === 'ADMIN' || user.role === 'SOF';

  // Formatador limpo de nome (evita duplicações como "3º Sgt Sgt...")
  const cleanMilitarName = (grad?: string, guerra?: string) => {
    if (!guerra) return '';
    const g = guerra.trim();
    if (grad && g.toLowerCase().startsWith(grad.toLowerCase())) return g;
    return `${grad || ''} ${g}`.trim();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Top Bar Minimalista (Apenas Seletor de Militar se for Admin/SOF) */}
      {isAdminOrSof && (
        <div className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-[#151A23] rounded-xl border border-gray-200/90 dark:border-[#222938] text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Consultar Missão de:</span>
          </div>
          <select
            value={selectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer text-right"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                {cleanMilitarName(u.graduacao, u.nome_guerra)} ({u.numero_pm})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Bar Compacta do Plantão */}
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#151A23] rounded-xl border border-gray-200/90 dark:border-[#222938] text-xs">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${mission.deServicoHoje ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="font-bold text-gray-900 dark:text-white">
            {cleanMilitarName(mission.militar.graduacao, mission.militar.nome_guerra)}
          </span>
          <span className="text-gray-400 font-mono">PM {mission.militar.numero_pm}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            mission.deServicoHoje
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {mission.deServicoHoje ? `De Serviço (${mission.legendaHoje})` : `Folga / Disp (${mission.legendaHoje})`}
          </span>
        </div>
      </div>

      {/* Alerta de Pendência Operacional */}
      {mission.pendenciasUltimoServico.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-amber-900 dark:text-amber-300">
              Aviso Operacional de Pendência
            </h4>
            {mission.pendenciasUltimoServico.map((p, idx) => (
              <p key={idx} className="font-medium text-amber-800 dark:text-amber-200">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Grid Principal: Metas e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Coluna 1 & 2: Metas Operacionais */}
        <div className="lg:col-span-2 untitled-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#222938]">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Metas Operacionais ({mission.equipeHoje.split(' ')[0]})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ritmo ideal e quantitativo necessário para conclusão da cota
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300">
              {mission.servicosRestantesMes} plantões no mês
            </span>
          </div>

          <div className="space-y-3">
            {mission.metasEquipe.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938] space-y-1">
                <Target className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nenhuma meta configurada para este mês.</p>
                <p className="text-[11px] text-gray-500">A fração ainda não distribuiu cotas para sua equipe.</p>
              </div>
            ) : (
              mission.metasEquipe.map((item, idx) => {
                const percent = item.metaMensal > 0 ? Math.min(100, Math.round((item.executadas / item.metaMensal) * 100)) : 100;
                return (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-[#222938] bg-gray-50/50 dark:bg-[#0E121A]/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                          {item.operacao.codigo_natureza}
                        </span>
                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                          {item.operacao.titulo}
                        </span>
                      </div>
                      
                      {item.operacao.link_google_drive && (
                        <a
                          href={item.operacao.link_google_drive}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <span>Diretriz</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.operacao.descricao}
                    </p>

                    {/* Barra de Progresso */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">
                          Realizado: <strong className="text-gray-900 dark:text-white">{item.executadas}</strong> de <strong className="text-gray-900 dark:text-white">{item.metaMensal}</strong>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Ritmo */}
                    <div className="p-2 rounded-lg bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Faltam <strong>{item.restantes}</strong> ops
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        Ritmo: {item.mediaNecessariaPorPlantao} op/plantão
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Alertas Prioritários */}
        <div className="untitled-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#222938]">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Alertas Prioritários
            </h3>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>

          {mission.alertasSetor.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938]">
              Nenhum alerta crítico ativo no momento.
            </p>
          ) : (
            <div className="space-y-3">
              {mission.alertasSetor.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className="p-3 rounded-xl border border-gray-200 dark:border-[#222938] bg-gray-50/50 dark:bg-[#0E121A]/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <RiskBadge risk={alerta.grau_risco} />
                    <span className="font-mono text-gray-500 text-[11px]">{alerta.reds_numero}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {alerta.bairro}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                    {alerta.avaliacao_cenario || alerta.natureza_ocorrencia}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
