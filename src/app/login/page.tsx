'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Shield, KeyRound, User, ArrowRight, AlertCircle, UserPlus, Phone, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'CADASTRO'>('LOGIN');

  // Login Form (100% limpo, sem pré-preenchimento)
  const [numeroPm, setNumeroPm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cadastro Form (Sem especificação de equipe)
  const [cadGraduacao, setCadGraduacao] = useState('Sd');
  const [cadNomeGuerra, setCadNomeGuerra] = useState('');
  const [cadNomeCompleto, setCadNomeCompleto] = useState('');
  const [cadNumeroPm, setCadNumeroPm] = useState('');
  const [cadWhatsapp, setCadWhatsapp] = useState('');
  const [cadPassword, setCadPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroPm.trim()) {
      setError('Por favor, informe seu Número de Polícia.');
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadNumeroPm.trim() || !cadNomeGuerra.trim() || !cadPassword.trim()) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register({
      numero_pm: cadNumeroPm.trim(),
      nome_guerra: `${cadGraduacao} ${cadNomeGuerra.trim()}`,
      nome_completo: cadNomeCompleto.trim() || `${cadGraduacao} ${cadNomeGuerra.trim()}`,
      graduacao: cadGraduacao,
      whatsapp: cadWhatsapp.trim() || '38999990000',
      password_hash: cadPassword.trim(),
      role: 'EQUIPE' as UserRole,
      primeiro_acesso: false,
      ativo: true
    });

    if (!res.success) {
      setError(res.message || 'Erro ao realizar cadastro.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] flex items-center justify-center p-4 text-gray-900 dark:text-gray-100 font-sans relative">
      
      {/* Botão de Tema Flutuante Absoluto (Não empurra o quadro para baixo) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main Card Perfeitamente Centralizado */}
      <div className="max-w-md w-full z-10">
        <div className="untitled-card p-7 sm:p-8 shadow-sm">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {activeTab === 'LOGIN' ? 'Acesse o Sistema' : 'Novo Cadastro'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === 'LOGIN' 
                ? 'Informe seu Número de Polícia e senha para acessar'
                : 'Preencha seus dados para criar sua conta de acesso'}
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-[#1E2636] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('LOGIN'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('CADASTRO'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'CADASTRO'
                  ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Cadastrar-se
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'LOGIN' ? (
            /* Formulário de Login Limpo */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Número de Polícia (Nº PM)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Digite seu Nº de PM"
                    value={numeroPm}
                    onChange={(e) => setNumeroPm(e.target.value)}
                    className="untitled-input pl-10 font-mono"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="untitled-input pl-10"
                    required
                    autoComplete="current-password"
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
          ) : (
            /* Formulário de Novo Cadastro (Sem especificação de equipe) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Graduação *</label>
                  <select
                    value={cadGraduacao}
                    onChange={(e) => setCadGraduacao(e.target.value)}
                    className="untitled-input"
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
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Guerra *</label>
                  <input
                    type="text"
                    placeholder="Ex: Silva, Moreira"
                    value={cadNomeGuerra}
                    onChange={(e) => setCadNomeGuerra(e.target.value)}
                    className="untitled-input font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Nome completo do militar"
                  value={cadNomeCompleto}
                  onChange={(e) => setCadNomeCompleto(e.target.value)}
                  className="untitled-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nº de Polícia *</label>
                  <input
                    type="text"
                    placeholder="Ex: 165432-1"
                    value={cadNumeroPm}
                    onChange={(e) => setCadNumeroPm(e.target.value)}
                    className="untitled-input font-mono font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="38999990000"
                    value={cadWhatsapp}
                    onChange={(e) => setCadWhatsapp(e.target.value)}
                    className="untitled-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Senha de Acesso *</label>
                <input
                  type="password"
                  placeholder="Crie uma senha de acesso"
                  value={cadPassword}
                  onChange={(e) => setCadPassword(e.target.value)}
                  className="untitled-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Concluir Cadastro & Entrar</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
