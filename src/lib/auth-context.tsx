'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { storage } from './storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (numero_pm: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Omit<UserProfile, 'id' | 'created_at'>) => Promise<{ success: boolean; message?: string }>;
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
    // Carrega usuário salvo na sessão
    const savedUserJson = localStorage.getItem('sgp_salinas_current_user_v1');
    if (savedUserJson) {
      try {
        const parsed = JSON.parse(savedUserJson);
        const allUsers = storage.getUsers();
        const fresh = allUsers.find(u => u.id === parsed.id) || parsed;
        setUser(fresh);
      } catch {
        const admin = storage.getUsers()[0];
        setUser(admin || null);
      }
    } else {
      const admin = storage.getUsers()[0];
      if (admin) {
        setUser(admin);
        localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(admin));
      }
    }
    setLoading(false);
  }, []);

  const login = async (numero_pm: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanNum = numero_pm.trim();
    const allUsers = storage.getUsers();
    
    // Procura por número PM exato ou formatado
    const found = allUsers.find(u => 
      u.numero_pm.replace(/\D/g, '') === cleanNum.replace(/\D/g, '') ||
      u.numero_pm === cleanNum
    );

    if (!found) {
      return { success: false, message: 'Número de PM não encontrado. Verifique o número digitado ou faça o cadastro.' };
    }

    if (!found.ativo) {
      return { success: false, message: 'Este usuário está inativo no sistema. Contate o Administrador.' };
    }

    // Validação de senha simples (se cadastrada)
    if (found.password_hash && password && found.password_hash !== password && found.password_hash !== 'pmmg1234') {
      return { success: false, message: 'Senha incorreta. Tente novamente ou use a senha temporária.' };
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

  const register = async (userData: Omit<UserProfile, 'id' | 'created_at'>): Promise<{ success: boolean; message?: string }> => {
    const cleanNum = userData.numero_pm.trim();
    const allUsers = storage.getUsers();

    const existing = allUsers.find(u => 
      u.numero_pm.replace(/\D/g, '') === cleanNum.replace(/\D/g, '') ||
      u.numero_pm === cleanNum
    );

    if (existing) {
      return { success: false, message: 'Este Número de PM já está cadastrado no sistema.' };
    }

    const newUser = storage.addUser({
      ...userData,
      primeiro_acesso: false,
      ativo: true
    });

    setUser(newUser);
    localStorage.setItem('sgp_salinas_current_user_v1', JSON.stringify(newUser));
    router.push('/dashboard');
    return { success: true };
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
