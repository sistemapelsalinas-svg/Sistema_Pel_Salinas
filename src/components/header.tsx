'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './theme-toggle';
import { Compass, Calendar, Shield, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Header() {
  const { user } = useAuth();
  const today = new Date();
  const formattedDate = format(today, "EEE, dd 'de' MMM", { locale: ptBR });
  const [period, setPeriod] = useState<'dia' | 'semana' | 'mes'>('mes');

  if (!user) return null;

  return (
    <header className="h-16 bg-white dark:bg-[#151A23] border-b border-gray-200/90 dark:border-[#222938] px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Title & Info matching 1.webp */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
              2º Pelotão Salinas
            </span>
            <span className="text-xs text-gray-400 font-normal">
              {formattedDate}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
            11ª RPM · 2ª Companhia PM Independente
          </p>
        </div>
      </div>

      {/* Segmented Controls + Action Buttons */}
      <div className="flex items-center gap-3">
        
        {/* Segmented Control Pill matching 1.webp top-right */}
        <div className="hidden sm:flex segmented-control">
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

        {/* Minha Missão Button */}
        <Link
          href="/dashboard/missao-do-dia"
          className="btn-primary py-2 px-3 text-xs"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Minha Missão</span>
        </Link>

        {/* Theme Switcher */}
        <ThemeToggle />

      </div>

    </header>
  );
}
