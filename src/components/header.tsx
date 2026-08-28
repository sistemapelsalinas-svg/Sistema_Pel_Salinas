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
    <header className="bg-white dark:bg-[#151A23] border-b border-gray-200/90 dark:border-[#222938] px-4 sm:px-6 py-2.5 lg:py-0 lg:h-16 sticky top-0 z-30 w-full max-w-full transition-colors flex flex-col justify-center">
      
      {/* Linha 1: Título do Pelotão + Botão de Tema */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Unit Title & Date */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight truncate">
              2º Pelotão Salinas
            </span>
            <span className="text-[10px] sm:text-xs text-gray-400 font-normal truncate">
              · {formattedDate}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
            11ª RPM · 2ª Cia PM Ind
          </p>
        </div>

        {/* Ações no Desktop e Alternador de Tema */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* Segmented Control no Desktop (Na mesma linha) */}
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

          {/* Minha Missão Button (Desktop) */}
          <Link
            href="/dashboard/missao-do-dia"
            className="hidden md:inline-flex btn-primary py-2 px-3 text-xs"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Minha Missão</span>
          </Link>

          {/* Theme Switcher */}
          <ThemeToggle />

        </div>
      </div>

      {/* Linha 2 (No Mobile): Filtro de Datas em linha dedicada, espaçosa e organizada */}
      <div className="lg:hidden mt-2 pt-2 border-t border-gray-100 dark:border-[#222938]/60 w-full">
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-[#0E121A] rounded-xl text-center">
          <button
            type="button"
            onClick={() => setPeriod('dia')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === 'dia'
                ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setPeriod('semana')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === 'semana'
                ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setPeriod('mes')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === 'mes'
                ? 'bg-white dark:bg-[#151A23] text-gray-900 dark:text-white shadow-xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Este Mês
          </button>
        </div>
      </div>

    </header>
  );
}
