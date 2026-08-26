'use client';

import React from 'react';
import { X, UserCheck, ShieldAlert, Sparkles, Clock, Calendar } from 'lucide-react';

interface EgressosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EgressosModal({ isOpen, onClose }: EgressosModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#161B26] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Fiscalização de Egressos</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-50 text-warning-700 dark:bg-warning-950/60 dark:text-warning-300 border border-warning-200 dark:border-warning-800">
                  Em Breve
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">2º Pelotão PM / Salinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="p-3.5 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-900 dark:text-brand-300">
                Módulo em Desenvolvimento
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                Destinado à fiscalização de apenados em livramento condicional e medidas cautelares em Salinas.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-semibold text-gray-900 dark:text-white">Recursos da Versão 2.0:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-error-500 flex-shrink-0" />
                <span>Cadastro e fotos de indivíduos com restrição de liberdade.</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>Controle de recolhimento noturno e medidas cautelares.</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Registro georreferenciado e assinatura eletrônica na rua.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/60 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary py-2 px-4 text-xs"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
