'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './theme-toggle';
import { Compass } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Header() {
  const { user } = useAuth();
  const today = new Date();
  const formattedDate = format(today, "EEE, dd 'de' MMM", { locale: ptBR });
  const [period, setPeriod] = useState<'dia' | 'semana' | 'mes'>('mes');

  if (!user) return null;

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-[#151A23] border-b border-gray-200/90 dark:border-[#222938] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 w-full max-w-full transition-colors">
      
      {/* Unit Title & Date (Clean & Never Overflows) */}
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-baseline gap-2 truncate">
          <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight truncate">
            2º Pelotão Salinas
          </span>
          <span className="text-[10px] sm:text-xs text-gray-400 font-normal hidden sm:inline truncate">
            {formattedDate}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden md:block">
          11ª RPM · 2ª Cia PM Ind
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        {/* Segmented Control (Apenas no Desktop) */}
        <div className="hidden lg:flex segmented-control">
          <button
            onClick={() => setPeriod('dia')}
            className={`segmented-control-btn ${period === 'dia' ? 'segmented-control-btn-active' : 'segmented-control-btn-inactive'}`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('semana')}
            className={`segmented-control-btn ${period === 'semana' ? 'segmented-control-btn-active' : 'segmented-control-btn-inactive'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('mes')}
            className={`segmented-control-btn ${period === 'mes' ? 'segmented-control-btn-active' : 'segmented-control-btn-inactive'}`}
          >
            Este Mês
          </button>
        </div>

        {/* Minha Missão Button (Apenas no Desktop) */}
        <Link
          href="/dashboard/missao-do-dia"
          className="hidden md:inline-flex btn-primary py-2 px-3 text-xs"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Minha Missão</span>
        </Link>

        {/* Theme Switcher Compacto */}
        <ThemeToggle />

      </div>

    </header>
  );
}
