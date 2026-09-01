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
  Check, 
  Pencil, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

export default function OperacoesCatalogoPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<OperationType[]>(storage.getOperations());
  const [activeGroup, setActiveGroup] = useState<OperationGroup>('POG');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [deleteConfirmOp, setDeleteConfirmOp] = useState<OperationType | null>(null);

  const initialForm = {
    grupo: 'ORDENS_SERVICO' as OperationGroup,
    codigo_natureza: '',
    titulo: '',
    descricao: '',
    link_google_drive: '',
    requer_reds_origem: false,
    min_envolvidos: 0,
    area_rural_obrigatoria: false
  };

  const [formData, setFormData] = useState(initialForm);

  const isAdmin = user?.role === 'ADMIN';

  const handleOpenCreate = () => {
    setEditingOpId(null);
    setFormData({
      ...initialForm,
      grupo: activeGroup
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (op: OperationType) => {
    setEditingOpId(op.id);
    setFormData({
      grupo: op.grupo,
      codigo_natureza: op.codigo_natureza,
      titulo: op.titulo,
      descricao: op.descricao || '',
      link_google_drive: op.link_google_drive || '',
      requer_reds_origem: !!op.requer_reds_origem,
      min_envolvidos: op.min_envolvidos || 0,
      area_rural_obrigatoria: !!op.area_rural_obrigatoria
    });
    setIsModalOpen(true);
  };

  const handleDelete = (op: OperationType) => {
    storage.deleteOperation(op.id);
    setOperations(storage.getOperations());
    setDeleteConfirmOp(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_natureza.trim() || !formData.titulo.trim()) return;

    if (editingOpId) {
      storage.updateOperation(editingOpId, {
        ...formData,
        codigo_natureza: formData.codigo_natureza.trim(),
        titulo: formData.titulo.trim()
      });
    } else {
      storage.addOperation({
        ...formData,
        codigo_natureza: formData.codigo_natureza.trim(),
        titulo: formData.titulo.trim(),
        ativo: true
      });
    }

    setOperations(storage.getOperations());
    setIsModalOpen(false);
    setEditingOpId(null);
    setFormData(initialForm);
  };

  const groups = [
    { key: 'POG', label: 'Operações POG', icon: Shield, count: operations.filter(o => o.grupo === 'POG').length },
    { key: 'PROXIMIDADE', label: 'Policiamento de Proximidade', icon: Users, count: operations.filter(o => o.grupo === 'PROXIMIDADE').length },
    { key: 'INTERACOES_COMUNITARIAS', label: 'Interações Comunitárias', icon: Home, count: operations.filter(o => o.grupo === 'INTERACOES_COMUNITARIAS').length },
    { key: 'ORDENS_SERVICO', label: 'Ordens de Serviço (OS)', icon: FileText, count: operations.filter(o => o.grupo === 'ORDENS_SERVICO').length },
  ];

  const filteredOps = operations.filter(o => o.grupo === activeGroup);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Header Limpo (Sem o subtítulo longo) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Catálogo de Operações & Diretrizes
          </h1>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="btn-primary self-start sm:self-auto py-2 px-3 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Operação / OS</span>
          </button>
        )}
      </div>

      {/* Segmented Control / Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {groups.map((g) => {
          const Icon = g.icon;
          const isActive = activeGroup === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key as OperationGroup)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between shadow-xs ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                  : 'untitled-card text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{g.label}</p>
                  <p className="text-[11px] text-gray-400">
                    {g.count} cadastradas
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid de Cards das Operações com Opções de Editar e Excluir */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOps.map((op) => (
          <div
            key={op.id}
            className="untitled-card p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                  {op.codigo_natureza}
                </span>

                <div className="flex items-center gap-1">
                  {op.area_rural_obrigatoria && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Rural
                    </span>
                  )}

                  {/* Ações de Edição e Exclusão (Admin) */}
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => handleOpenEdit(op)}
                        title="Editar Operação"
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOp(op)}
                        title="Excluir Operação"
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                {op.titulo}
              </h3>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {op.descricao}
              </p>

              {/* Requisitos Obrigatórios */}
              {((op.min_envolvidos ?? 0) > 0 || op.requer_reds_origem) && (
                <div className="p-2.5 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#222938] text-xs space-y-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block text-[11px]">Requisitos:</span>
                  {(op.min_envolvidos ?? 0) > 0 && (
                    <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                      • Mínimo de <strong>{op.min_envolvidos}</strong> pessoas envolvidas
                    </p>
                  )}
                  {op.requer_reds_origem && (
                    <p className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                      • REDS do delito de origem obrigatório
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Link Google Drive */}
            <div className="pt-3 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between">
              {op.link_google_drive ? (
                <a
                  href={op.link_google_drive}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Diretriz Google Drive</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-xs text-gray-400">Sem diretriz anexa</span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Modal de Criação / Edição de Operação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl overflow-hidden">
            
            <div className="p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {editingOpId ? 'Editar Operação / Ordem de Serviço' : 'Nova Operação / Ordem de Serviço'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">2º Pelotão Salinas</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grupo Operacional *
                </label>
                <select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value as OperationGroup })}
                  className="untitled-input"
                >
                  <option value="POG">Operações POG</option>
                  <option value="ORDENS_SERVICO">Ordens de Serviço (OS)</option>
                  <option value="INTERACOES_COMUNITARIAS">Interações Comunitárias</option>
                  <option value="PROXIMIDADE">Policiamento de Proximidade</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código / Natureza *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Y07001 ou OS 3.038"
                    value={formData.codigo_natureza}
                    onChange={(e) => setFormData({ ...formData, codigo_natureza: e.target.value })}
                    className="untitled-input font-mono font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título da Operação *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Batida Policial"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="untitled-input font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição & Objetivo Tático
                </label>
                <textarea
                  rows={2}
                  placeholder="Orientações essenciais para a tropa na rua..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="untitled-input"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link da Diretriz no Google Drive
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.link_google_drive}
                  onChange={(e) => setFormData({ ...formData, link_google_drive: e.target.value })}
                  className="untitled-input font-mono"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#222938] space-y-2">
                <span className="font-bold text-gray-900 dark:text-white block text-[11px]">
                  Regras Específicas de Lançamento
                </span>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requer_reds_origem}
                      onChange={(e) => setFormData({ ...formData, requer_reds_origem: e.target.checked })}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Exige REDS de Origem</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.area_rural_obrigatoria}
                      onChange={(e) => setFormData({ ...formData, area_rural_obrigatoria: e.target.checked })}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Exclusiva Área Rural</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mínimo de Pessoas Envolvidas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.min_envolvidos}
                    onChange={(e) => setFormData({ ...formData, min_envolvidos: parseInt(e.target.value) || 0 })}
                    className="untitled-input"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs"
                >
                  {editingOpId ? 'Salvar Alterações' : 'Cadastrar Operação'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl p-5 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Operação?
              </h3>
              <p className="text-gray-500">
                Tem certeza que deseja remover <strong>{deleteConfirmOp.titulo}</strong> ({deleteConfirmOp.codigo_natureza}) do catálogo?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOp(null)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmOp)}
                className="py-2 px-4 flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
