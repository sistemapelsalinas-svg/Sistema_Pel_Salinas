'use client';

import React from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Calendar, 
  MapPin, 
  Camera, 
  Lock,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function EgressosPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            EM DESENVOLVIMENTO
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
          <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Módulo de Fiscalização de Egressos</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Acompanhamento, fiscalização e controle de apenados com medidas cautelares e livramento condicional.
        </p>
      </div>

      {/* Hero Banner do Módulo Futuro */}
      <div className="tactical-card p-8 text-center space-y-4 bg-gradient-to-b from-slate-900 via-gray-900 to-slate-950 text-white border-slate-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 ring-4 ring-amber-500/10">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-xl font-bold">Módulo Reservado para a Versão 2.0</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A estrutura de banco de dados e as permissões de acesso já foram preparadas no sistema. Em breve, a SOF e os Administradores poderão cadastrar egressos e registrar fiscalizações georreferenciadas na rua.
          </p>
        </div>

        {/* Cards de Prévia dos Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-white">Prisão Domiciliar & Livramento</h4>
            <p className="text-[11px] text-slate-400">
              Controle dos benefícios concedidos pela Vara de Execuções Penais de Salinas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-white">Recolhimento Noturno</h4>
            <p className="text-[11px] text-slate-400">
              Verificação dos horários obrigatórios de recolhimento em domicílio.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-white">Registro Fotográfico</h4>
            <p className="text-[11px] text-slate-400">
              Anexo de fotos da visita fiscalizatória e assinatura do fiscalizado na viatura.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
