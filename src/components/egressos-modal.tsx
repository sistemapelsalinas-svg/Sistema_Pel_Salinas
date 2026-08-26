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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-black p-5 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Fiscalização de Egressos</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  EM BREVE
                </span>
              </div>
              <p className="text-xs text-slate-400">2º Pelotão PM / Salinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wide">
                Módulo em Fase de Planejamento
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Este módulo está reservado para a gestão e fiscalização de apenados e egressos do sistema prisional na área de Salinas.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-200">Recursos que serão integrados na próxima versão:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Cadastro e fotos de indivíduos em prisão domiciliar / livramento condicional.</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Controle de horários de recolhimento noturno e restrições judiciais.</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Registro fotográfico e georreferenciado das visitas de fiscalização na rua.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-900/80 border-t border-slate-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
