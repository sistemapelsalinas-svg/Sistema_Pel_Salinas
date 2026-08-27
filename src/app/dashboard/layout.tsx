'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home, Compass, Target, Calendar, AlertTriangle, Users, BarChart2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.primeiro_acesso) {
        router.push('/trocar-senha');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] flex items-center justify-center text-gray-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-gray-500">CARREGANDO SGP-SALINAS...</p>
        </div>
      </div>
    );
  }

  const isMilitarOrEquipe = user.role === 'EQUIPE';

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row">
      
      {/* Sidebar Desktop (Oculta no mobile) */}
      <Sidebar />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Barra de Navegação Inferior Fixa Permanente no Mobile (Padrão App Nativo) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#151A23]/95 backdrop-blur-lg border-t border-gray-200/90 dark:border-[#222938] h-16 px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
            pathname === '/dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Início</span>
        </Link>

        <Link
          href="/dashboard/missao-do-dia"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
            pathname === '/dashboard/missao-do-dia'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Missão</span>
        </Link>

        <Link
          href="/dashboard/operacoes"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
            pathname.startsWith('/dashboard/operacoes')
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Operações</span>
        </Link>

        <Link
          href="/dashboard/escala"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
            pathname === '/dashboard/escala'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Escala</span>
        </Link>

        <Link
          href="/dashboard/alertas-homicidio"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
            pathname === '/dashboard/alertas-homicidio'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Alertas</span>
        </Link>

        {user.role === 'ADMIN' && (
          <Link
            href="/dashboard/usuarios"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              pathname === '/dashboard/usuarios'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Militares</span>
          </Link>
        )}

      </nav>

    </div>
  );
}
