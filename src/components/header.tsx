'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './theme-toggle';
import { RoleBadge } from './role-badge';
import { Compass, Calendar, Shield, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Header() {
  const { user } = useAuth();
  const today = new Date();
  const formattedDate = format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  if (!user) return null;

  return (
    <header className="h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-slate-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* Título & Data */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>2º Pelotão PM / Salinas</span>
        </div>
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-gray-800 text-xs text-slate-500 dark:text-slate-400 capitalize">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-3">
        {/* Botão de Destaque Minha Missão */}
        <Link
          href="/dashboard/missao-do-dia"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all hover:scale-[1.02]"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span className="hidden sm:inline">Minha Missão do Dia</span>
          <span className="sm:hidden">Missão</span>
        </Link>

        {/* Alternador de Tema */}
        <ThemeToggle />

        {/* Perfil Rápido */}
        <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-gray-800">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {user.graduacao} {user.nome_guerra}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              PM: {user.numero_pm}
            </p>
          </div>
        </div>
      </div>

    </header>
  );
}
