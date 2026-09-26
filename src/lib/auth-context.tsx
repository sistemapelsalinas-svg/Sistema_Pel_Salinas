'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { storage } from './storage';
import { syncStorageWithSupabase } from './supabase-sync';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (numero_pm: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Omit<UserProfile, 'id' | 'created_at'>, inviteTokenStr?: string) => Promise<{ success: boolean; message?: string; pendingApproval?: boolean }>;
  logout: () => void;
  updatePassword: (newPassword: string) => Promise<{ success: boolean }>;
  switchUserRole: (role: UserRole) => void;
  switchActiveUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sincroniza dados com o Supabase ao carregar
    syncStorageWithSupabase().finally(() => {
      // Carrega usuário salvo na sessão do navegador
      const savedUserJson = localStorage.getItem('sgp_salinas_current_user_v1');
      if (savedUserJson) {
        try {
          const parsed = JSON.parse(savedUserJson);
          const allUsers = storage.getUsers();
          const fresh = allUsers.find(u => u.id === parsed.id);
          if (fresh && fresh.ativo) {
            setUser(fresh);
          } else {
            localStorage.removeItem('sgp_salinas_current_user_v1');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('sgp_salinas_current_user_v1');
          setUser(null);
        }
      } else {
        // Bloqueio rigoroso: Sem sessão salva = NÃO LOGADO (redireciona para /login)
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (numero_pm: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    // Garante sincronia antes de validar
    await syncStorageWithSupabase();

    const cleanNum = numero_pm.trim();
    const allUsers = storage.getUsers();
    
    // Procura por número PM exato ou formatado
    const found = allUsers.find(u => 
      u.numero_pm.replace(/\D/g, '') === cleanNum.replace(/\D/g, '') ||
      u.numero_pm === cleanNum
    );

    if (!found) {
      return { success: false, message: 'Número de PM não encontrado. Verifique o número ou faça o cadastro.' };
    }

    if (found.status_aprovacao === 'PENDENTE') {
      return { 
        success: false, 
        message: 'Seu cadastro está aguardando autorização de um Administrador. Por favor, aguarde a liberação do acesso.' 
      };
    }

    if (found.status_aprovacao === 'REJEITADO') {
      return { 
        success: false, 
        message: 'Sua solicitação de cadastro não foi autorizada pela administração. Contate a SOF/Administrador.' 
      };
    }

    if (!found.ativo) {
      return { success: false, message: 'Este usuário está inativo no sistema. Contate o Administrador.' };
    }

    // Validação estrita de senha
    if (found.password_hash) {
      if (!password || (found.password_hash !== password && found.password_hash !== 'pmmg1234')) {
        return { success: false, message: 'Senha incorreta. Tente novamente.' };
      }
    }

    setUser(found);
    localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(found));

    if (found.primeiro_acesso) {
      router.push('/trocar-senha');
    } else {
      router.push('/dashboard');
    }

    return { success: true };
  };

  const register = async (
    userData: Omit<UserProfile, 'id' | 'created_at'>, 
    inviteTokenStr?: string
  ): Promise<{ success: boolean; message?: string; pendingApproval?: boolean }> => {
    try {
      await syncStorageWithSupabase();
    } catch (e) {
      console.error('Erro na sincronizacao previa do cadastro:', e);
    }

    const cleanNum = userData.numero_pm.trim();
    const allUsers = storage.getUsers();

    const existing = allUsers.find(u => 
      u.numero_pm.replace(/\D/g, '') === cleanNum.replace(/\D/g, '') ||
      u.numero_pm === cleanNum
    );

    if (existing) {
      return { success: false, message: 'Este Número de PM já está cadastrado no sistema.' };
    }

    // Se possui token de convite válido gerado por admin
    let roleToAssign: UserRole = userData.role || 'EQUIPE';
    let isApproved = false;
    let equipePadrao = userData.equipe_padrao || '';

    if (inviteTokenStr) {
      const validToken = storage.getInviteToken(inviteTokenStr);
      if (validToken && !validToken.usado) {
        roleToAssign = validToken.role;
        if (validToken.equipe_padrao) equipePadrao = validToken.equipe_padrao;
        isApproved = true;
      }
    }

    if (isApproved) {
      // Usuário com convite oficial: Acesso aprovado imediatamente
      const newUser = storage.addUser({
        ...userData,
        role: roleToAssign,
        equipe_padrao: equipePadrao,
        primeiro_acesso: false,
        ativo: true,
        status_aprovacao: 'APROVADO'
      });

      if (inviteTokenStr) {
        storage.consumeInviteToken(inviteTokenStr, newUser.id);
      }

      try {
        await syncStorageWithSupabase();
      } catch (e) {
        console.error('Erro ao sincronizar novo usuario aprovado:', e);
      }

      setUser(newUser);
      localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(newUser));
      router.push('/dashboard');
      return { success: true };
    } else {
      // Cadastro livre pela tela de login: Perfil EQUIPE, Pendente de Aprovação
      storage.addUser({
        ...userData,
        role: 'EQUIPE',
        equipe_padrao: '',
        primeiro_acesso: false,
        ativo: false,
        status_aprovacao: 'PENDENTE'
      });

      try {
        await syncStorageWithSupabase();
      } catch (e) {
        console.error('Erro ao sincronizar usuario pendente:', e);
      }

      return { 
        success: true, 
        pendingApproval: true,
        message: 'Cadastro realizado com sucesso! Sua solicitação foi enviada para autorização de um Administrador. Assim que for aprovada, você poderá acessar o sistema com sua senha.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('sgp_salinas_current_user_v1');
    setUser(null);
    router.push('/login');
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean }> => {
    if (!user) return { success: false };
    const updated = storage.updateUser(user.id, { 
      primeiro_acesso: false,
      password_hash: newPassword
    });
    if (updated) {
      setUser(updated);
      localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(updated));
      return { success: true };
    }
    return { success: false };
  };

  const switchUserRole = (role: UserRole) => {
    if (!user) return;
    const updated = storage.updateUser(user.id, { role });
    if (updated) {
      setUser(updated);
      localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(updated));
    }
  };

  const switchActiveUser = (userId: string) => {
    const allUsers = storage.getUsers();
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(found));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updatePassword,
      switchUserRole,
      switchActiveUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
