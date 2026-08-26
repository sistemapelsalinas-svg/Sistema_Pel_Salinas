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
  Edit, 
  Shield, 
  KeyRound, 
  CheckCircle, 
  Search, 
  X,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function GestaoUsuariosPage() {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUserForInvite, setSelectedUserForInvite] = useState<UserProfile | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Form State Novo Usuário
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

    // Gera senha aleatória temporária de 8 caracteres
    const randomTempPassword = 'pmmg' + Math.floor(1000 + Math.random() * 9000);

    const newUser = storage.addUser({
      ...formData,
      password_hash: randomTempPassword,
      primeiro_acesso: true,
      ativo: true
    });

    setUsers(storage.getUsers());
    setIsNewUserModalOpen(false);
    showToast(`Militar ${newUser.graduacao} ${newUser.nome_guerra} cadastrado com sucesso!`);

    // Abre imediatamente o modal de envio do WhatsApp
    setTempPasswordGenerated(randomTempPassword);
    setSelectedUserForInvite(newUser);

    // Reset Form
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
    showToast('Perfil de acesso atualizado com sucesso.');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === loggedUser?.id) {
      alert('Você não pode excluir o seu próprio usuário logado.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir o acesso deste militar do sistema?')) {
      storage.deleteUser(userId);
      setUsers(storage.getUsers());
      showToast('Usuário removido com sucesso.');
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
        <div className="p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-600 flex items-center gap-2 text-xs font-bold shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ADMINISTRAÇÃO
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Gestão de Militares & Controle de Acesso</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Cadastre novos policiais, defina níveis de acesso (Admin, SOF, Alerta, Equipe) e envie convites automáticos no WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Militar</span>
        </button>
      </div>

      {/* Tabela de Militares Cadastrados */}
      <div className="tactical-card overflow-hidden shadow-sm">
        
        {/* Barra de Busca */}
        <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, Nº PM ou equipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Total: {users.length} Militares
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-gray-800">
                <th className="p-3.5">Militar / Graduação</th>
                <th className="p-3.5">Nº de PM (Login)</th>
                <th className="p-3.5">WhatsApp</th>
                <th className="p-3.5">Equipe Padrão</th>
                <th className="p-3.5">Perfil de Acesso</th>
                <th className="p-3.5 text-center">Status 1º Acesso</th>
                <th className="p-3.5 text-center">Convite WhatsApp</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                  
                  {/* Nome e Graduação */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        {u.graduacao}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{u.nome_guerra}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block max-w-xs">{u.nome_completo}</span>
                      </div>
                    </div>
                  </td>

                  {/* Número de PM */}
                  <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {u.numero_pm}
                  </td>

                  {/* WhatsApp */}
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">
                    {u.whatsapp}
                  </td>

                  {/* Equipe Padrão */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 font-bold text-[11px]">
                      {u.equipe_padrao || '-'}
                    </span>
                  </td>

                  {/* Perfil (Dropdown de Promoção/Rebaixamento) */}
                  <td className="p-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="p-1.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs font-bold focus:outline-none"
                    >
                      <option value="ADMIN">ADMINISTRADOR</option>
                      <option value="SOF">S.O.F. (SALA DE OPS)</option>
                      <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO</option>
                      <option value="EQUIPE">EQUIPE OPERACIONAL</option>
                    </select>
                  </td>

                  {/* Status 1º Acesso */}
                  <td className="p-3.5 text-center">
                    {u.primeiro_acesso ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Senha Provisória
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Senha Cadastrada
                      </span>
                    )}
                  </td>

                  {/* Botão Convite WhatsApp */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleOpenInvite(u)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-400 dark:hover:text-white border border-emerald-500/30 text-xs font-bold transition-all"
                      title="Gerar e Enviar Link do WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Convite</span>
                    </button>
                  </td>

                  {/* Excluir */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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

      {/* Modal de Cadastro de Novo Militar */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="bg-slate-900 dark:bg-black p-5 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Cadastrar Novo Policial Militar</h3>
                  <p className="text-xs text-slate-400">2º Pelotão Salinas / PMMG</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Graduação *
                  </label>
                  <select
                    value={formData.graduacao}
                    onChange={(e) => setFormData({ ...formData, graduacao: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold"
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
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Nome de Guerra *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sd Silva, Cb Moreira"
                    value={formData.nome_guerra}
                    onChange={(e) => setFormData({ ...formData, nome_guerra: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do policial militar"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Número de PM (Login) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 165432-1"
                    value={formData.numero_pm}
                    onChange={(e) => setFormData({ ...formData, numero_pm: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp (DDD + Número) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 38999991234"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Perfil de Acesso
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="EQUIPE">EQUIPE (Rua)</option>
                    <option value="SOF">SOF (Sala de Operações)</option>
                    <option value="ALERTA_HOMICIDIO">ALERTA HOMICÍDIO</option>
                    <option value="ADMIN">ADMINISTRADOR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Equipe Padrão
                  </label>
                  <select
                    value={formData.equipe_padrao}
                    onChange={(e) => setFormData({ ...formData, equipe_padrao: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {DEFAULT_TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>O sistema irá gerar automaticamente a senha temporária e o link de convite no WhatsApp.</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-900/30"
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
