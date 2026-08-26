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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">Convite de Acesso via WhatsApp</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">2º Pel / 2ª Cia PM Ind — Salinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-[#0C111D]/60 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-500 block font-medium">Militar:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{user.graduacao} {user.nome_guerra}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Nº PM:</span>
              <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{user.numero_pm}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">WhatsApp:</span>
              <span className="text-gray-700 dark:text-gray-300 font-mono">({cleanPhone.slice(0, 2)}) {cleanPhone.slice(2, 7)}-{cleanPhone.slice(7)}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Senha Provisória:</span>
              <span className="font-mono font-semibold text-warning-700 dark:text-warning-400 bg-warning-50 dark:bg-warning-950/40 px-1.5 py-0.5 rounded border border-warning-200 dark:border-warning-800">
                {tempPassword}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Pré-visualização da Mensagem:
            </label>
            <div className="p-3.5 bg-gray-50 dark:bg-[#0C111D]/80 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-700 dark:text-gray-300 font-sans space-y-1.5 max-h-44 overflow-y-auto leading-relaxed">
              <p className="font-semibold text-brand-700 dark:text-brand-400">👮‍♂️ POLÍCIA MILITAR DE MINAS GERAIS</p>
              <p className="text-gray-500">2º PEL / 2ª CIA PM IND / 11ª RPM - SALINAS/MG</p>
              <p>Olá, <span className="font-semibold">{user.nome_guerra}</span>! Seu acesso ao SGP-Salinas foi liberado.</p>
              <p>👤 <strong>Login:</strong> {user.numero_pm}</p>
              <p>🔑 <strong>Senha Temporária:</strong> {tempPassword}</p>
              <p>📌 <strong>Perfil:</strong> {user.role}</p>
              <p className="text-[11px] text-gray-400 italic">
                No primeiro acesso, você deverá cadastrar sua nova senha pessoal.
              </p>
            </div>
          </div>

          <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 rounded-xl flex items-start gap-2.5 text-xs text-brand-800 dark:text-brand-300">
            <Shield className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <span>O policial será direcionado à tela de troca de senha no primeiro login.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 dark:bg-[#0C111D]/60 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-brand-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
