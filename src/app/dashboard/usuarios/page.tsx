'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { DEFAULT_TEAMS } from '@/lib/mock-data';
import { UserProfile, UserRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { RoleBadge } from '@/components/role-badge';
import { WhatsAppInviteModal } from '@/components/whatsapp-invite-modal';
import { 
  Users, 
  UserPlus, 
  Send, 
  Trash2, 
  CheckCircle, 
  Search, 
  X,
  Sparkles
} from 'lucide-react';

export default function GestaoUsuariosPage() {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUserForInvite, setSelectedUserForInvite] = useState<UserProfile | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    numero_pm: '',
    nome_completo: '',
    nome_guerra: '',
    graduacao: 'Sd',
    whatsapp: '38999991234',
    role: 'EQUIPE' as UserRole,
    equipe_padrao: 'ALFA 1'
  });

  useEffect(() => {
    setUsers(storage.getUsers());
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
      ativo: true
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
      equipe_padrao: 'ALFA 1'
    });
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

  const filteredUsers = users.filter(u => 
    u.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.numero_pm.includes(searchTerm) ||
    u.equipe_padrao.toLowerCase().includes(searchTerm.toLowerCase())
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
            Cadastro de efetivo policial, permissões por função e disparo de convites WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Militar</span>
        </button>
      </div>

      {/* Tabela de Usuários (Untitled UI Table) */}
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
            Total: {users.length} Militares
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
                <th className="p-3.5 text-center">Status 1º Acesso</th>
                <th className="p-3.5 text-center">Convite</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((u) => (
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
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors"
                      title="Excluir militar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                    {DEFAULT_TEAMS.map((t) => (
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

      {/* Modal WhatsApp Invite Link */}
      {selectedUserForInvite && (
        <WhatsAppInviteModal
          user={selectedUserForInvite}
          tempPassword={tempPasswordGenerated}
          isOpen={!!selectedUserForInvite}
          onClose={() => setSelectedUserForInvite(null)}
        />
      )}

    </div>
  );
}
