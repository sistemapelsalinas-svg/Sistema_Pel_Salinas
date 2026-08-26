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
  FileSpreadsheet,
  Settings,
  Sparkles,
  Info,
  Calendar
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
    showToast('Escala salva com sucesso no sistema!');
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
      showToast(`Equipe "${clean}" adicionada com sucesso!`);
    }
  };

  // Agrupa os itens da escala por militar único
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
        <div className="p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-600 flex items-center gap-2 text-xs font-bold shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              PLANEJAMENTO & RECURSOS HUMANOS
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Escala Operacional Mensal</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Matriz inteligente de alocação por equipe, militar, Nº PM e preenchimento de legendas de serviço.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor Mês/Ano */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
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
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none border-l pl-2 border-slate-200 dark:border-gray-800"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm"
            title="Gerar PDF oficial formatado no padrão PMMG"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar em PDF</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Militar</span>
              </button>

              <button
                onClick={handleSaveSchedule}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Escala</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de Criação de Novas Equipes */}
      {isAdmin && (
        <div className="tactical-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Personalização de Equipes do Pelotão:
            </span>
          </div>
          <form onSubmit={handleAddCustomTeam} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Nome da nova equipe (ex: GEPMOR)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="p-1.5 px-3 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white uppercase font-bold text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
            >
              Criar Equipe
            </button>
          </form>
        </div>
      )}

      {/* Grade / Matriz da Escala (Spreadsheet Interativa) */}
      <div className="tactical-card overflow-hidden shadow-lg border border-slate-200 dark:border-gray-800">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs select-none min-w-[1200px]">
            
            {/* Cabeçalho da Tabela */}
            <thead>
              <tr className="bg-emerald-800 text-white text-[11px] font-bold">
                <th className="p-3 sticky left-0 z-20 bg-emerald-900 w-36 border-r border-emerald-700">
                  EQUIPE
                </th>
                <th className="p-3 sticky left-36 z-20 bg-emerald-900 w-44 border-r border-emerald-700">
                  MILITAR
                </th>
                <th className="p-3 text-center w-24 border-r border-emerald-700">
                  Nº PM
                </th>
                
                {/* Colunas dos Dias 1 a 31 */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const weekend = isWeekendDay(day);
                  return (
                    <th 
                      key={day} 
                      className={`p-1.5 text-center font-mono border-r border-emerald-700 w-9 ${
                        weekend ? 'bg-emerald-950 text-amber-300' : ''
                      }`}
                    >
                      <div className="text-[10px] font-bold">{day.toString().padStart(2, '0')}</div>
                      <div className="text-[8px] font-normal uppercase opacity-80">{getDayOfWeekAbbr(day)}</div>
                    </th>
                  );
                })}

                <th className="p-2 text-center w-16 bg-emerald-900">
                  TOTAL
                </th>

                {isAdmin && (
                  <th className="p-2 text-center w-10 bg-emerald-900">
                    AÇÃO
                  </th>
                )}
              </tr>
            </thead>

            {/* Linhas da Grade por Militar */}
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200">
              {distinctMilitaryList.map((militarId, rIdx) => {
                const userItems = schedule.itens.filter(i => i.militar_id === militarId);
                const firstItem = userItems[0];
                if (!firstItem) return null;

                const currentMilitar = users.find(u => u.id === militarId);
                const numeroPm = currentMilitar ? currentMilitar.numero_pm : firstItem.militar_numero_pm || '-';
                
                // Contagem de serviços no mês
                const totalServicos = userItems.filter(i => {
                  const leg = legends.find(l => l.codigo === i.legenda_codigo);
                  return leg ? leg.conta_como_servico : false;
                }).length;

                return (
                  <tr 
                    key={militarId}
                    className="hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    {/* Dropdown de Equipe */}
                    <td className="p-2 sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800">
                      {isAdmin ? (
                        <select
                          value={firstItem.equipe}
                          onChange={(e) => handleTeamChange(militarId, e.target.value)}
                          className="w-full p-1 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                        >
                          {teams.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{firstItem.equipe}</span>
                      )}
                    </td>

                    {/* Dropdown do Militar */}
                    <td className="p-2 sticky left-36 z-10 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800">
                      {isAdmin ? (
                        <select
                          value={militarId}
                          onChange={(e) => handleMilitaryChange(militarId, e.target.value)}
                          className="w-full p-1 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.graduacao} {u.nome_guerra}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-bold">{firstItem.militar_nome}</span>
                      )}
                    </td>

                    {/* Nº PM (Preenchimento Automático) */}
                    <td className="p-2 text-center font-mono font-bold text-[11px] text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-gray-800">
                      {numeroPm}
                    </td>

                    {/* Células de Dias do Mês */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const item = userItems.find(it => it.dia_mes === day);
                      const currentCode = item ? item.legenda_codigo : 'F';
                      const weekend = isWeekendDay(day);

                      let cellBg = '';
                      if (currentCode === 'S') cellBg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold';
                      else if (currentCode === 'SN') cellBg = 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold';
                      else if (currentCode === 'FA' || currentCode === 'L') cellBg = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold';
                      else if (currentCode === 'F') cellBg = weekend ? 'bg-slate-100/80 dark:bg-gray-800/40 text-slate-400' : 'text-slate-400';

                      return (
                        <td 
                          key={day}
                          className={`p-1 text-center border-r border-slate-200 dark:border-gray-800 ${cellBg}`}
                        >
                          {isAdmin ? (
                            <input
                              type="text"
                              maxLength={4}
                              value={currentCode}
                              onChange={(e) => handleDayCodeChange(militarId, day, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                            />
                          ) : (
                            <span className="font-mono text-xs font-bold">{currentCode}</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total de Serviços */}
                    <td className="p-2 text-center font-bold text-xs bg-slate-50 dark:bg-gray-800/50">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                        {totalServicos}
                      </span>
                    </td>

                    {/* Excluir Linha */}
                    {isAdmin && (
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveMilitary(militarId)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Remover militar da escala"
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

      {/* Legenda dos Códigos da Escala */}
      <div className="tactical-card p-5 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-500" />
          <span>Legenda Oficial dos Códigos de Escala:</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {legends.map((l) => (
            <div
              key={l.codigo}
              className="p-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-center space-y-1"
            >
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${l.cor_badge}`}>
                {l.codigo}
              </span>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                {l.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
