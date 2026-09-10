'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { OperationType, OperationGroupDef } from '@/lib/types';
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
  AlertCircle,
  Compass,
  HeartHandshake,
  FileSpreadsheet,
  Layers,
  Activity,
  Flag,
  Sparkles,
  Briefcase,
  Zap,
  Bookmark,
  Folder,
  Settings,
  PlusCircle,
  Tag
} from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'Shield', label: 'Escudo', icon: Shield },
  { key: 'Compass', label: 'Bússola', icon: Compass },
  { key: 'HeartHandshake', label: 'Comunitário', icon: HeartHandshake },
  { key: 'FileSpreadsheet', label: 'Planilha / OS', icon: FileSpreadsheet },
  { key: 'Layers', label: 'Camadas', icon: Layers },
  { key: 'Target', label: 'Alvo', icon: Target },
  { key: 'Users', label: 'Equipe', icon: Users },
  { key: 'Activity', label: 'Atividade', icon: Activity },
  { key: 'Flag', label: 'Bandeira', icon: Flag },
  { key: 'Sparkles', label: 'Especial', icon: Sparkles },
  { key: 'Briefcase', label: 'Pasta', icon: Briefcase },
  { key: 'Zap', label: 'Tático / Rápido', icon: Zap },
  { key: 'Bookmark', label: 'Marcador', icon: Bookmark },
  { key: 'Folder', label: 'Diretório', icon: Folder },
];

const COLOR_OPTIONS = [
  { key: 'blue', label: 'Azul', bgClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { key: 'emerald', label: 'Verde', bgClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { key: 'purple', label: 'Roxo', bgClass: 'bg-purple-500', badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { key: 'amber', label: 'Âmbar', bgClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { key: 'rose', label: 'Vermelho', bgClass: 'bg-rose-500', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  { key: 'indigo', label: 'Índigo', bgClass: 'bg-indigo-500', badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { key: 'cyan', label: 'Ciano', bgClass: 'bg-cyan-500', badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { key: 'slate', label: 'Cinza', bgClass: 'bg-gray-500', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' },
];

export default function OperacoesCatalogoPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [operationGroups, setOperationGroups] = useState<OperationGroupDef[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>('POG');
  
  // Modais de Operação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [deleteConfirmOp, setDeleteConfirmOp] = useState<OperationType | null>(null);

  // Modais de Grupos de Operações (CRUD)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    nome: '',
    descricao: '',
    icone: 'Shield',
    cor: 'blue'
  });
  const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<OperationGroupDef | null>(null);
  const [groupFeedback, setGroupFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Criação Rápida de Grupo no Modal de Operação
  const [isQuickGroupOpen, setIsQuickGroupOpen] = useState(false);
  const [quickGroupName, setQuickGroupName] = useState('');
  const [quickGroupDesc, setQuickGroupDesc] = useState('');
  const [quickGroupIcon, setQuickGroupIcon] = useState('Shield');
  const [quickGroupColor, setQuickGroupColor] = useState('blue');

  const initialForm = {
    grupo: 'POG',
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const ops = storage.getOperations();
    const grps = storage.getOperationGroups();
    setOperations(ops);
    setOperationGroups(grps);
    if (grps.length > 0 && !grps.some(g => g.id === activeGroup)) {
      setActiveGroup(grps[0].id);
    }
  };

  const getGroupIcon = (iconName?: string) => {
    const found = ICON_OPTIONS.find(i => i.key === iconName);
    return found ? found.icon : Shield;
  };

  const getGroupColor = (colorKey?: string) => {
    const found = COLOR_OPTIONS.find(c => c.key === colorKey);
    return found || COLOR_OPTIONS[0];
  };

  // --- Ações de Operações ---
  const handleOpenCreate = () => {
    setEditingOpId(null);
    setFormData({
      ...initialForm,
      grupo: activeGroup
    });
    setIsQuickGroupOpen(false);
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
    setIsQuickGroupOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = (op: OperationType) => {
    storage.deleteOperation(op.id);
    loadData();
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

    loadData();
    setIsModalOpen(false);
    setEditingOpId(null);
    setFormData(initialForm);
  };

  // --- Ações de CRUD dos Grupos de Operações ---
  const handleOpenGroupManager = () => {
    setEditingGroupId(null);
    setGroupFormData({
      nome: '',
      descricao: '',
      icone: 'Shield',
      cor: 'blue'
    });
    setGroupFeedback(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (g: OperationGroupDef) => {
    setEditingGroupId(g.id);
    setGroupFormData({
      nome: g.nome,
      descricao: g.descricao || '',
      icone: g.icone || 'Shield',
      cor: g.cor || 'blue'
    });
    setGroupFeedback(null);
  };

  const handleCancelEditGroup = () => {
    setEditingGroupId(null);
    setGroupFormData({
      nome: '',
      descricao: '',
      icone: 'Shield',
      cor: 'blue'
    });
    setGroupFeedback(null);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.nome.trim()) {
      setGroupFeedback({ type: 'error', message: 'O nome do grupo é obrigatório.' });
      return;
    }

    if (editingGroupId) {
      storage.updateOperationGroup(editingGroupId, {
        nome: groupFormData.nome.trim(),
        descricao: groupFormData.descricao.trim(),
        icone: groupFormData.icone,
        cor: groupFormData.cor
      });
      setGroupFeedback({ type: 'success', message: 'Grupo atualizado com sucesso!' });
      setEditingGroupId(null);
    } else {
      const newGrp = storage.addOperationGroup({
        nome: groupFormData.nome.trim(),
        descricao: groupFormData.descricao.trim(),
        icone: groupFormData.icone,
        cor: groupFormData.cor
      });
      setGroupFeedback({ type: 'success', message: `Grupo "${newGrp.nome}" criado com sucesso!` });
    }

    setGroupFormData({
      nome: '',
      descricao: '',
      icone: 'Shield',
      cor: 'blue'
    });
    loadData();
  };

  const handleDeleteGroup = (group: OperationGroupDef) => {
    const result = storage.deleteOperationGroup(group.id);
    if (!result.success) {
      setGroupFeedback({ type: 'error', message: result.message || 'Erro ao excluir grupo.' });
    } else {
      setGroupFeedback({ type: 'success', message: `Grupo "${group.nome}" excluído com sucesso.` });
      loadData();
    }
    setDeleteConfirmGroup(null);
  };

  // --- Criação Rápida de Grupo dentro do Modal de Operação ---
  const handleQuickCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGroupName.trim()) return;

    const newGrp = storage.addOperationGroup({
      nome: quickGroupName.trim(),
      descricao: quickGroupDesc.trim(),
      icone: quickGroupIcon,
      cor: quickGroupColor
    });

    loadData();
    setFormData(prev => ({ ...prev, grupo: newGrp.id }));
    setIsQuickGroupOpen(false);
    setQuickGroupName('');
    setQuickGroupDesc('');
  };

  const filteredOps = operations.filter(o => o.grupo === activeGroup);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Header Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Catálogo de Operações & Diretrizes
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Gerenciamento de tipos de operações, diretrizes táticas e grupos operacionais.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleOpenGroupManager}
              className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <span>Gerenciar Grupos ({operationGroups.length})</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Operação</span>
            </button>
          </div>
        )}
      </div>

      {/* Segmented Control / Tabs com Naturezas / Cadastradas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {operationGroups.map((g) => {
          const Icon = getGroupIcon(g.icone);
          const isActive = activeGroup === g.id;
          const count = operations.filter(o => o.grupo === g.id).length;

          return (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between shadow-xs ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                  : 'untitled-card text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{g.nome}</p>
                  <p className="text-[11px] text-gray-400">
                    {count} {count === 1 ? 'operação' : 'operações'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid de Cards das Operações */}
      {filteredOps.length === 0 ? (
        <div className="untitled-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Nenhuma operação cadastrada neste grupo
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Clique no botão acima para cadastrar a primeira operação ou ordem de serviço para este grupo.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Operação Agora</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOps.map((op) => (
            <div
              key={op.id}
              className="untitled-card p-5 flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-[#283042] transition-all"
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
      )}

      {/* ========================================================= */}
      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE OPERAÇÃO COM "+ NOVO GRUPO" */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {editingOpId ? 'Editar Operação / Ordem de Serviço' : 'Nova Operação / Ordem de Serviço'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">2º Pelotão Salinas</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll Interno Seguro */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
                
                {/* Seleção do Grupo com Botão "+ Novo Grupo" Integrado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-gray-700 dark:text-gray-300">
                      Grupo Operacional *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQuickGroupOpen(!isQuickGroupOpen)}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isQuickGroupOpen ? 'Fechar Criação de Grupo' : '+ Criar Novo Grupo'}</span>
                    </button>
                  </div>

                  {/* Painel de Criação Rápida de Grupo Inline */}
                  {isQuickGroupOpen && (
                    <div className="mb-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Novo Grupo de Operações</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsQuickGroupOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Nome do Grupo *</label>
                          <input
                            type="text"
                            placeholder="Ex: Operações Noturnas"
                            value={quickGroupName}
                            onChange={(e) => setQuickGroupName(e.target.value)}
                            className="untitled-input text-xs py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Ícone</label>
                          <select
                            value={quickGroupIcon}
                            onChange={(e) => setQuickGroupIcon(e.target.value)}
                            className="untitled-input text-xs py-1.5"
                          >
                            {ICON_OPTIONS.map(i => (
                              <option key={i.key} value={i.key}>{i.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Descrição Curta</label>
                        <input
                          type="text"
                          placeholder="Objetivo principal deste grupo..."
                          value={quickGroupDesc}
                          onChange={(e) => setQuickGroupDesc(e.target.value)}
                          className="untitled-input text-xs py-1.5"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsQuickGroupOpen(false)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickCreateGroup}
                          disabled={!quickGroupName.trim()}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                        >
                          Salvar e Selecionar Grupo
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                    className="untitled-input"
                  >
                    {operationGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
              </div>

              {/* Footer Fixo com Botões Visíveis */}
              <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end gap-2 flex-shrink-0 bg-gray-50/50 dark:bg-[#0E121A]">
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

      {/* ========================================================= */}
      {/* MODAL DE GERENCIAMENTO / CRUD DE GRUPOS DE OPERAÇÕES */}
      {/* ========================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in zoom-in-95">
            
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Gerenciar Grupos de Operações
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Cadastre, edite ou organize as categorias de operações da fração
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Feedback de Notificação */}
              {groupFeedback && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  groupFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  <span>{groupFeedback.message}</span>
                  <button onClick={() => setGroupFeedback(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Formulário de Criação / Edição de Grupo */}
              <form onSubmit={handleSaveGroup} className="p-3.5 bg-gray-50 dark:bg-[#0E121A] rounded-2xl border border-gray-200 dark:border-[#222938] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    {editingGroupId ? <Pencil className="w-3.5 h-3.5 text-amber-500" /> : <Plus className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{editingGroupId ? 'Editar Grupo de Operações' : 'Cadastrar Novo Grupo'}</span>
                  </h4>
                  {editingGroupId && (
                    <button
                      type="button"
                      onClick={handleCancelEditGroup}
                      className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Grupo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Policiamento de Trânsito"
                      value={groupFormData.nome}
                      onChange={(e) => setGroupFormData({ ...groupFormData, nome: e.target.value })}
                      className="untitled-input"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Ícone
                      </label>
                      <select
                        value={groupFormData.icone}
                        onChange={(e) => setGroupFormData({ ...groupFormData, icone: e.target.value })}
                        className="untitled-input"
                      >
                        {ICON_OPTIONS.map(i => (
                          <option key={i.key} value={i.key}>{i.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Cor
                      </label>
                      <select
                        value={groupFormData.cor}
                        onChange={(e) => setGroupFormData({ ...groupFormData, cor: e.target.value })}
                        className="untitled-input"
                      >
                        {COLOR_OPTIONS.map(c => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descrição & Finalidade
                  </label>
                  <input
                    type="text"
                    placeholder="Breve resumo das atividades pertencentes a este grupo..."
                    value={groupFormData.descricao}
                    onChange={(e) => setGroupFormData({ ...groupFormData, descricao: e.target.value })}
                    className="untitled-input"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingGroupId && (
                    <button
                      type="button"
                      onClick={handleCancelEditGroup}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingGroupId ? 'Salvar Alterações' : 'Adicionar Grupo'}</span>
                  </button>
                </div>
              </form>

              {/* Lista dos Grupos Cadastrados */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider block">
                  Grupos Atuais ({operationGroups.length})
                </label>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {operationGroups.map((grp) => {
                    const Icon = getGroupIcon(grp.icone);
                    const colorCfg = getGroupColor(grp.cor);
                    const countOps = operations.filter(o => o.grupo === grp.id).length;

                    return (
                      <div
                        key={grp.id}
                        className="p-3 rounded-xl bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] flex items-center justify-between gap-3 shadow-2xs hover:border-gray-300 dark:hover:border-[#283042]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCfg.badgeClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                {grp.nome}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {countOps} {countOps === 1 ? 'op' : 'ops'}
                              </span>
                              {grp.is_default && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 truncate max-w-sm mt-0.5">
                              {grp.descricao || 'Sem descrição cadastrada'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditGroup(grp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Editar Grupo"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmGroup(grp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Excluir Grupo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Fixo */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-end flex-shrink-0 bg-gray-50/50 dark:bg-[#0E121A]">
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE OPERAÇÃO */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE GRUPO */}
      {/* ========================================================= */}
      {deleteConfirmGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl p-5 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Excluir Grupo de Operações?
              </h3>
              <p className="text-gray-500">
                Tem certeza que deseja excluir o grupo <strong>{deleteConfirmGroup.nome}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmGroup(null)}
                className="btn-secondary py-2 px-4 flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(deleteConfirmGroup)}
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
