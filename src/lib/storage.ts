import { 
  UserProfile, 
  OperationType, 
  MonthlyTarget, 
  OperationExecutionLog, 
  HomicideAlert, 
  MonthlySchedule, 
  ScheduleLegend,
  DailyMissionData 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_OPERATIONS, 
  INITIAL_MONTHLY_TARGETS, 
  INITIAL_LOGS, 
  INITIAL_ALERTS, 
  DEFAULT_LEGENDS, 
  generateSampleSchedule 
} from './mock-data';

const STORAGE_KEYS = {
  USERS: 'sgp_salinas_users_v1',
  OPERATIONS: 'sgp_salinas_operations_v1',
  TARGETS: 'sgp_salinas_targets_v1',
  LOGS: 'sgp_salinas_logs_v1',
  ALERTS: 'sgp_salinas_alerts_v1',
  LEGENDS: 'sgp_salinas_legends_v1',
  SCHEDULE: 'sgp_salinas_schedule_v1',
  CURRENT_USER: 'sgp_salinas_current_user_v1'
};

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- USUÁRIOS ---
  getUsers(): UserProfile[] {
    if (!this.isBrowser()) return INITIAL_USERS;
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  saveUsers(users: UserProfile[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  addUser(user: Omit<UserProfile, 'id' | 'created_at'>): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...user,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return users[idx];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    this.saveUsers(filtered);
    return true;
  }

  // --- OPERAÇÕES ---
  getOperations(): OperationType[] {
    if (!this.isBrowser()) return INITIAL_OPERATIONS;
    const data = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(INITIAL_OPERATIONS));
      return INITIAL_OPERATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_OPERATIONS;
    }
  }

  saveOperations(ops: OperationType[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));
  }

  addOperation(op: Omit<OperationType, 'id'>): OperationType {
    const ops = this.getOperations();
    const newOp: OperationType = {
      ...op,
      id: `op-${Date.now()}`
    };
    ops.push(newOp);
    this.saveOperations(ops);
    return newOp;
  }

  updateOperation(id: string, updates: Partial<OperationType>): OperationType | null {
    const ops = this.getOperations();
    const idx = ops.findIndex(o => o.id === id);
    if (idx === -1) return null;
    ops[idx] = { ...ops[idx], ...updates };
    this.saveOperations(ops);
    return ops[idx];
  }

  deleteOperation(id: string): boolean {
    const ops = this.getOperations();
    const filtered = ops.filter(o => o.id !== id);
    if (filtered.length === ops.length) return false;
    this.saveOperations(filtered);
    return true;
  }

  // --- METAS MENSAIS ---
  getTargets(mes: number = 8, ano: number = 2026): MonthlyTarget[] {
    if (!this.isBrowser()) return INITIAL_MONTHLY_TARGETS;
    const data = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(INITIAL_MONTHLY_TARGETS));
      return INITIAL_MONTHLY_TARGETS;
    }
    try {
      const targets: MonthlyTarget[] = JSON.parse(data);
      return targets.filter(t => t.mes === mes && t.ano === ano);
    } catch {
      return INITIAL_MONTHLY_TARGETS;
    }
  }

  getAllTargets(): MonthlyTarget[] {
    if (!this.isBrowser()) return INITIAL_MONTHLY_TARGETS;
    const data = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (!data) return INITIAL_MONTHLY_TARGETS;
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_MONTHLY_TARGETS;
    }
  }

  saveTargets(targets: MonthlyTarget[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
  }

  copyTargetsFromPreviousMonth(targetMonth: number, targetYear: number): { success: boolean; count: number } {
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;

    const all = this.getAllTargets();
    const prevTargets = all.filter(t => t.mes === prevMonth && t.ano === prevYear);

    if (prevTargets.length === 0) {
      return { success: false, count: 0 };
    }

    // Remove metas já existentes no mês de destino se houver
    const withoutTargetMonth = all.filter(t => !(t.mes === targetMonth && t.ano === targetYear));

    // Clona as do mês anterior com novos IDs
    const cloned = prevTargets.map(t => ({
      ...t,
      id: `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mes: targetMonth,
      ano: targetYear,
      distribuicoes: t.distribuicoes?.map(d => ({
        ...d,
        id: `dst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      }))
    }));

    this.saveTargets([...withoutTargetMonth, ...cloned]);
    return { success: true, count: cloned.length };
  }

  // --- REGISTRO DE EXECUÇÃO DE OPERAÇÕES ---
  getLogs(): OperationExecutionLog[] {
    if (!this.isBrowser()) return INITIAL_LOGS;
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  }

  saveLogs(logs: OperationExecutionLog[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  addLog(log: Omit<OperationExecutionLog, 'id' | 'created_at'>): OperationExecutionLog {
    const logs = this.getLogs();
    const newLog: OperationExecutionLog = {
      ...log,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
    return newLog;
  }

  // --- ALERTAS DE HOMICÍDIO ---
  getAlerts(): HomicideAlert[] {
    if (!this.isBrowser()) return INITIAL_ALERTS;
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ALERTS;
    }
  }

  saveAlerts(alerts: HomicideAlert[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }

  addAlert(alert: Omit<HomicideAlert, 'id' | 'created_at' | 'updated_at'>): HomicideAlert {
    const alerts = this.getAlerts();
    const newAlert: HomicideAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    alerts.unshift(newAlert);
    this.saveAlerts(alerts);
    return newAlert;
  }

  updateAlert(id: string, updates: Partial<HomicideAlert>): HomicideAlert | null {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    alerts[idx] = { 
      ...alerts[idx], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    this.saveAlerts(alerts);
    return alerts[idx];
  }

  // --- ESCALAS E LEGENDAS ---
  getLegends(): ScheduleLegend[] {
    if (!this.isBrowser()) return DEFAULT_LEGENDS;
    const data = localStorage.getItem(STORAGE_KEYS.LEGENDS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LEGENDS, JSON.stringify(DEFAULT_LEGENDS));
      return DEFAULT_LEGENDS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_LEGENDS;
    }
  }

  saveLegends(legends: ScheduleLegend[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LEGENDS, JSON.stringify(legends));
  }

  getSchedule(mes: number = 8, ano: number = 2026): MonthlySchedule {
    if (!this.isBrowser()) return generateSampleSchedule(mes, ano);
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!data) {
      const sample = generateSampleSchedule(mes, ano);
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(sample));
      return sample;
    }
    try {
      const sch: MonthlySchedule = JSON.parse(data);
      if (sch.mes === mes && sch.ano === ano) return sch;
      const newMonth = generateSampleSchedule(mes, ano);
      return newMonth;
    } catch {
      return generateSampleSchedule(mes, ano);
    }
  }

  saveSchedule(schedule: MonthlySchedule): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }

  // --- CÁLCULO DA "MINHA MISSÃO DO DIA" ---
  getDailyMission(user: UserProfile, date: Date = new Date()): DailyMissionData {
    const day = date.getDate();
    const mes = date.getMonth() + 1;
    const ano = date.getFullYear();
    const daysInMonth = new Date(ano, mes, 0).getDate();

    const schedule = this.getSchedule(mes, ano);
    const legends = this.getLegends();
    const operations = this.getOperations();
    const targets = this.getTargets(mes, ano);
    const logs = this.getLogs();
    const alerts = this.getAlerts();

    // Localiza o militar na escala
    const userItemToday = schedule.itens.find(i => i.militar_id === user.id && i.dia_mes === day);
    const currentLegendCode = userItemToday ? userItemToday.legenda_codigo : 'F';
    const legendObj = legends.find(l => l.codigo === currentLegendCode);
    const deServicoHoje = legendObj ? legendObj.conta_como_servico : false;
    const equipeHoje = userItemToday ? userItemToday.equipe : (user.equipe_padrao || 'ALFA 1');

    // Mapeia nome base da equipe (Ex: 'ALFA 1' -> 'ALFA')
    const teamGroup = equipeHoje.split(' ')[0].toUpperCase();

    // Conta quantos serviços restantes o militar/equipe tem até o final do mês
    let servicosRestantesMes = 0;
    for (let d = day; d <= daysInMonth; d++) {
      const item = schedule.itens.find(i => i.militar_id === user.id && i.dia_mes === d);
      if (item) {
        const l = legends.find(leg => leg.codigo === item.legenda_codigo);
        if (l && l.conta_como_servico) {
          servicosRestantesMes++;
        }
      }
    }
    if (servicosRestantesMes === 0 && deServicoHoje) servicosRestantesMes = 1;

    // Metas da equipe
    const metasEquipe = targets.map(t => {
      const op = operations.find(o => o.id === t.tipo_operacao_id) || {
        id: t.tipo_operacao_id,
        grupo: 'POG' as const,
        codigo_natureza: 'OP',
        titulo: 'Operação',
        descricao: '',
        ativo: true
      };

      const dist = t.distribuicoes?.find(d => d.equipe.toUpperCase() === teamGroup);
      const metaMensal = dist ? dist.meta_quantitativa : Math.round(t.meta_total / 4);

      // Quantas já foram executadas por esta equipe este mês
      const executadas = logs.filter(l => {
        const isThisMonth = new Date(l.data_execucao).getMonth() + 1 === mes;
        const isThisOp = l.tipo_operacao_id === t.tipo_operacao_id;
        const isThisTeam = l.equipe.toUpperCase().includes(teamGroup);
        return isThisMonth && isThisOp && isThisTeam;
      }).length;

      const restantes = Math.max(0, metaMensal - executadas);
      const divisor = Math.max(1, servicosRestantesMes);
      const mediaNecessariaPorPlantao = Number((restantes / divisor).toFixed(1));

      return {
        operacao: op,
        metaMensal,
        executadas,
        restantes,
        mediaNecessariaPorPlantao
      };
    });

    // Pendências do último serviço (se na última escala faltou registrar operações de OS)
    const pendenciasUltimoServico: string[] = [];
    const osOperations = operations.filter(o => o.grupo === 'ORDENS_SERVICO');
    if (osOperations.length > 0) {
      const osOp = osOperations[0];
      const hasRecentLog = logs.some(l => l.tipo_operacao_id === osOp.id && l.equipe.toUpperCase().includes(teamGroup));
      if (!hasRecentLog) {
        pendenciasUltimoServico.push(`Atenção: A ${osOp.titulo} (${osOp.codigo_natureza}) está com execução pendente pela sua equipe. Priorizar abordagem e registro no turno de hoje!`);
      }
    }

    // Alertas ativos com risco ALTO ou CRÍTICO
    const alertasSetor = alerts.filter(a => a.status === 'ATIVO' && (a.grau_risco === 'CRITICO' || a.grau_risco === 'ALTO'));

    return {
      militar: user,
      equipeHoje,
      deServicoHoje,
      legendaHoje: currentLegendCode,
      servicosRestantesMes,
      metasEquipe,
      pendenciasUltimoServico,
      alertasSetor
    };
  }
}

export const storage = new StorageService();
