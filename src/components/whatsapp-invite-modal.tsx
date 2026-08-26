'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { generateWhatsAppInviteUrl } from '@/lib/validation';
import { X, Send, Copy, Check, MessageSquareCode, Shield } from 'lucide-react';

interface WhatsAppInviteModalProps {
  user: UserProfile;
  tempPassword?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppInviteModal({
  user,
  tempPassword = 'pmmg' + Math.floor(1000 + Math.random() * 9000),
  isOpen,
  onClose
}: WhatsAppInviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = generateWhatsAppInviteUrl(
    user.whatsapp,
    user.nome_guerra,
    user.numero_pm,
    tempPassword,
    user.role
  );

  const cleanPhone = user.whatsapp.replace(/\D/g, '');

  const handleCopy = () => {
    // Decodifica a mensagem da URL para copiar texto puro
    const urlObj = new URL(inviteUrl);
    const text = urlObj.searchParams.get('text') || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(inviteUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-800 dark:bg-emerald-950 p-5 text-white flex items-center justify-between border-b border-emerald-700 dark:border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 dark:bg-emerald-900/80 flex items-center justify-center">
              <MessageSquareCode className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Convite de Acesso via WhatsApp</h3>
              <p className="text-xs text-emerald-200">2º Pel / 2ª Cia PM Ind / 11ª RPM - Salinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Card com Detalhes do Militar */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-800 text-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Militar:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{user.graduacao} {user.nome_guerra}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Nº PM:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{user.numero_pm}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">WhatsApp:</span>
              <span className="text-slate-700 dark:text-slate-300">({cleanPhone.slice(0, 2)}) {cleanPhone.slice(2, 7)}-{cleanPhone.slice(7)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Senha Temporária:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                {tempPassword}
              </span>
            </div>
          </div>

          {/* Prévia da Mensagem */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Pré-visualização da Mensagem Formatada:
            </label>
            <div className="p-4 bg-emerald-50 dark:bg-gray-950 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-sans space-y-2 max-h-48 overflow-y-auto leading-relaxed shadow-inner">
              <p className="font-bold text-emerald-800 dark:text-emerald-400">👮‍♂️ POLÍCIA MILITAR DE MINAS GERAIS</p>
              <p className="font-semibold text-slate-600 dark:text-slate-300">2º PEL / 2ª CIA PM IND / 11ª RPM - SALINAS/MG</p>
              <p>Olá, <span className="font-bold">{user.nome_guerra}</span>! Seu acesso ao Sistema de Gestão do 2º Pelotão foi liberado.</p>
              <p>👤 <strong>Login (Nº PM):</strong> {user.numero_pm}</p>
              <p>🔑 <strong>Senha Temporária:</strong> {tempPassword}</p>
              <p>📌 <strong>Perfil:</strong> {user.role}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                No primeiro acesso, você deverá cadastrar sua nova senha pessoal.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>O policial será direcionado à tela de alteração de senha obrigatória assim que efetuar o primeiro login.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Mensagem</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
