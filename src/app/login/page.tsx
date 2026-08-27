'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Shield, KeyRound, User, ArrowRight, AlertCircle, Sparkles, UserPlus, Phone, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DEFAULT_TEAMS } from '@/lib/mock-data';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'CADASTRO'>('LOGIN');

  // Login Form
  const [numeroPm, setNumeroPm] = useState('1578426');
  const [password, setPassword] = useState('pmmg1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cadastro Form
  const [cadGraduacao, setCadGraduacao] = useState('Sd');
  const [cadNomeGuerra, setCadNomeGuerra] = useState('');
  const [cadNomeCompleto, setCadNomeCompleto] = useState('');
  const [cadNumeroPm, setCadNumeroPm] = useState('');
  const [cadWhatsapp, setCadWhatsapp] = useState('');
  const [cadEquipe, setCadEquipe] = useState('ALFA 1');
  const [cadPassword, setCadPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
      equipe_padrao: cadEquipe,
      primeiro_acesso: false,
      ativo: true
    });

    if (!res.success) {
      setError(res.message || 'Erro ao realizar cadastro.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] flex flex-col justify-between p-4 sm:p-6 text-gray-900 dark:text-gray-100 relative">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-950 dark:bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">SGP Salinas</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">2º Pel / 2ª Cia PM Ind / 11ª RPM</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Card (Untitled UI Style) */}
      <div className="max-w-md w-full mx-auto my-8 z-10">
        <div className="untitled-card p-8 shadow-sm">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {activeTab === 'LOGIN' ? 'Acesse o Sistema' : 'Novo Cadastro Militar'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === 'LOGIN' 
                ? 'Informe seu Número de Polícia e senha para acessar'
                : 'Cadastre seus dados para acesso ao 2º Pelotão de Salinas'}
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
            /* Formulário de Login */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Número de Polícia (Nº PM)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ex: 1578426"
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
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Padrão: pmmg1234</span>
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

              {/* Card Conta Inicial Admin */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#222938]">
                <button
                  type="button"
                  onClick={() => { setNumeroPm('1578426'); setPassword('pmmg1234'); }}
                  className="w-full p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left transition-all flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Conta Administrador Inicial
                    </span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Sgt André Santos (PM 1578426)
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-gray-900 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    Entrar como Admin
                  </span>
                </button>
              </div>

            </form>
          ) : (
            /* Formulário de Cadastro */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Equipe</label>
                  <select
                    value={cadEquipe}
                    onChange={(e) => setCadEquipe(e.target.value)}
                    className="untitled-input"
                  >
                    {DEFAULT_TEAMS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Senha de Acesso *</label>
                  <input
                    type="password"
                    placeholder="Crie uma senha"
                    value={cadPassword}
                    onChange={(e) => setCadPassword(e.target.value)}
                    className="untitled-input"
                    required
                  />
                </div>
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

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 z-10">
        <p>Polícia Militar de Minas Gerais — 2º Pelotão de Salinas (11ª RPM)</p>
      </div>

    </div>
  );
}
