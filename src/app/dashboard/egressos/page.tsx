'use client';

import React from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Camera 
} from 'lucide-react';

export default function EgressosPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-700 dark:bg-warning-950/60 dark:text-warning-300 border border-warning-200 dark:border-warning-800">
            Em Desenvolvimento
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
          <UserCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Fiscalização de Egressos do Sistema Prisional</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Acompanhamento, fiscalização e controle de apenados com medidas cautelares e livramento condicional.
        </p>
      </div>

      {/* Hero Banner Untitled UI */}
      <div className="untitled-card p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="max-w-xl mx-auto space-y-1.5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Módulo em Desenvolvimento (Versão 2.0)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            A infraestrutura de banco de dados e as permissões de acesso já foram preparadas no sistema. Em breve, a SOF e os Administradores poderão cadastrar egressos e registrar fiscalizações georreferenciadas na rua.
          </p>
        </div>

        {/* Cards de Prévia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0C111D]/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-error-50 text-error-600 dark:bg-error-950/60 dark:text-error-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Prisão Domiciliar & Livramento</h4>
            <p className="text-xs text-gray-500">
              Controle dos benefícios concedidos pela Vara de Execuções Penais de Salinas.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0C111D]/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Recolhimento Noturno</h4>
            <p className="text-xs text-gray-500">
              Verificação dos horários obrigatórios de permanência em domicílio.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0C111D]/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Registro Fotográfico</h4>
            <p className="text-xs text-gray-500">
              Anexo de fotos da visita fiscalizatória e assinatura do fiscalizado.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
