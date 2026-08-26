'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-white">SGP SALINAS</h1>
            <p className="text-[11px] text-slate-400">2º Pel / 2ª Cia PM Ind / 11ª RPM</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 z-10">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/40 mb-4 ring-4 ring-emerald-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">Acesso ao Sistema</h2>
            <p className="text-xs text-slate-400 mt-1">
              Gestão de Operações, Metas, Escalas e Prevenção Criminal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-3 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Número de Polícia (Nº PM)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: 100001-1 ou 100001"
                  value={numeroPm}
                  onChange={(e) => setNumeroPm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Senha de Acesso
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">Primeiro acesso? Use a senha do convite</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Test Badges for Immediate Testing */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Acesso Rápido de Teste (4 Perfis):
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('100001-1')}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-red-900/40 rounded-lg text-left transition-colors"
              >
                <span className="text-[10px] font-bold text-red-400 block">1. ADMIN</span>
                <span className="text-xs font-semibold text-white truncate block">Ten Leonardo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('100002-2')}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-blue-900/40 rounded-lg text-left transition-colors"
              >
                <span className="text-[10px] font-bold text-blue-400 block">2. SOF (CENTRAL)</span>
                <span className="text-xs font-semibold text-white truncate block">Sgt Moreira</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('100003-3')}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-amber-900/40 rounded-lg text-left transition-colors"
              >
                <span className="text-[10px] font-bold text-amber-400 block">3. ALERTA HOMICÍDIO</span>
                <span className="text-xs font-semibold text-white truncate block">Cb Juliana</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('100004-4')}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-emerald-900/40 rounded-lg text-left transition-colors"
              >
                <span className="text-[10px] font-bold text-emerald-400 block">4. EQUIPE (RUA)</span>
                <span className="text-xs font-semibold text-white truncate block">Sd Marcos</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 z-10">
        <p>Polícia Militar de Minas Gerais — 2º Pelotão de Salinas</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Segurança Pública e Gestão Operacional Integrada</p>
      </div>

    </div>
  );
}
