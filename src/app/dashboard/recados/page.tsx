'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { ShiftNotice, ShiftNoticeReadConfirmation } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Eye, 
  ShieldAlert, 
  Check, 
  Search,
  Filter,
  Radio
} from 'lucide-react';

export default function RecadosPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<ShiftNotice[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'ATIVOS' | 'EXPIRADOS'>('ATIVOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<ShiftNotice | null>(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formMensagem, setFormMensagem] = useState('');
  const [formDestinatarioTipo, setFormDestinatarioTipo] = useState<'TODAS' | 'EQUIPES_ESPECIFICAS'>('TODAS');
  const [formEquipes, setFormEquipes] = useState<string[]>([]);
  const [formPrazo, setFormPrazo] = useState('');
  const [formPrioridade, setFormPrioridade] = useState<'NORMAL' | 'IMPORTANTE' | 'URGENTE'>('NORMAL');
  
  // Modal de Confirmações de Leitura
  const [selectedNoticeForReads, setSelectedNoticeForReads] = useState<ShiftNotice | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setNotices(storage.getShiftNotices());
    setAllTeams(storage.getTeams());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setFormTitulo('');
    setFormMensagem('');
    setFormDestinatarioTipo('TODAS');
    setFormEquipes([]);
    
    // Default prazo: 7 dias a partir de agora
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    const dateString = defaultDate.toISOString().slice(0, 16);
    setFormPrazo(dateString);
    setFormPrioridade('NORMAL');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice: ShiftNotice) => {
    setEditingNotice(notice);
    setFormTitulo(notice.titulo);
    setFormMensagem(notice.mensagem);
    setFormDestinatarioTipo(notice.destinatario_tipo);
    setFormEquipes(notice.equipes_destinatarias || []);
    setFormPrazo(notice.prazo_exibicao ? notice.prazo_exibicao.slice(0, 16) : '');
    setFormPrioridade(notice.prioridade);
    setIsModalOpen(true);
  };

  const handleToggleTeam = (team: string) => {
    if (formEquipes.includes(team)) {
      setFormEquipes(formEquipes.filter(t => t !== team));
    } else {
      setFormEquipes([...formEquipes, team]);
    }
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formMensagem.trim()) {
      showToast('Preencha o título e o conteúdo da mensagem.');
      return;
    }

    if (formDestinatarioTipo === 'EQUIPES_ESPECIFICAS' && formEquipes.length === 0) {
      showToast('Selecione pelo menos uma equipe destinatária.');
      return;
    }

    const militarNome = user ? `${user.graduacao || ''} ${user.nome_guerra || user.nome_completo}`.trim() : 'Administração';

    if (editingNotice) {
      storage.updateShiftNotice(editingNotice.id, {
        titulo: formTitulo.trim(),
        mensagem: formMensagem.trim(),
        destinatario_tipo: formDestinatarioTipo,
        equipes_destinatarias: formDestinatarioTipo === 'TODAS' ? [] : formEquipes,
        prazo_exibicao: formPrazo,
        prioridade: formPrioridade
      });
      showToast('Recado operacional atualizado com sucesso.');
    } else {
      storage.addShiftNotice({
        titulo: formTitulo.trim(),
        mensagem: formMensagem.trim(),
        destinatario_tipo: formDestinatarioTipo,
        equipes_destinatarias: formDestinatarioTipo === 'TODAS' ? [] : formEquipes,
        prazo_exibicao: formPrazo,
        prioridade: formPrioridade,
        ativo: true,
        created_by: user?.id,
        created_by_nome: militarNome
      });
      showToast('Novo recado publicado com sucesso para os turnos.');
    }

    loadData();
    setIsModalOpen(false);
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este recado?')) {
      storage.deleteShiftNotice(id);
      loadData();
      showToast('Recado excluído com sucesso.');
    }
  };

  const handleToggleActive = (notice: ShiftNotice) => {
    storage.updateShiftNotice(notice.id, { ativo: !notice.ativo });
    loadData();
    showToast(notice.ativo ? 'Recado arquivado/desativado.' : 'Recado reativado para exibição.');
  };

  const filteredNotices = useMemo(() => {
    const nowTime = new Date().getTime();
    return notices.filter(n => {
      const isExpired = n.prazo_exibicao ? new Date(n.prazo_exibicao).getTime() < nowTime : false;
      
      if (filterStatus === 'ATIVOS' && (!n.ativo || isExpired)) return false;
      if (filterStatus === 'EXPIRADOS' && n.ativo && !isExpired) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = n.titulo.toLowerCase().includes(query);
        const matchMsg = n.mensagem.toLowerCase().includes(query);
        const matchAuthor = (n.created_by_nome || '').toLowerCase().includes(query);
        const matchTeams = n.equipes_destinatarias.some(eq => eq.toLowerCase().includes(query));
        if (!matchTitle && !matchMsg && !matchAuthor && !matchTeams) return false;
      }

      return true;
    });
  }, [notices, filterStatus, searchTerm]);

  const activeCount = useMemo(() => {
    const nowTime = new Date().getTime();
    return notices.filter(n => n.ativo && (!n.prazo_exibicao || new Date(n.prazo_exibicao).getTime() >= nowTime)).length;
  }, [notices]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Recados e Orientações do Turno
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Envio de diretrizes aos turnos de serviço com confirmação de leitura obrigatória em tempo real.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Recado / Orientação</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151A23] p-3 rounded-2xl border border-gray-200/90 dark:border-[#222938] shadow-xs">
        
        {/* Tabs de Status */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus('ATIVOS')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              filterStatus === 'ATIVOS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
            }`}
          >
            <span>Vigentes / Ativos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterStatus === 'ATIVOS' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('TODOS')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterStatus === 'TODOS'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
            }`}
          >
            Todos ({notices.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('EXPIRADOS')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterStatus === 'EXPIRADOS'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2636]'
            }`}
          >
            Expirados / Arquivados
          </button>
        </div>

        {/* Busca */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar recado por título ou texto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Recados */}
      {filteredNotices.length === 0 ? (
        <div className="untitled-card p-10 text-center space-y-3">
          <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
            Nenhum recado ou orientação encontrado
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Utilize o botão acima para publicar comunicados, metas urgentes ou orientações táticas para as guarnições.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => {
            const isExpired = notice.prazo_exibicao ? new Date(notice.prazo_exibicao).getTime() < new Date().getTime() : false;
            const readCount = notice.leituras_confirmadas?.length || 0;

            return (
              <div 
                key={notice.id}
                className={`untitled-card p-4 sm:p-5 space-y-3 border-l-4 transition-all ${
                  !notice.ativo || isExpired 
                    ? 'border-l-gray-400 opacity-75' 
                    : notice.prioridade === 'URGENTE' 
                    ? 'border-l-rose-500 bg-rose-50/10 dark:bg-rose-950/10'
                    : notice.prioridade === 'IMPORTANTE'
                    ? 'border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/10'
                    : 'border-l-purple-500'
                }`}
              >
                {/* Topo do Recado */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* Badge de Prioridade */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        notice.prioridade === 'URGENTE'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300'
                          : notice.prioridade === 'IMPORTANTE'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300'
                      }`}>
                        {notice.prioridade}
                      </span>

                      {/* Status de Atividade / Validade */}
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          Expirado
                        </span>
                      ) : !notice.ativo ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          Inativo / Pausado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                          Vigente
                        </span>
                      )}

                      <span className="text-[11px] text-gray-400">
                        Publicado em {format(new Date(notice.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} por <strong>{notice.created_by_nome || 'Administração'}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white pt-1">
                      {notice.titulo}
                    </h3>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(notice)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        notice.ativo
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                      title={notice.ativo ? 'Arquivar recado' : 'Reativar recado'}
                    >
                      {notice.ativo ? 'Arquivar' : 'Reativar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(notice)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Editar recado"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Excluir recado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo da Mensagem */}
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50/70 dark:bg-[#0E121A]/60 p-3 rounded-xl border border-gray-200/60 dark:border-[#283042]">
                  {notice.mensagem}
                </p>

                {/* Rodapé: Destinatários, Validade e Painel de Leituras */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                  
                  {/* Destinatários e Prazo */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500">Destino:</span>
                      {notice.destinatario_tipo === 'TODAS' ? (
                        <span className="font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                          Todas as Equipes da Fração
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          {notice.equipes_destinatarias.map(eq => (
                            <span key={eq} className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded text-[10px] border border-blue-200 dark:border-blue-800">
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {notice.prazo_exibicao && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Vigência até: <strong>{format(new Date(notice.prazo_exibicao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Botão de Controle de Leitura */}
                  <button
                    type="button"
                    onClick={() => setSelectedNoticeForReads(notice)}
                    className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 px-2.5 py-1 rounded-xl text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{readCount} {readCount === 1 ? 'policial confirmou leitura' : 'policiais confirmaram leitura'}</span>
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR / EDITAR RECADO */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200 dark:border-[#283042] max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#222938]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {editingNotice ? 'Editar Recado do Turno' : 'Novo Recado / Orientação'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              
              {/* Título */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300 block">
                  Título / Assunto da Diretriz *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atenção redobrada na Operação Corredor Seguro..."
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Mensagem */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300 block">
                  Mensagem / Orientação Detalhada *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva a orientação, pontos de atenção ou diretrizes operacionais para os militares de serviço..."
                  value={formMensagem}
                  onChange={(e) => setFormMensagem(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Prioridade e Prazo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300 block">
                    Grau de Prioridade
                  </label>
                  <select
                    value={formPrioridade}
                    onChange={(e) => setFormPrioridade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="NORMAL">Normal / Informativo</option>
                    <option value="IMPORTANTE">Importante / Atenção</option>
                    <option value="URGENTE">Urgente / Ação Imediata</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300 block">
                    Disponível até (Data / Hora) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formPrazo}
                    onChange={(e) => setFormPrazo(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] text-xs text-gray-900 dark:text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Destinatários */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#222938]">
                <label className="font-bold text-gray-700 dark:text-gray-300 block">
                  Destinatários do Recado
                </label>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 dark:text-gray-200">
                    <input
                      type="radio"
                      name="destinatario_tipo"
                      checked={formDestinatarioTipo === 'TODAS'}
                      onChange={() => setFormDestinatarioTipo('TODAS')}
                      className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>Todas as Equipes (Geral da Fração)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 dark:text-gray-200">
                    <input
                      type="radio"
                      name="destinatario_tipo"
                      checked={formDestinatarioTipo === 'EQUIPES_ESPECIFICAS'}
                      onChange={() => setFormDestinatarioTipo('EQUIPES_ESPECIFICAS')}
                      className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>Equipes Específicas</span>
                  </label>
                </div>

                {formDestinatarioTipo === 'EQUIPES_ESPECIFICAS' && (
                  <div className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] space-y-2 animate-in fade-in">
                    <span className="text-[11px] text-gray-500 font-semibold block">
                      Selecione quais equipes receberão este recado:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {allTeams.map((team) => {
                        const isSelected = formEquipes.includes(team);
                        return (
                          <button
                            key={team}
                            type="button"
                            onClick={() => handleToggleTeam(team)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white dark:bg-[#151A23] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#283042] hover:bg-gray-100'
                            }`}
                          >
                            {team}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#222938]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingNotice ? 'Salvar Alterações' : 'Publicar Recado'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RELATÓRIO DE LEITURAS CONFIRMADAS */}
      {/* ========================================================= */}
      {selectedNoticeForReads && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151A23] rounded-2xl border border-gray-200 dark:border-[#283042] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#222938]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Confirmações de Leitura
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {selectedNoticeForReads.titulo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeForReads(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/50 p-3 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-semibold">
                <span>Total de Confirmações:</span>
                <span className="text-sm font-black font-mono">
                  {selectedNoticeForReads.leituras_confirmadas?.length || 0} militares cientes
                </span>
              </div>

              {(!selectedNoticeForReads.leituras_confirmadas || selectedNoticeForReads.leituras_confirmadas.length === 0) ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Nenhum militar confirmou leitura deste comunicado até o momento.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedNoticeForReads.leituras_confirmadas.map((read, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-[#0E121A] rounded-xl border border-gray-200 dark:border-[#283042] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{read.usuario_nome}</span>
                          <span className="font-mono text-[11px] text-gray-500">({read.numero_pm})</span>
                        </div>
                        <span className="text-[11px] text-gray-400 block">
                          Equipe: <strong>{read.equipe || 'Geral'}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold block">
                          ✓ {format(new Date(read.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-[#222938] text-right">
              <button
                type="button"
                onClick={() => setSelectedNoticeForReads(null)}
                className="btn-secondary py-1.5 px-4 text-xs font-bold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
