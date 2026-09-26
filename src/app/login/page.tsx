'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/storage';
import { Shield, ArrowRight, AlertCircle, UserPlus, CheckCircle2, Link2, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserRole, RegistrationInviteToken } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { formatNumeroPm, isValidNumeroPm, formatWhatsApp, isValidWhatsApp } from '@/lib/validation';

function LoginFormContent() {
  const { login, register } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'CADASTRO'>('LOGIN');

  // Convite via Link
  const [inviteToken, setInviteToken] = useState<RegistrationInviteToken | null>(null);
  const [inviteTokenStr, setInviteTokenStr] = useState<string>('');

  // Login Form (100% limpo, sem pré-preenchimento)
  const [numeroPm, setNumeroPm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mensagem de sucesso para cadastro pendente
  const [pendingSuccessMsg, setPendingSuccessMsg] = useState<string | null>(null);

  // Cadastro Form
  const [cadGraduacao, setCadGraduacao] = useState('Sd');
  const [cadNomeGuerra, setCadNomeGuerra] = useState('');
  const [cadNomeCompleto, setCadNomeCompleto] = useState('');
  const [cadNumeroPm, setCadNumeroPm] = useState('');
  const [cadWhatsapp, setCadWhatsapp] = useState('');
  const [cadPassword, setCadPassword] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token') || searchParams.get('convite');
    if (tokenParam) {
      const cleanToken = tokenParam.trim();
      setInviteTokenStr(cleanToken);
      const foundToken = storage.getInviteToken(cleanToken);
      if (foundToken && !foundToken.usado) {
        setInviteToken(foundToken);
        setActiveTab('CADASTRO');
        if (foundToken.graduacao_sugerida) setCadGraduacao(foundToken.graduacao_sugerida);
        if (foundToken.nome_sugerido) setCadNomeGuerra(foundToken.nome_sugerido);
        if (foundToken.numero_pm_sugerido) setCadNumeroPm(foundToken.numero_pm_sugerido);
      }
    }
  }, [searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = formatNumeroPm(numeroPm);
    if (!cleanNum) {
      setError('Por favor, informe seu Número de Polícia (7 dígitos numéricos).');
      return;
    }
    if (cleanNum.length !== 7) {
      setError('O Número de Polícia deve conter exatamente 7 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(cleanNum, password);
    if (!res.success) {
      setError(res.message || 'Erro ao realizar login.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = formatNumeroPm(cadNumeroPm);
    if (!cleanNum || !cadNomeGuerra.trim() || !cadPassword.trim()) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    if (cleanNum.length !== 7) {
      setError('O Número de Polícia deve conter exatamente 7 dígitos numéricos (apenas números).');
      return;
    }

    if (cadWhatsapp && !isValidWhatsApp(cadWhatsapp)) {
      setError('Informe um número de WhatsApp válido com DDD no formato (XX) XXXXX-XXXX.');
      return;
    }

    setLoading(true);
    setError('');
    setPendingSuccessMsg(null);

    const res = await register(
      {
        numero_pm: cleanNum,
        nome_guerra: `${cadGraduacao} ${cadNomeGuerra.trim()}`,
        nome_completo: cadNomeCompleto.trim() || `${cadGraduacao} ${cadNomeGuerra.trim()}`,
        graduacao: cadGraduacao,
        whatsapp: cadWhatsapp.trim() || '38999990000',
        password_hash: cadPassword.trim(),
        role: inviteToken ? inviteToken.role : ('EQUIPE' as UserRole),
        equipe_padrao: inviteToken?.equipe_padrao || '',
        primeiro_acesso: false,
        ativo: inviteToken ? true : false
      },
      inviteTokenStr || undefined
    );

    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Erro ao realizar cadastro.');
    } else if (res.pendingApproval) {
      setPendingSuccessMsg(res.message || 'Cadastro realizado com sucesso! Aguarde a liberação de um Administrador.');
      setActiveTab('LOGIN');
      setNumeroPm(cleanNum);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] flex items-center justify-center p-4 text-gray-900 dark:text-gray-100 font-sans relative">
      
      {/* Botão de Tema Flutuante Absoluto */}
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

          {/* Success / Pending Alert */}
          {pendingSuccessMsg && (
            <div className="mb-5 p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Cadastro Enviado com Sucesso!</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 pl-6 leading-relaxed">
                Sua solicitação está aguardando autorização de um Administrador. Assim que for aprovada, você poderá acessar o sistema usando seu Nº PM e senha cadastrada.
              </p>
            </div>
          )}

          {/* Banner de Link de Convite Autorizado */}
          {inviteToken && activeTab === 'CADASTRO' && (
            <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Link de Convite Autorizado
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Função pré-definida: <strong className="font-semibold uppercase">{inviteToken.role}</strong>
                  {inviteToken.equipe_padrao ? ` · Equipe: ${inviteToken.equipe_padrao}` : ''}. Seu acesso será liberado imediatamente ao concluir o cadastro.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'LOGIN' ? (
            /* Formulário de Login Limpo (Sem sobreposição de ícones) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Número de Polícia (Nº PM — 7 dígitos)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1234567"
                  value={numeroPm}
                  maxLength={7}
                  onChange={(e) => setNumeroPm(formatNumeroPm(e.target.value))}
                  className="untitled-input font-mono font-medium"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="untitled-input"
                  required
                  autoComplete="current-password"
                />
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
            /* Formulário de Novo Cadastro */
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
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nº de PM (7 dígitos) *</label>
                  <input
                    type="text"
                    placeholder="Ex: 1234567"
                    value={cadNumeroPm}
                    maxLength={7}
                    onChange={(e) => setCadNumeroPm(formatNumeroPm(e.target.value))}
                    className="untitled-input font-mono font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(38) 99999-9999"
                    value={cadWhatsapp}
                    maxLength={15}
                    onChange={(e) => setCadWhatsapp(formatWhatsApp(e.target.value))}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
