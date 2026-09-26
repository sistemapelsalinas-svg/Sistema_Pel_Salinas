'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { UserProfile, UserRole, RegistrationInviteToken } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { RoleBadge } from '@/components/role-badge';
import { WhatsAppInviteModal } from '@/components/whatsapp-invite-modal';
import { generateWhatsAppDirectInviteLink } from '@/lib/validation';
import { syncStorageWithSupabase } from '@/lib/supabase-sync';
import { 
  Users, 
  UserPlus, 
  Send, 
  Trash2, 
  CheckCircle, 
  Search, 
  X,
  Sparkles,
  UserCheck,
  UserX,
  Link2,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Edit,
  Pencil,
  Lock,
  KeyRound
} from 'lucide-react';

export default function GestaoUsuariosPage() {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Abas de visualização: Ativos x Pendentes de Autorização
  const [activeTab, setActiveTab] = useState<'ATIVOS' | 'PENDENTES'>('ATIVOS');

  // Modal de Cadastro Manual com Senha Provisória
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUserForInvite, setSelectedUserForInvite] = useState<UserProfile | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState('');

  // Modal de Gerar Link Direto de Cadastro
  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);
  const [inviteLinkData, setInviteLinkData] = useState({
    role: 'EQUIPE' as UserRole,
    equipe_padrao: 'ALFA 1',
    graduacao_sugerida: 'Sd',
    nome_sugerido: '',
    numero_pm_sugerido: '',
    whatsapp: ''
  });
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal/Ação de Aprovação de Usuário Pendente
  const [approvingUser, setApprovingUser] = useState<UserProfile | null>(null);
  const [approveRole, setApproveRole] = useState<UserRole>('EQUIPE');
  const [approveEquipe, setApproveEquipe] = useState<string>('ALFA 1');

  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal de Edição de Militar pelo Administrador
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    numero_pm: '',
    nome_completo: '',
    nome_guerra: '',
    graduacao: 'Sd',
    whatsapp: '',
    role: 'EQUIPE' as UserRole,
    equipe_padrao: 'ALFA 1',
    ativo: true,
    nova_senha: ''
  });

  const [formData, setFormData] = useState({
    numero_pm: '',
    nome_completo: '',
    nome_guerra: '',
    graduacao: 'Sd',
    whatsapp: '38999991234',
    role: 'EQUIPE' as UserRole,
    equipe_padrao: 'ALFA 1'
  });

  const loadData = () => {
    setUsers(storage.getUsers());
    const loadedTeams = storage.getTeams();
    setTeams(loadedTeams);
    if (loadedTeams.length > 0) {
      setFormData(prev => ({ ...prev, equipe_padrao: loadedTeams[0] }));
      setInviteLinkData(prev => ({ ...prev, equipe_padrao: loadedTeams[0] }));
      setApproveEquipe(loadedTeams[0]);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncStorageWithSupabase();
      loadData();
      showToast('Dados sincronizados com a nuvem.');
    } catch {
      showToast('Erro ao sincronizar com a nuvem.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    handleSync();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero_pm || !formData.nome_completo || !formData.whatsapp) return;

    const randomTempPassword = 'pmmg' + Math.floor(1000 + Math.random() * 9000);

    const newUser = storage.addUser({
      ...formData,
      password_hash: randomTempPassword,
      primeiro_acesso: true,
      ativo: true,
      status_aprovacao: 'APROVADO'
    });

    setUsers(storage.getUsers());
    setIsNewUserModalOpen(false);
    showToast(`Militar ${newUser.graduacao} ${newUser.nome_guerra} cadastrado.`);

    setTempPasswordGenerated(randomTempPassword);
    setSelectedUserForInvite(newUser);

    setFormData({
      numero_pm: '',
      nome_completo: '',
      nome_guerra: '',
      graduacao: 'Sd',
      whatsapp: '38999991234',
      role: 'EQUIPE',
      equipe_padrao: teams[0] || 'ALFA 1'
    });
  };

  // Gerar Link de Convite
  const handleGenerateInviteLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedUser) return;

    const createdToken = storage.createInviteToken({
      role: inviteLinkData.role,
      equipe_padrao: inviteLinkData.equipe_padrao,
      graduacao_sugerida: inviteLinkData.graduacao_sugerida,
      nome_sugerido: inviteLinkData.nome_sugerido.trim() || undefined,
      numero_pm_sugerido: inviteLinkData.numero_pm_sugerido.trim() || undefined,
      criado_por: loggedUser.nome_guerra,
      dias_validade: 7
    });

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sgp-salinas.vercel.app';
    const fullUrl = `${origin}/login?convite=${createdToken.token}`;
    setGeneratedInviteUrl(fullUrl);
  };

  // Aprovar usuário pendente
  const handleConfirmApproval = () => {
    if (!approvingUser || !loggedUser) return;
    storage.approveUser(approvingUser.id, loggedUser, approveRole, approveEquipe);
    loadData();
    setApprovingUser(null);
    showToast(`Cadastro de ${approvingUser.nome_guerra} autorizado com sucesso como ${approveRole}.`);
  };

  // Recusar/Rejeitar usuário pendente
  const handleRejectPendingUser = (userId: string, nome: string) => {
    if (confirm(`Deseja realmente recusar e remover o pedido de cadastro de ${nome}?`)) {
      storage.rejectUser(userId);
      loadData();
      showToast(`Pedido de cadastro de ${nome} recusado.`);
    }
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    const rawGuerra = u.nome_guerra || '';
    const cleanGuerra = rawGuerra.replace(new RegExp(`^${u.graduacao}\\s*`, 'i'), '');
    setEditFormData({
      numero_pm: u.numero_pm || '',
      nome_completo: u.nome_completo || '',
      nome_guerra: cleanGuerra || rawGuerra,
      graduacao: u.graduacao || 'Sd',
      whatsapp: u.whatsapp || '',
      role: u.role || 'EQUIPE',
      equipe_padrao: u.equipe_padrao || (teams[0] || 'ALFA 1'),
      ativo: u.ativo ?? true,
      nova_senha: ''
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFormData.numero_pm.trim() || !editFormData.nome_guerra.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const fullNomeGuerra = `${editFormData.graduacao} ${editFormData.nome_guerra.trim()}`;
    const updates: Partial<UserProfile> = {
      graduacao: editFormData.graduacao,
      nome_guerra: fullNomeGuerra,
      nome_completo: editFormData.nome_completo.trim() || fullNomeGuerra,
      numero_pm: editFormData.numero_pm.trim(),
      whatsapp: editFormData.whatsapp.trim(),
      role: editFormData.role,
      equipe_padrao: editFormData.equipe_padrao,
      ativo: editFormData.ativo
    };

    if (editFormData.nova_senha.trim()) {
      updates.password_hash = editFormData.nova_senha.trim();
      updates.primeiro_acesso = false;
    }

    storage.updateUser(editingUser.id, updates);
    loadData();
    setEditingUser(null);
    showToast(`Militar ${fullNomeGuerra} atualizado com sucesso.`);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    storage.updateUser(userId, { role: newRole });
    setUsers(storage.getUsers());
    showToast('Perfil de acesso atualizado.');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === loggedUser?.id) {
      alert('Você não pode excluir o seu próprio usuário logado.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir o acesso deste militar do sistema?')) {
      storage.deleteUser(userId);
      setUsers(storage.getUsers());
      showToast('Usuário removido.');
    }
  };

  const handleOpenInvite = (u: UserProfile) => {
    const tempPass = 'pmmg' + Math.floor(1000 + Math.random() * 9000);
    setTempPasswordGenerated(tempPass);
    setSelectedUserForInvite(u);
  };

  const approvedUsers = users.filter(u => u.status_aprovacao !== 'PENDENTE');
  const pendingUsers = users.filter(u => u.status_aprovacao === 'PENDENTE');

  const filteredApprovedUsers = approvedUsers.filter(u => 
    u.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.numero_pm.includes(searchTerm) ||
    (u.equipe_padrao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingUsers = pendingUsers.filter(u => 
    u.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.numero_pm.includes(searchTerm)
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Militares & Gestão de Acesso
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cadastro de efetivo policial, autorização de novos cadastros e links de convite.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary"
            title="Sincronizar dados em tempo real com a nuvem"
          >
            <RefreshCw className={`w-4 h-4 text-brand-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</span>
          </button>

          <button
            onClick={() => {
              setGeneratedInviteUrl(null);
              setIsInviteLinkModalOpen(true);
            }}
            className="btn-secondary"
          >
            <Link2 className="w-4 h-4 text-brand-600" />
            <span>Gerar Link de Cadastro</span>
          </button>

          <button
            onClick={() => setIsNewUserModalOpen(true)}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Militar</span>
          </button>
        </div>
      </div>

      {/* Segmented View Switcher: Ativos x Pendentes */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1 bg-gray-100 dark:bg-[#1E2636] rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ATIVOS');
              handleSync();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ATIVOS'
                ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Efetivo Ativo ({approvedUsers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('PENDENTES');
              handleSync();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'PENDENTES'
                ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Aguardando Autorização</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-gray-500 font-medium">
          {activeTab === 'ATIVOS' ? `${approvedUsers.length} militares ativos` : `${pendingUsers.length} cadastros pendentes`}
        </span>
      </div>

      {activeTab === 'PENDENTES' ? (
        /* TABELA DE USUÁRIOS PENDENTES DE AUTORIZAÇÃO */
        <div className="untitled-card overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#1F242F] flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar solicitação pendente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="untitled-input pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Cadastros realizados na tela de login aguardando aprovação</span>
            </div>
          </div>

          {filteredPendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500 space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="font-semibold text-sm text-gray-600 dark:text-gray-300">Nenhum cadastro pendente de autorização</p>
              <p className="text-xs">Todos os pedidos de novos militares foram devidamente autorizados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#0C111D] text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200 dark:border-[#1F242F]">
                    <th className="p-3.5">Militar / Graduação</th>
                    <th className="p-3.5">Nº de PM (Login)</th>
                    <th className="p-3.5">WhatsApp</th>
                    <th className="p-3.5">Perfil Solicitado</th>
                    <th className="p-3.5">Data Solicitação</th>
                    <th className="p-3.5 text-center">Ações de Autorização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredPendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-xs">
                            {u.graduacao}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white block">{u.nome_guerra}</span>
                            <span className="text-[11px] text-gray-500 truncate block max-w-xs">{u.nome_completo}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-medium text-brand-600 dark:text-brand-400">
                        {u.numero_pm}
                      </td>

                      <td className="p-3.5 text-gray-600 dark:text-gray-300 font-mono">
                        {u.whatsapp}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          Básico ({u.role || 'EQUIPE'})
                        </span>
                      </td>

                      <td className="p-3.5 text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setApprovingUser(u);
                              setApproveRole('EQUIPE');
                              setApproveEquipe(teams[0] || 'ALFA 1');
                            }}
                            className="btn-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                            title="Autorizar e definir perfil"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Autorizar</span>
                          </button>
                          <button
                            onClick={() => handleRejectPendingUser(u.id, u.nome_guerra)}
                            className="btn-secondary py-1 px-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Recusar cadastro"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Recusar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TABELA DE USUÁRIOS ATIVOS */
        <div className="untitled-card overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-[#1F242F] flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, Nº PM ou equipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="untitled-input pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Total: {filteredApprovedUsers.length} Militares
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#0C111D] text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200 dark:border-[#1F242F]">
                  <th className="p-3.5">Militar / Graduação</th>
                  <th className="p-3.5">Nº de PM (Login)</th>
                  <th className="p-3.5">WhatsApp</th>
                  <th className="p-3.5">Equipe Padrão</th>
                  <th className="p-3.5">Perfil de Acesso</th>
                  <th className="p-3.5 text-center">Status Acesso</th>
                  <th className="p-3.5 text-center">Convite</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredApprovedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    
                    {/* Nome e Avatar */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-bold text-xs">
                          {u.graduacao}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block">{u.nome_guerra}</span>
                          <span className="text-[11px] text-gray-500 truncate block max-w-xs">{u.nome_completo}</span>
                        </div>
                      </div>
                    </td>

                    {/* Número de PM */}
                    <td className="p-3.5 font-mono font-medium text-brand-600 dark:text-brand-400">
                      {u.numero_pm}
                    </td>

                    {/* WhatsApp */}
                    <td className="p-3.5 text-gray-600 dark:text-gray-300 font-mono">
                      {u.whatsapp}
                    </td>

                    {/* Equipe Padrão */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-[11px] text-gray-700 dark:text-gray-300">
                        {u.equipe_padrao || '-'}
                      </span>
                    </td>

                    {/* Perfil Dropdown */}
                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="p-1.5 bg-white dark:bg-[#0C111D] border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="ADMIN">ADMINISTRADOR</option>
                        <option value="SOF">SOF CENTRAL</option>
                        <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO</option>
                        <option value="EQUIPE">EQUIPE RUA</option>
                      </select>
                    </td>

                    {/* 1º Acesso */}
                    <td className="p-3.5 text-center">
                      {u.primeiro_acesso ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-warning-50 text-warning-700 dark:bg-warning-950/60 dark:text-warning-300 border border-warning-200 dark:border-warning-800">
                          Senha Provisória
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                          Ativo
                        </span>
                      )}
                    </td>

                    {/* Enviar Convite */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenInvite(u)}
                        className="btn-secondary py-1 px-2.5 text-xs"
                        title="Enviar convite de acesso via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5 text-brand-600" />
                        <span>WhatsApp</span>
                      </button>
                    </td>

                    {/* Ação */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                          title="Editar dados e senha do militar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors"
                          title="Excluir militar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Cadastrar Novo Policial Militar</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">2º Pelotão Salinas / PMMG</p>
              </div>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Graduação *
                  </label>
                  <select
                    value={formData.graduacao}
                    onChange={(e) => setFormData({ ...formData, graduacao: e.target.value })}
                    className="untitled-input font-medium"
                  >
                    <option value="Sd">Sd</option>
                    <option value="Cb">Cb</option>
                    <option value="3º Sgt">3º Sgt</option>
                    <option value="2º Sgt">2º Sgt</option>
                    <option value="1º Sgt">1º Sgt</option>
                    <option value="Sub Ten">Sub Ten</option>
                    <option value="Ten">Ten</option>
                    <option value="Cap">Cap</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome de Guerra *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sd Silva, Cb Moreira"
                    value={formData.nome_guerra}
                    onChange={(e) => setFormData({ ...formData, nome_guerra: e.target.value })}
                    className="untitled-input font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do policial militar"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="untitled-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de PM (Login) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 165432-1"
                    value={formData.numero_pm}
                    onChange={(e) => setFormData({ ...formData, numero_pm: e.target.value })}
                    className="untitled-input font-mono font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp (DDD + Número) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 38999991234"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="untitled-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Perfil de Acesso
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="untitled-input font-medium"
                  >
                    <option value="EQUIPE">EQUIPE RUA</option>
                    <option value="SOF">SOF CENTRAL</option>
                    <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO</option>
                    <option value="ADMIN">ADMINISTRADOR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Equipe Padrão
                  </label>
                  <select
                    value={formData.equipe_padrao}
                    onChange={(e) => setFormData({ ...formData, equipe_padrao: e.target.value })}
                    className="untitled-input"
                  >
                    {teams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl border border-brand-200 dark:border-brand-800 flex items-center gap-2 text-brand-800 dark:text-brand-300">
                <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>O sistema irá gerar automaticamente a senha provisória e o convite no WhatsApp.</span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Salvar e Gerar Convite
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal WhatsApp Invite Link (Senha Provisória) */}
      {selectedUserForInvite && (
        <WhatsAppInviteModal
          user={selectedUserForInvite}
          tempPassword={tempPasswordGenerated}
          isOpen={!!selectedUserForInvite}
          onClose={() => setSelectedUserForInvite(null)}
        />
      )}

      {/* Modal: Gerar Link de Cadastro Direto Autorizado */}
      {isInviteLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">Gerar Link de Cadastro Oficial</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">O policial criará sua conta e definirá sua senha diretamente</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteLinkModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedInviteUrl ? (
              <form onSubmit={handleGenerateInviteLink} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Perfil Pré-Autorizado *
                    </label>
                    <select
                      value={inviteLinkData.role}
                      onChange={(e) => setInviteLinkData({ ...inviteLinkData, role: e.target.value as UserRole })}
                      className="untitled-input font-medium"
                    >
                      <option value="EQUIPE">EQUIPE RUA</option>
                      <option value="SOF">SOF CENTRAL</option>
                      <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO</option>
                      <option value="ADMIN">ADMINISTRADOR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Equipe Padrão
                    </label>
                    <select
                      value={inviteLinkData.equipe_padrao}
                      onChange={(e) => setInviteLinkData({ ...inviteLinkData, equipe_padrao: e.target.value })}
                      className="untitled-input"
                    >
                      {teams.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Graduação (Opcional)
                    </label>
                    <select
                      value={inviteLinkData.graduacao_sugerida}
                      onChange={(e) => setInviteLinkData({ ...inviteLinkData, graduacao_sugerida: e.target.value })}
                      className="untitled-input font-medium"
                    >
                      <option value="Sd">Sd</option>
                      <option value="Cb">Cb</option>
                      <option value="3º Sgt">3º Sgt</option>
                      <option value="2º Sgt">2º Sgt</option>
                      <option value="1º Sgt">1º Sgt</option>
                      <option value="Sub Ten">Sub Ten</option>
                      <option value="Ten">Ten</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome de Guerra (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Moreira, Silva"
                      value={inviteLinkData.nome_sugerido}
                      onChange={(e) => setInviteLinkData({ ...inviteLinkData, nome_sugerido: e.target.value })}
                      className="untitled-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nº PM (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 175.432-1"
                      value={inviteLinkData.numero_pm_sugerido}
                      onChange={(e) => setInviteLinkData({ ...inviteLinkData, numero_pm_sugerido: e.target.value })}
                      className="untitled-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      WhatsApp para Envio Direto
                    </label>
                    <input
                      type="text"
                      placeholder="38999991234"
                      value={inviteLinkData.whatsapp}
                      onChange={(e) => setInviteLinkData({ ...inviteLinkData, whatsapp: e.target.value })}
                      className="untitled-input font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl border border-brand-200 dark:border-brand-800 flex items-center gap-2 text-brand-800 dark:text-brand-300 text-[11px]">
                  <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>O link terá validade de 7 dias e autorizará automaticamente o usuário com a função escolhida.</span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteLinkModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Gerar Link de Cadastro</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Link Criado com Sucesso!</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Perfil pré-autorizado: <strong className="font-semibold text-gray-900 dark:text-white uppercase">{inviteLinkData.role}</strong>
                    {inviteLinkData.equipe_padrao ? ` · Equipe: ${inviteLinkData.equipe_padrao}` : ''}
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Link de Acesso Autorizado:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteUrl}
                      className="untitled-input font-mono text-[11px] bg-gray-50 dark:bg-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (generatedInviteUrl) {
                          navigator.clipboard.writeText(generatedInviteUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }
                      }}
                      className="btn-secondary py-2 px-3 flex-shrink-0"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedInviteUrl(null);
                      setIsInviteLinkModalOpen(false);
                    }}
                    className="btn-secondary"
                  >
                    Concluir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!generatedInviteUrl) return;
                      const waUrl = generateWhatsAppDirectInviteLink(
                        inviteLinkData.whatsapp,
                        generatedInviteUrl,
                        inviteLinkData.role,
                        inviteLinkData.equipe_padrao,
                        inviteLinkData.nome_sugerido
                      );
                      window.open(waUrl, '_blank');
                    }}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar no WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Autorização de Usuário Pendente */}
      {approvingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">Autorizar Cadastro de Militar</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Defina a função de acesso e equipe padrão</p>
                </div>
              </div>
              <button
                onClick={() => setApprovingUser(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-gray-50 dark:bg-[#0C111D] rounded-xl border border-gray-200 dark:border-gray-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Militar:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{approvingUser.nome_guerra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nome Completo:</span>
                  <span className="text-gray-700 dark:text-gray-300">{approvingUser.nome_completo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nº de PM:</span>
                  <span className="font-mono font-medium text-brand-600 dark:text-brand-400">{approvingUser.numero_pm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">WhatsApp:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{approvingUser.whatsapp}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Função / Perfil de Acesso a Conceder *
                </label>
                <select
                  value={approveRole}
                  onChange={(e) => setApproveRole(e.target.value as UserRole)}
                  className="untitled-input font-medium"
                >
                  <option value="EQUIPE">EQUIPE RUA (Padrão Operacional)</option>
                  <option value="SOF">SOF CENTRAL (Lançamento e Turno)</option>
                  <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO (Triagem e Risco)</option>
                  <option value="ADMIN">ADMINISTRADOR (Gestão Total)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equipe Padrão
                </label>
                <select
                  value={approveEquipe}
                  onChange={(e) => setApproveEquipe(e.target.value)}
                  className="untitled-input"
                >
                  {teams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovingUser(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirmar e Liberar Acesso</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Militar pelo Administrador */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">Editar Militar & Acesso</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Atualização cadastral e controle de credenciais</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-xs overflow-y-auto">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Graduação *
                  </label>
                  <select
                    value={editFormData.graduacao}
                    onChange={(e) => setEditFormData({ ...editFormData, graduacao: e.target.value })}
                    className="untitled-input font-medium"
                  >
                    <option value="Sd">Sd</option>
                    <option value="Cb">Cb</option>
                    <option value="3º Sgt">3º Sgt</option>
                    <option value="2º Sgt">2º Sgt</option>
                    <option value="1º Sgt">1º Sgt</option>
                    <option value="Sub Ten">Sub Ten</option>
                    <option value="Ten">Ten</option>
                    <option value="Cap">Cap</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome de Guerra *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Silva, Moreira"
                    value={editFormData.nome_guerra}
                    onChange={(e) => setEditFormData({ ...editFormData, nome_guerra: e.target.value })}
                    className="untitled-input font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do policial militar"
                  value={editFormData.nome_completo}
                  onChange={(e) => setEditFormData({ ...editFormData, nome_completo: e.target.value })}
                  className="untitled-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de PM (Login) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 165432-1"
                    value={editFormData.numero_pm}
                    onChange={(e) => setEditFormData({ ...editFormData, numero_pm: e.target.value })}
                    className="untitled-input font-mono font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 38999991234"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="untitled-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Perfil de Acesso (Função) *
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                    className="untitled-input font-medium"
                  >
                    <option value="EQUIPE">EQUIPE RUA</option>
                    <option value="SOF">SOF CENTRAL</option>
                    <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO</option>
                    <option value="ADMIN">ADMINISTRADOR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Equipe Padrão
                  </label>
                  <select
                    value={editFormData.equipe_padrao}
                    onChange={(e) => setEditFormData({ ...editFormData, equipe_padrao: e.target.value })}
                    className="untitled-input"
                  >
                    {teams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Ativo */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#0C111D] rounded-xl border border-gray-200 dark:border-gray-800">
                <input
                  type="checkbox"
                  id="edit_ativo"
                  checked={editFormData.ativo}
                  onChange={(e) => setEditFormData({ ...editFormData, ativo: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="edit_ativo" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Militar Ativo (Permitir acesso ao sistema)
                </label>
              </div>

              {/* Redefinir Senha */}
              <div className="p-3.5 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-800/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-brand-800 dark:text-brand-300 font-semibold">
                  <KeyRound className="w-4 h-4" />
                  <span>Redefinir Senha de Acesso (Opcional)</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Preencha apenas se desejar alterar a senha do militar manualmente agora. Caso deixe em branco, a senha atual será mantida.
                </p>
                <input
                  type="text"
                  placeholder="Deixe em branco para manter a senha atual ou digite a nova"
                  value={editFormData.nova_senha}
                  onChange={(e) => setEditFormData({ ...editFormData, nova_senha: e.target.value })}
                  className="untitled-input bg-white dark:bg-[#0C111D] font-mono"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
