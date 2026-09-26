'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  User, 
  X, 
  Check, 
  KeyRound, 
  Shield, 
  Phone, 
  BadgeCheck, 
  AlertCircle,
  Lock
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();

  const [graduacao, setGraduacao] = useState('Sd');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [numeroPm, setNumeroPm] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setGraduacao(user.graduacao || 'Sd');
      const rawGuerra = user.nome_guerra || '';
      const cleanGuerra = rawGuerra.replace(new RegExp(`^${user.graduacao}\\s*`, 'i'), '');
      setNomeGuerra(cleanGuerra || rawGuerra);
      setNomeCompleto(user.nome_completo || '');
      setNumeroPm(user.numero_pm || '');
      setWhatsapp(user.whatsapp || '');
      setNovaSenha('');
      setConfirmarSenha('');
      setError(null);
      setSuccess(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nomeGuerra.trim() || !numeroPm.trim()) {
      setError('Nome de Guerra e Número de PM são obrigatórios.');
      return;
    }

    if (novaSenha) {
      if (novaSenha.length < 6) {
        setError('A nova senha deve possuir pelo menos 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setError('A confirmação de senha não coincide com a nova senha.');
        return;
      }
    }

    setLoading(true);

    const fullNomeGuerra = `${graduacao} ${nomeGuerra.trim()}`;
    const res = await updateProfile(
      {
        graduacao,
        nome_guerra: fullNomeGuerra,
        nome_completo: nomeCompleto.trim() || fullNomeGuerra,
        numero_pm: numeroPm.trim(),
        whatsapp: whatsapp.trim()
      },
      novaSenha ? novaSenha.trim() : undefined
    );

    setLoading(false);

    if (res.success) {
      setSuccess('Dados e credenciais atualizados com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(res.message || 'Erro ao atualizar dados.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#222938] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#222938] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">Meu Perfil & Credenciais</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Edite seus dados pessoais e senha de acesso</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E2636] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Posto / Graduação
              </label>
              <select
                value={graduacao}
                onChange={(e) => setGraduacao(e.target.value)}
                className="untitled-input text-xs"
              >
                <option value="Cel PM">Cel PM</option>
                <option value="Ten Cel PM">Ten Cel PM</option>
                <option value="Maj PM">Maj PM</option>
                <option value="Cap PM">Cap PM</option>
                <option value="1º Ten PM">1º Ten PM</option>
                <option value="2º Ten PM">2º Ten PM</option>
                <option value="Sub Ten PM">Sub Ten PM</option>
                <option value="1º Sgt PM">1º Sgt PM</option>
                <option value="2º Sgt PM">2º Sgt PM</option>
                <option value="3º Sgt PM">3º Sgt PM</option>
                <option value="Cb PM">Cb PM</option>
                <option value="Sd 1ª Cl PM">Sd 1ª Cl PM</option>
                <option value="Sd 2ª Cl PM">Sd 2ª Cl PM</option>
                <option value="Sd PM">Sd PM</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome de Guerra
              </label>
              <input
                type="text"
                placeholder="Ex: SILVA"
                value={nomeGuerra}
                onChange={(e) => setNomeGuerra(e.target.value)}
                className="untitled-input text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: João da Silva Santos"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="untitled-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Polícia (Login)
              </label>
              <input
                type="text"
                placeholder="Ex: 1578426"
                value={numeroPm}
                onChange={(e) => setNumeroPm(e.target.value)}
                className="untitled-input text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                WhatsApp / Celular
              </label>
              <input
                type="text"
                placeholder="Ex: 38999991234"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="untitled-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Troca de Senha */}
          <div className="pt-3 border-t border-gray-200 dark:border-[#222938]">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-600" />
              <span>Alterar Senha (Opcional)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  placeholder="Deixe em branco para manter"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="untitled-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="untitled-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
