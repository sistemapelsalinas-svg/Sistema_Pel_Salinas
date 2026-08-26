'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { KeyRound, Check, AlertCircle, Lock } from 'lucide-react';

export default function TrocarSenhaPage() {
  const { user, updatePassword } = useAuth();
  const router = useRouter();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      setError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmacao) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await updatePassword(novaSenha);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError('Ocorreu um erro ao atualizar a senha. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0C111D] flex flex-col justify-center p-4 text-gray-900 dark:text-gray-100">
      
      <div className="max-w-md w-full mx-auto">
        <div className="untitled-card p-8 shadow-md">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Definir Nova Senha
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Olá, <span className="text-brand-600 dark:text-brand-400 font-semibold">{user?.graduacao} {user?.nome_guerra}</span>. Por segurança, cadastre sua senha pessoal de acesso.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-error-50 dark:bg-error-950/50 border border-error-200 dark:border-error-800 rounded-xl flex items-center gap-2.5 text-xs text-error-700 dark:text-error-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-error-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="untitled-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  className="untitled-input pl-10"
                  required
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
                  <Check className="w-4 h-4" />
                  <span>Salvar Senha e Acessar</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
