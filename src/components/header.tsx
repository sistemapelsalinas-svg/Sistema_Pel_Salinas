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
      
      {/* Linha 1: Título do Pelotão à Esquerda + Ações e Botão de Tema à Direita */}
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
          <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden lg:block">
            11ª RPM · 2ª Cia PM Ind
          </p>
        </div>

        {/* Bloco de Ações da Direita */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* Controles do Desktop (Ocultos rigorosamente no Mobile) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="flex items-center p-1 bg-gray-100 dark:bg-[#0E121A] rounded-xl border border-gray-200/80 dark:border-[#222938]">
              <button
                type="button"
                onClick={() => setPeriod('dia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === 'dia'
                    ? 'bg-white dark:bg-[#1E2636] text-gray-900 dark:text-white shadow-xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setPeriod('semana')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === 'semana'
                    ? 'bg-white dark:bg-[#1E2636] text-gray-900 dark:text-white shadow-xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setPeriod('mes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === 'mes'
                    ? 'bg-white dark:bg-[#1E2636] text-gray-900 dark:text-white shadow-xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Este Mês
              </button>
            </div>

            {/* Minha Missão Button (Apenas Desktop) */}
            <Link
              href="/dashboard/missao-do-dia"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs text-white bg-gray-950 hover:bg-gray-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Minha Missão</span>
            </Link>
          </div>

          {/* Theme Switcher (Sempre Visível no Topo Direito, tanto mobile quanto desktop) */}
          <ThemeToggle />

        </div>
      </div>

      {/* Linha 2 (Apenas no Mobile < lg): Filtro de Datas em linha dedicada e sem duplicidade */}
      <div className="block lg:hidden mt-2 pt-2 border-t border-gray-100 dark:border-[#222938]/60 w-full">
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
