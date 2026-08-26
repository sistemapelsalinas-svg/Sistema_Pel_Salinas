'use client';

import React, { useState } from 'react';
import { storage } from '@/lib/storage';
import { OperationType, OperationGroup } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { 
  Target, 
  Plus, 
  ExternalLink, 
  Shield, 
  Users, 
  Home, 
  FileText, 
  Link as LinkIcon, 
  X,
  Check
} from 'lucide-react';

export default function OperacoesCatalogoPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<OperationType[]>(storage.getOperations());
  const [activeGroup, setActiveGroup] = useState<OperationGroup>('POG');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    grupo: 'ORDENS_SERVICO' as OperationGroup,
    codigo_natureza: '',
    titulo: '',
    descricao: '',
    link_google_drive: '',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false
  });

  const isAdmin = user?.role === 'ADMIN';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_natureza || !formData.titulo) return;

    storage.addOperation({
      ...formData,
      ativo: true
    });

    setOperations(storage.getOperations());
    setIsModalOpen(false);
    setFormData({
      grupo: 'ORDENS_SERVICO',
      codigo_natureza: '',
      titulo: '',
      descricao: '',
      link_google_drive: '',
      requer_reds_origem: false,
      min_envolvidos: 0,
      area_rural_obrigatoria: false
    });
  };

  const groups = [
    { key: 'POG', label: 'Operações POG', icon: Shield, count: operations.filter(o => o.grupo === 'POG').length },
    { key: 'PROXIMIDADE', label: 'Policiamento de Proximidade', icon: Users, count: operations.filter(o => o.grupo === 'PROXIMIDADE').length },
    { key: 'INTERACOES_COMUNITARIAS', label: 'Interações Comunitárias', icon: Home, count: operations.filter(o => o.grupo === 'INTERACOES_COMUNITARIAS').length },
    { key: 'ORDENS_SERVICO', label: 'Ordens de Serviço (OS)', icon: FileText, count: operations.filter(o => o.grupo === 'ORDENS_SERVICO').length },
  ];

  const filteredOps = operations.filter(o => o.grupo === activeGroup);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Catálogo de Operações & Diretrizes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Naturezas oficiais de policiamento, regras essenciais de validação e diretrizes do Google Drive.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Operação / OS</span>
          </button>
        )}
      </div>

      {/* Segmented Control / Tabs (Untitled UI Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((g) => {
          const Icon = g.icon;
          const isActive = activeGroup === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key as OperationGroup)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between shadow-xs ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-900 dark:text-brand-200'
                  : 'untitled-card text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isActive 
                    ? 'bg-brand-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{g.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {g.count} cadastradas
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid de Cards das Operações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOps.map((op) => (
          <div
            key={op.id}
            className="untitled-card p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-mono font-semibold text-xs border border-brand-200 dark:border-brand-800">
                  {op.codigo_natureza}
                </span>

                {op.area_rural_obrigatoria && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Área Rural
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                {op.titulo}
              </h3>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {op.descricao}
              </p>

              {/* Requisitos Obrigatórios */}
              {((op.min_envolvidos ?? 0) > 0 || op.requer_reds_origem) && (
                <div className="p-3 bg-gray-50 dark:bg-[#0C111D]/60 rounded-xl border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block">Requisitos Obrigatórios:</span>
                  {(op.min_envolvidos ?? 0) > 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      • Mínimo de <strong>{op.min_envolvidos}</strong> pessoas envolvidas
                    </p>
                  )}
                  {op.requer_reds_origem && (
                    <p className="text-error-600 dark:text-error-400 font-medium">
                      • REDS do delito de origem obrigatório
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Link Google Drive */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              {op.link_google_drive ? (
                <a
                  href={op.link_google_drive}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Diretriz Google Drive</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-xs text-gray-400">Sem link anexo</span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Modal de Criação de Operação (Untitled UI Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Nova Operação / Ordem de Serviço</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">2º Pelotão Salinas</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grupo Operacional
                </label>
                <select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value as OperationGroup })}
                  className="untitled-input"
                >
                  <option value="ORDENS_SERVICO">Ordens de Serviço (OS)</option>
                  <option value="POG">Operações POG</option>
                  <option value="PROXIMIDADE">Policiamento de Proximidade</option>
                  <option value="INTERACOES_COMUNITARIAS">Interações Comunitárias</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código / Natureza
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: OS 3.039/2026"
                    value={formData.codigo_natureza}
                    onChange={(e) => setFormData({ ...formData, codigo_natureza: e.target.value })}
                    className="untitled-input"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título da Operação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Operação Corredor Seguro"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="untitled-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição e Orientações Táticas
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o objetivo da operação..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="untitled-input"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link do Google Drive (Diretriz / Documento)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.link_google_drive}
                  onChange={(e) => setFormData({ ...formData, link_google_drive: e.target.value })}
                  className="untitled-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requer_reds_origem}
                    onChange={(e) => setFormData({ ...formData, requer_reds_origem: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Exige REDS de Origem</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.area_rural_obrigatoria}
                    onChange={(e) => setFormData({ ...formData, area_rural_obrigatoria: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Área Rural Obrigatória</span>
                </label>
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
                  className="btn-primary"
                >
                  Salvar Operação
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
