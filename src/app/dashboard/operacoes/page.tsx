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
  AlertCircle,
  X,
  Check
} from 'lucide-react';

export default function OperacoesCatalogoPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<OperationType[]>(storage.getOperations());
  const [activeGroup, setActiveGroup] = useState<OperationGroup>('POG');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form de nova operação / Ordem de Serviço
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

    const newOp = storage.addOperation({
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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              CATÁLOGO DE OPERAÇÕES
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">PMMG — 2º Pelotão Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Gestão e Catálogo de Operações</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Naturezas oficiais de policiamento, regras essenciais de validação e diretrizes do Google Drive.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Operação / OS</span>
          </button>
        )}
      </div>

      {/* Tabs dos Grupos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((g) => {
          const Icon = g.icon;
          const isActive = activeGroup === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key as OperationGroup)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-emerald-700 dark:bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                  : 'tactical-card text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">{g.label}</p>
                  <p className={`text-[10px] ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
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
            className="tactical-card p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-gray-700 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-300 dark:border-emerald-900">
                  {op.codigo_natureza}
                </span>

                {op.area_rural_obrigatoria && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
                    Área Rural
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {op.titulo}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {op.descricao}
              </p>

              {/* Regras e Requisitos Específicos */}
              {((op.min_envolvidos ?? 0) > 0 || op.requer_reds_origem) && (
                <div className="p-2.5 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-800 text-[11px] space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Requisitos Obrigatórios:</span>
                  {(op.min_envolvidos ?? 0) > 0 && (
                    <p className="text-slate-600 dark:text-slate-400">
                      • Mínimo de <strong>{op.min_envolvidos}</strong> pessoas envolvidas
                    </p>
                  )}
                  {op.requer_reds_origem && (
                    <p className="text-amber-600 dark:text-amber-400 font-semibold">
                      • REDS do delito de origem obrigatório
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Link Google Drive */}
            <div className="pt-3 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between">
              {op.link_google_drive ? (
                <a
                  href={op.link_google_drive}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Diretriz / Documento Drive</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-[11px] text-slate-400">Sem link anexo</span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Modal de Criação de Operação / Ordem de Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="bg-slate-900 dark:bg-black p-5 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Nova Operação / Ordem de Serviço</h3>
                  <p className="text-xs text-slate-400">2º Pelotão Salinas</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Grupo Operacional
                </label>
                <select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value as OperationGroup })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="ORDENS_SERVICO">Ordens de Serviço (OS)</option>
                  <option value="POG">Operações POG</option>
                  <option value="PROXIMIDADE">Policiamento de Proximidade</option>
                  <option value="INTERACOES_COMUNITARIAS">Interações Comunitárias</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Código / Natureza
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: OS 3.039/2026 ou Y07001"
                    value={formData.codigo_natureza}
                    onChange={(e) => setFormData({ ...formData, codigo_natureza: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Título da Operação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Operação Corredor Seguro"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Descrição e Orientações Táticas
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o objetivo da operação e procedimentos recomendados..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Link do Google Drive (Diretriz / Documento)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.link_google_drive}
                  onChange={(e) => setFormData({ ...formData, link_google_drive: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requer_reds_origem}
                    onChange={(e) => setFormData({ ...formData, requer_reds_origem: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Exige REDS de Origem</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.area_rural_obrigatoria}
                    onChange={(e) => setFormData({ ...formData, area_rural_obrigatoria: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Área Rural Obrigatória</span>
                </label>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
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
