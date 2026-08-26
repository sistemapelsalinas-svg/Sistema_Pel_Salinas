'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './theme-toggle';
import { Compass, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Header() {
  const { user } = useAuth();
  const today = new Date();
  const formattedDate = format(today, "EEEE, dd 'de' MMMM", { locale: ptBR });

  if (!user) return null;

  return (
    <header className="h-16 bg-white dark:bg-[#0C111D] border-b border-gray-200 dark:border-[#1F242F] px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Breadcrumb & Unit Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-sm">
          <span>2º Pelotão PM</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400 font-normal">Salinas (11ª RPM)</span>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 capitalize">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        
        {/* Minha Missão Button */}
        <Link
          href="/dashboard/missao-do-dia"
          className="btn-primary py-2 px-3.5 text-xs shadow-xs"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Minha Missão do Dia</span>
          <span className="sm:hidden">Missão</span>
        </Link>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* User Pill */}
        <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-gray-200 dark:border-gray-800">
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
              {user.graduacao} {user.nome_guerra}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              PM {user.numero_pm}
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}
