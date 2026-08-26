'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { DEFAULT_TEAMS, DEFAULT_LEGENDS } from '@/lib/mock-data';
import { MonthlySchedule, ScheduleLegend, UserProfile, ScheduleItem } from '@/lib/types';
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
  Info
} from 'lucide-react';

export default function EscalaPage() {
  const { user } = useAuth();
  const [mes, setMes] = useState(8);
  const [ano, setAno] = useState(2026);
  const [schedule, setSchedule] = useState<MonthlySchedule | null>(null);
  const [legends, setLegends] = useState<ScheduleLegend[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [newTeamName, setNewTeamName] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const daysInMonth = new Date(ano, mes, 0).getDate();

  useEffect(() => {
    setUsers(storage.getUsers());
    setLegends(storage.getLegends());
    const sch = storage.getSchedule(mes, ano);
    setSchedule(sch);
  }, [mes, ano]);

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

  const handleAddRow = () => {
    if (!schedule || users.length === 0) return;
    const firstUser = users[0];
    const newItems: ScheduleItem[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      newItems.push({
        id: `item-${firstUser.id}-${day}-${Date.now()}`,
        escala_id: schedule.id,
        equipe: firstUser.equipe_padrao || 'ALFA 1',
        militar_id: firstUser.id,
        militar_nome: firstUser.nome_guerra,
        militar_numero_pm: firstUser.numero_pm,
        dia_mes: day,
        legenda_codigo: 'F'
      });
    }

    setSchedule({
      ...schedule,
      itens: [...schedule.itens, ...newItems]
    });
  };

  const handleRemoveMilitary = (militarId: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      itens: schedule.itens.filter(i => i.militar_id !== militarId)
    });
  };

  const handleMilitaryChange = (oldMilitarId: string, newMilitarId: string) => {
    if (!schedule) return;
    const selectedUser = users.find(u => u.id === newMilitarId);
    if (!selectedUser) return;

    setSchedule({
      ...schedule,
      itens: schedule.itens.map(i => {
        if (i.militar_id === oldMilitarId) {
          return {
            ...i,
            militar_id: selectedUser.id,
            militar_nome: selectedUser.nome_guerra,
            militar_numero_pm: selectedUser.numero_pm,
            equipe: selectedUser.equipe_padrao || i.equipe
          };
        }
        return i;
      })
    });
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

  const handleAddCustomTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const clean = newTeamName.trim().toUpperCase();
    if (!teams.includes(clean)) {
      setTeams([...teams, clean]);
      setNewTeamName('');
      showToast(`Equipe "${clean}" criada com sucesso.`);
    }
  };

  const distinctMilitaryList = Array.from(
    new Set(schedule?.itens.map(i => i.militar_id) || [])
  );

  const getDayOfWeekAbbr = (day: number) => {
    const date = new Date(ano, mes - 1, day);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  const isWeekendDay = (day: number) => {
    const date = new Date(ano, mes - 1, day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  if (!schedule) return null;

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800 flex items-center gap-2 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-brand-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Escala Operacional Mensal</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Matriz de serviço por militar, equipe e legenda com exportação em PDF oficial.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mês/Ano */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#161B26] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs text-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value={1}>01 - Janeiro</option>
              <option value={2}>02 - Fevereiro</option>
              <option value={3}>03 - Março</option>
              <option value={4}>04 - Abril</option>
              <option value={5}>05 - Maio</option>
              <option value={6}>06 - Junho</option>
              <option value={7}>07 - Julho</option>
              <option value={8}>08 - Agosto</option>
              <option value={9}>09 - Setembro</option>
              <option value={10}>10 - Outubro</option>
              <option value={11}>11 - Novembro</option>
              <option value={12}>12 - Dezembro</option>
            </select>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{ano}</span>
          </div>

          <button
            onClick={handleExportPdf}
            className="btn-secondary"
            title="Exportar PDF oficial da PMMG"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Exportar PDF</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={handleAddRow}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Linha</span>
              </button>

              <button
                onClick={handleSaveSchedule}
                className="btn-primary"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Escala</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Criação de Equipes */}
      {isAdmin && (
        <div className="untitled-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Personalização de Equipes:
            </span>
          </div>
          <form onSubmit={handleAddCustomTeam} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Nome da equipe (ex: GEPMOR)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="untitled-input py-1 px-3 text-xs uppercase"
            />
            <button
              type="submit"
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Adicionar
            </button>
          </form>
        </div>
      )}

      {/* Grade da Escala (Untitled UI Table) */}
      <div className="untitled-card overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs select-none min-w-[1200px]">
            
            {/* Header */}
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0C111D] text-gray-600 dark:text-gray-400 font-semibold text-[11px] border-b border-gray-200 dark:border-[#1F242F]">
                <th className="p-3 sticky left-0 z-20 bg-gray-50 dark:bg-[#0C111D] w-36 border-r border-gray-200 dark:border-gray-800">
                  EQUIPE
                </th>
                <th className="p-3 sticky left-36 z-20 bg-gray-50 dark:bg-[#0C111D] w-44 border-r border-gray-200 dark:border-gray-800">
                  MILITAR
                </th>
                <th className="p-3 text-center w-24 border-r border-gray-200 dark:border-gray-800">
                  Nº PM
                </th>
                
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const weekend = isWeekendDay(day);
                  return (
                    <th 
                      key={day} 
                      className={`p-1.5 text-center font-mono border-r border-gray-200 dark:border-gray-800 w-9 ${
                        weekend ? 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 font-bold' : ''
                      }`}
                    >
                      <div className="text-[11px]">{day.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] font-normal uppercase opacity-70">{getDayOfWeekAbbr(day)}</div>
                    </th>
                  );
                })}

                <th className="p-2 text-center w-16 bg-gray-50 dark:bg-[#0C111D]">
                  TOTAL
                </th>

                {isAdmin && (
                  <th className="p-2 text-center w-10 bg-gray-50 dark:bg-[#0C111D]">
                    AÇÃO
                  </th>
                )}
              </tr>
            </thead>

            {/* Linhas */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#161B26] text-gray-800 dark:text-gray-200">
              {distinctMilitaryList.map((militarId) => {
                const userItems = schedule.itens.filter(i => i.militar_id === militarId);
                const firstItem = userItems[0];
                if (!firstItem) return null;

                const currentMilitar = users.find(u => u.id === militarId);
                const numeroPm = currentMilitar ? currentMilitar.numero_pm : firstItem.militar_numero_pm || '-';
                
                const totalServicos = userItems.filter(i => {
                  const leg = legends.find(l => l.codigo === i.legenda_codigo);
                  return leg ? leg.conta_como_servico : false;
                }).length;

                return (
                  <tr 
                    key={militarId}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Equipe */}
                    <td className="p-2 sticky left-0 z-10 bg-white dark:bg-[#161B26] border-r border-gray-200 dark:border-gray-800">
                      {isAdmin ? (
                        <select
                          value={firstItem.equipe}
                          onChange={(e) => handleTeamChange(militarId, e.target.value)}
                          className="w-full p-1 bg-gray-50 dark:bg-[#0C111D] border border-gray-300 dark:border-gray-700 rounded-md text-xs font-semibold text-brand-700 dark:text-brand-300 focus:outline-none"
                        >
                          {teams.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-brand-700 dark:text-brand-300">{firstItem.equipe}</span>
                      )}
                    </td>

                    {/* Militar */}
                    <td className="p-2 sticky left-36 z-10 bg-white dark:bg-[#161B26] border-r border-gray-200 dark:border-gray-800">
                      {isAdmin ? (
                        <select
                          value={militarId}
                          onChange={(e) => handleMilitaryChange(militarId, e.target.value)}
                          className="w-full p-1 bg-gray-50 dark:bg-[#0C111D] border border-gray-300 dark:border-gray-700 rounded-md text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.graduacao} {u.nome_guerra}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium">{firstItem.militar_nome}</span>
                      )}
                    </td>

                    {/* Nº PM */}
                    <td className="p-2 text-center font-mono font-medium text-xs text-gray-500 border-r border-gray-200 dark:border-gray-800">
                      {numeroPm}
                    </td>

                    {/* Dias */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const item = userItems.find(it => it.dia_mes === day);
                      const currentCode = item ? item.legenda_codigo : 'F';
                      const weekend = isWeekendDay(day);

                      let cellBg = '';
                      if (currentCode === 'S') cellBg = 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold';
                      else if (currentCode === 'SN') cellBg = 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold';
                      else if (currentCode === 'FA' || currentCode === 'L') cellBg = 'bg-warning-50 dark:bg-warning-950/60 text-warning-700 dark:text-warning-300 font-bold';
                      else if (currentCode === 'F') cellBg = weekend ? 'bg-gray-50/80 dark:bg-gray-800/30 text-gray-400' : 'text-gray-400';

                      return (
                        <td 
                          key={day}
                          className={`p-1 text-center border-r border-gray-200 dark:border-gray-800 ${cellBg}`}
                        >
                          {isAdmin ? (
                            <input
                              type="text"
                              maxLength={4}
                              value={currentCode}
                              onChange={(e) => handleDayCodeChange(militarId, day, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-brand-500 rounded"
                            />
                          ) : (
                            <span className="font-mono text-xs font-semibold">{currentCode}</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total */}
                    <td className="p-2 text-center font-semibold text-xs bg-gray-50/50 dark:bg-[#0C111D]/50">
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-mono">
                        {totalServicos}
                      </span>
                    </td>

                    {/* Ação */}
                    {isAdmin && (
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveMilitary(militarId)}
                          className="p-1 text-gray-400 hover:text-error-600 rounded"
                          title="Remover militar"
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

      {/* Legenda dos Códigos (Untitled UI Pill Tags) */}
      <div className="untitled-card p-5 space-y-3">
        <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" />
          <span>Legenda Oficial dos Códigos de Escala:</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {legends.map((l) => (
            <div
              key={l.codigo}
              className="p-2 rounded-xl bg-gray-50 dark:bg-[#0C111D]/60 border border-gray-200 dark:border-gray-800 text-center space-y-1"
            >
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${l.cor_badge}`}>
                {l.codigo}
              </span>
              <p className="text-[10px] text-gray-500 leading-tight">
                {l.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
