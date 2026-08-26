'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Shield, KeyRound, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const { login } = useAuth();
  const [numeroPm, setNumeroPm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroPm.trim()) {
      setError('Por favor, informe seu Número de PM.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(numeroPm, password);
    if (!res.success) {
      setError(res.message || 'Erro ao realizar login.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (pm: string) => {
    setNumeroPm(pm);
    setPassword('pmmg1234');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0C111D] flex flex-col justify-between p-4 sm:p-6 text-gray-900 dark:text-gray-100 relative">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">SGP Salinas</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">2º Pel / 2ª Cia PM Ind / 11ª RPM</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Card (Untitled UI Auth Card) */}
      <div className="max-w-md w-full mx-auto my-8 z-10">
        <div className="untitled-card p-8 shadow-md">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Acesse sua conta
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Informe seu Nº de PM e senha para acessar o sistema
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-error-50 dark:bg-error-950/50 border border-error-200 dark:border-error-800 rounded-xl flex items-center gap-2.5 text-xs text-error-700 dark:text-error-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-error-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Número de Polícia (Nº PM)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: 100001-1"
                  value={numeroPm}
                  onChange={(e) => setNumeroPm(e.target.value)}
                  className="untitled-input pl-10 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">1º acesso? Use a senha provisória</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="untitled-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Badges (Untitled UI Micro Cards) */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Acesso Rápido para Demonstração:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('100001-1')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-colors"
              >
                <span className="text-[10px] font-semibold text-error-600 dark:text-error-400 block">1. ADMIN</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">Ten Leonardo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('100002-2')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-colors"
              >
                <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 block">2. SOF CENTRAL</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">Sgt Moreira</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('100003-3')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-colors"
              >
                <span className="text-[10px] font-semibold text-warning-600 dark:text-warning-400 block">3. ALERTA HOMICÍDIO</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">Cb Juliana</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('100004-4')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-colors"
              >
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 block">4. EQUIPE RUA</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">Sd Marcos</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 z-10">
        <p>Polícia Militar de Minas Gerais — 2º Pelotão de Salinas</p>
      </div>

    </div>
  );
}
