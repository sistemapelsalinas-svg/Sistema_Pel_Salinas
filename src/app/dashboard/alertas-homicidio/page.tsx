'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { HomicideAlert, RiskLevel, AlertStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { RiskBadge } from '@/components/risk-badge';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Flame, 
  X,
  Edit2,
  FileSpreadsheet,
  Building,
  Calendar
} from 'lucide-react';

export default function AlertaHomicidioPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<HomicideAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNatureza, setFilterNatureza] = useState('TODAS');
  const [filterBairro, setFilterBairro] = useState('TODOS');
  const [filterRisco, setFilterRisco] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<HomicideAlert | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    reds_numero: '',
    natureza_ocorrencia: 'Ameaça de Morte / Desavença Tráfico',
    data_fato: new Date().toISOString().split('T')[0],
    municipio: 'Salinas',
    bairro: 'Centro',
    endereco_completo: '',
    autores: '',
    vitimas: '',
    grau_risco: 'ALTO' as RiskLevel,
    avaliacao_cenario: '',
    acoes_preventivas_adotadas: '',
    status: 'ATIVO' as AlertStatus
  });

  const canEdit = user?.role === 'ADMIN' || user?.role === 'ALERTA_HOMICIDIO';

  useEffect(() => {
    setAlerts(storage.getAlerts());
  }, []);

  const handleOpenNewModal = () => {
    setEditingAlert(null);
    setFormData({
      reds_numero: '',
      natureza_ocorrencia: 'Ameaça de Morte / Desavença Tráfico',
      data_fato: new Date().toISOString().split('T')[0],
      municipio: 'Salinas',
      bairro: 'Centro',
      endereco_completo: '',
      autores: '',
      vitimas: '',
      grau_risco: 'ALTO',
      avaliacao_cenario: '',
      acoes_preventivas_adotadas: '',
      status: 'ATIVO'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (alerta: HomicideAlert) => {
    setEditingAlert(alerta);
    setFormData({
      reds_numero: alerta.reds_numero,
      natureza_ocorrencia: alerta.natureza_ocorrencia,
      data_fato: alerta.data_fato,
      municipio: alerta.municipio,
      bairro: alerta.bairro,
      endereco_completo: alerta.endereco_completo,
      autores: alerta.autores,
      vitimas: alerta.vitimas,
      grau_risco: alerta.grau_risco,
      avaliacao_cenario: alerta.avaliacao_cenario,
      acoes_preventivas_adotadas: alerta.acoes_preventivas_adotadas,
      status: alerta.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reds_numero || !formData.autores || !formData.vitimas) return;

    if (editingAlert) {
      storage.updateAlert(editingAlert.id, formData);
    } else {
      storage.addAlert({
        ...formData,
        created_by: user?.id
      });
    }

    setAlerts(storage.getAlerts());
    setIsModalOpen(false);
  };

  // Distinct Bairros
  const bairrosList = Array.from(new Set(alerts.map(a => a.bairro))).filter(Boolean);

  // Filtragem dos Alertas
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.reds_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.autores.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vitimas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.natureza_ocorrencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.bairro.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNatureza = filterNatureza === 'TODAS' || a.natureza_ocorrencia.toLowerCase().includes(filterNatureza.toLowerCase());
    const matchesBairro = filterBairro === 'TODOS' || a.bairro === filterBairro;
    const matchesRisco = filterRisco === 'TODOS' || a.grau_risco === filterRisco;
    const matchesStatus = filterStatus === 'TODOS' || a.status === filterStatus;

    return matchesSearch && matchesNatureza && matchesBairro && matchesRisco && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40">
              INTELIGÊNCIA & PREVENÇÃO
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Módulo de Alerta de Homicídios</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Filtro e monitoramento de ocorrências com potencial de escalada para crimes violentos e feminicídios.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Alerta de Risco</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="tactical-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          
          {/* Busca Geral */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar REDS, autor, vítima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Filtro Bairro */}
          <div>
            <select
              value={filterBairro}
              onChange={(e) => setFilterBairro(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="TODOS">Todos os Bairros</option>
              {bairrosList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Filtro Grau de Risco */}
          <div>
            <select
              value={filterRisco}
              onChange={(e) => setFilterRisco(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold"
            >
              <option value="TODOS">Todos os Riscos</option>
              <option value="CRITICO">Risco Crítico (Vermelho)</option>
              <option value="ALTO">Alto Risco (Laranja)</option>
              <option value="MEDIO">Médio Risco (Amarelo)</option>
              <option value="BAIXO">Baixo Risco (Verde)</option>
            </select>
          </div>

          {/* Filtro Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Ativo / Monitorando</option>
              <option value="CONTROLADO">Controlado</option>
              <option value="EVOLUIDO">Evoluído</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

          {/* Limpar Filtros */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterBairro('TODOS');
              setFilterRisco('TODOS');
              setFilterStatus('TODOS');
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Visualização dos Alertas em Tabela / Cards */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="tactical-card p-12 text-center text-slate-500 text-xs">
            Nenhum alerta de homicídio encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alerta) => (
              <div
                key={alerta.id}
                className="tactical-card p-5 space-y-3.5 border-l-4 hover:border-slate-300 dark:hover:border-gray-700 transition-all flex flex-col justify-between"
                style={{
                  borderLeftColor:
                    alerta.grau_risco === 'CRITICO' ? '#dc2626' :
                    alerta.grau_risco === 'ALTO' ? '#f59e0b' :
                    alerta.grau_risco === 'MEDIO' ? '#eab308' : '#22c55e'
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RiskBadge risk={alerta.grau_risco} />
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{alerta.reds_numero}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alerta.status === 'ATIVO' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' 
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {alerta.status}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(alerta)}
                          className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Editar Alerta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {alerta.natureza_ocorrencia}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span><strong>{alerta.bairro}</strong> ({alerta.municipio}) — {alerta.endereco_completo}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl space-y-1.5 text-xs">
                    <p className="text-slate-700 dark:text-slate-300">
                      👤 <strong>Autores:</strong> <span className="font-semibold text-red-600 dark:text-red-400">{alerta.autores}</span>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      🛡️ <strong>Vítimas:</strong> <span className="font-semibold text-blue-600 dark:text-blue-400">{alerta.vitimas}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Avaliação do Cenário:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-gray-800/30 p-2.5 rounded-lg border border-slate-200 dark:border-gray-800">
                      {alerta.avaliacao_cenario}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      Ações Preventivas Adotadas:
                    </span>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                      {alerta.acoes_preventivas_adotadas}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-gray-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Data do Fato: {alerta.data_fato}</span>
                  <span>Registrado no SGP</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de Alerta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-slate-900 dark:bg-black p-5 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingAlert ? 'Editar Alerta de Homicídio' : 'Novo Alerta de Prevenção de Homicídio'}
                  </h3>
                  <p className="text-xs text-slate-400">Salinas / 2º Pelotão PM</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Nº do REDS *
                  </label>
                  <input
                    type="text"
                    placeholder="2026-004589123-001"
                    value={formData.reds_numero}
                    onChange={(e) => setFormData({ ...formData, reds_numero: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Grau de Risco *
                  </label>
                  <select
                    value={formData.grau_risco}
                    onChange={(e) => setFormData({ ...formData, grau_risco: e.target.value as RiskLevel })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="CRITICO">CRÍTICO (Imediato)</option>
                    <option value="ALTO">ALTO</option>
                    <option value="MEDIO">MÉDIO</option>
                    <option value="BAIXO">BAIXO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Status do Alerta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AlertStatus })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="CONTROLADO">CONTROLADO</option>
                    <option value="EVOLUIDO">EVOLUÍDO</option>
                    <option value="ARQUIVADO">ARQUIVADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Natureza da Ocorrência *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ameaça de Morte, Vias de Fato, VIF, Disputa de Tráfico..."
                  value={formData.natureza_ocorrencia}
                  onChange={(e) => setFormData({ ...formData, natureza_ocorrencia: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Município
                  </label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Geraldo, Centro..."
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Data do Fato
                  </label>
                  <input
                    type="date"
                    value={formData.data_fato}
                    onChange={(e) => setFormData({ ...formData, data_fato: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Endereço Completo do Fato
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, pontos de referência..."
                  value={formData.endereco_completo}
                  onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Autores / Envolvidos *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nomes, alcunhas, histórico criminal..."
                    value={formData.autores}
                    onChange={(e) => setFormData({ ...formData, autores: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Vítimas / Ameaçados *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nomes, grau de vulnerabilidade, vínculo..."
                    value={formData.vitimas}
                    onChange={(e) => setFormData({ ...formData, vitimas: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Avaliação Qualitativa do Cenário *
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva a dinâmica da rivalidade, motivos da ameaça, risco iminente..."
                  value={formData.avaliacao_cenario}
                  onChange={(e) => setFormData({ ...formData, avaliacao_cenario: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Ações Preventivas Adotadas / Direcionamento para a Viatura *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Patrulhamento intensificado pela ALFA 1, abordagem e fiscalização de alvará..."
                  value={formData.acoes_preventivas_adotadas}
                  onChange={(e) => setFormData({ ...formData, acoes_preventivas_adotadas: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-900/30"
                >
                  {editingAlert ? 'Atualizar Alerta' : 'Cadastrar Alerta'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
