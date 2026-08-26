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
  MapPin, 
  Flame, 
  X,
  Edit2,
  Calendar
} from 'lucide-react';

export default function AlertaHomicidioPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<HomicideAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBairro, setFilterBairro] = useState('TODOS');
  const [filterRisco, setFilterRisco] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<HomicideAlert | null>(null);

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

  const bairrosList = Array.from(new Set(alerts.map(a => a.bairro))).filter(Boolean);

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.reds_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.autores.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vitimas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.natureza_ocorrencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.bairro.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBairro = filterBairro === 'TODOS' || a.bairro === filterBairro;
    const matchesRisco = filterRisco === 'TODOS' || a.grau_risco === filterRisco;
    const matchesStatus = filterStatus === 'TODOS' || a.status === filterStatus;

    return matchesSearch && matchesBairro && matchesRisco && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-warning-500" />
            <span>Alertas de Homicídios & Crimes Violentos</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Filtro preventivo de ocorrências com potencial de evolução (ameaças, desavenças, VIF).
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenNewModal}
            className="btn-destructive"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Alerta de Risco</span>
          </button>
        )}
      </div>

      {/* Filter Bar (Untitled UI Toolbar) */}
      <div className="untitled-card p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por REDS, autor, vítima ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="untitled-input pl-9"
            />
          </div>

          <div>
            <select
              value={filterBairro}
              onChange={(e) => setFilterBairro(e.target.value)}
              className="untitled-input"
            >
              <option value="TODOS">Todos os Bairros</option>
              {bairrosList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterRisco}
              onChange={(e) => setFilterRisco(e.target.value)}
              className="untitled-input font-medium"
            >
              <option value="TODOS">Todos os Riscos</option>
              <option value="CRITICO">Crítico</option>
              <option value="ALTO">Alto Risco</option>
              <option value="MEDIO">Médio</option>
              <option value="BAIXO">Baixo</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="untitled-input"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="CONTROLADO">Controlado</option>
              <option value="EVOLUIDO">Evoluído</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

        </div>
      </div>

      {/* Cards dos Alertas */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="untitled-card p-12 text-center text-gray-500 text-xs">
            Nenhum alerta de homicídio encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alerta) => (
              <div
                key={alerta.id}
                className="untitled-card p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RiskBadge risk={alerta.grau_risco} />
                      <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">{alerta.reds_numero}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {alerta.status}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(alerta)}
                          className="p-1 text-gray-400 hover:text-brand-600 transition-colors"
                          title="Editar Alerta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {alerta.natureza_ocorrencia}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span><strong>{alerta.bairro}</strong> ({alerta.municipio}) — {alerta.endereco_completo}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#0C111D]/60 rounded-xl space-y-1 text-xs">
                    <p className="text-gray-700 dark:text-gray-300">
                      👤 <strong>Autor:</strong> <span className="font-medium text-error-600 dark:text-error-400">{alerta.autores}</span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      🛡️ <strong>Vítima:</strong> <span className="font-medium text-primary-600 dark:text-primary-400">{alerta.vitimas}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-gray-500 block">
                      Avaliação do Cenário:
                    </span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#0C111D]/40 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                      {alerta.avaliacao_cenario}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 block">
                      Ações Preventivas Adotadas:
                    </span>
                    <p className="text-xs text-brand-900 dark:text-brand-200 bg-brand-50/50 dark:bg-brand-950/20 p-2.5 rounded-lg border border-brand-200 dark:border-brand-900/40">
                      {alerta.acoes_preventivas_adotadas}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Data do Fato: {alerta.data_fato}</span>
                  <span>Registrado no SGP</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Alerta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                  {editingAlert ? 'Editar Alerta de Risco' : 'Novo Alerta de Homicídio'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Salinas / 2º Pelotão PM</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nº do REDS *
                  </label>
                  <input
                    type="text"
                    placeholder="2026-004589123-001"
                    value={formData.reds_numero}
                    onChange={(e) => setFormData({ ...formData, reds_numero: e.target.value })}
                    className="untitled-input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grau de Risco *
                  </label>
                  <select
                    value={formData.grau_risco}
                    onChange={(e) => setFormData({ ...formData, grau_risco: e.target.value as RiskLevel })}
                    className="untitled-input font-medium"
                  >
                    <option value="CRITICO">CRÍTICO</option>
                    <option value="ALTO">ALTO</option>
                    <option value="MEDIO">MÉDIO</option>
                    <option value="BAIXO">BAIXO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AlertStatus })}
                    className="untitled-input"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="CONTROLADO">CONTROLADO</option>
                    <option value="EVOLUIDO">EVOLUÍDO</option>
                    <option value="ARQUIVADO">ARQUIVADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Natureza da Ocorrência *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ameaça de Morte, Desavença Tráfico, VIF..."
                  value={formData.natureza_ocorrencia}
                  onChange={(e) => setFormData({ ...formData, natureza_ocorrencia: e.target.value })}
                  className="untitled-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Município
                  </label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="untitled-input"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Geraldo"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="untitled-input"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data do Fato
                  </label>
                  <input
                    type="date"
                    value={formData.data_fato}
                    onChange={(e) => setFormData({ ...formData, data_fato: e.target.value })}
                    className="untitled-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, referências..."
                  value={formData.endereco_completo}
                  onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
                  className="untitled-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Autores / Envolvidos *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nomes, alcunhas..."
                    value={formData.autores}
                    onChange={(e) => setFormData({ ...formData, autores: e.target.value })}
                    className="untitled-input"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vítimas / Ameaçados *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nomes, vínculo com o autor..."
                    value={formData.vitimas}
                    onChange={(e) => setFormData({ ...formData, vitimas: e.target.value })}
                    className="untitled-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avaliação do Cenário *
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva a dinâmica da rivalidade..."
                  value={formData.avaliacao_cenario}
                  onChange={(e) => setFormData({ ...formData, avaliacao_cenario: e.target.value })}
                  className="untitled-input"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ações Preventivas Adotadas *
                </label>
                <textarea
                  rows={2}
                  placeholder="Patrulhamento, abordagens direcionadas..."
                  value={formData.acoes_preventivas_adotadas}
                  onChange={(e) => setFormData({ ...formData, acoes_preventivas_adotadas: e.target.value })}
                  className="untitled-input"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-destructive"
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
