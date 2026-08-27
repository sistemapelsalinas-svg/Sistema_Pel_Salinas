'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home, Compass, Target, Menu, AlertTriangle } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.primeiro_acesso) {
        router.push('/trocar-senha');
      }
    }
  }, [user, loading, router]);

  // Fecha o menu mobile automaticamente ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] text-gray-900 dark:text-gray-100 flex">
      
      {/* Sidebar Desktop e Drawer Mobile */}
      <Sidebar 
        isMobileOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Header com botão de menu mobile */}
        <Header onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
        
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Barra de Navegação Inferior Mobile (Padrão App Nativo) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#151A23]/95 backdrop-blur-md border-t border-gray-200/90 dark:border-[#222938] px-2 py-1 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            pathname === '/dashboard'
              ? 'text-gray-950 dark:text-white font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </Link>

        <Link
          href="/dashboard/missao-do-dia"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            pathname === '/dashboard/missao-do-dia'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Missão</span>
        </Link>

        <Link
          href="/dashboard/operacoes"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            pathname.startsWith('/dashboard/operacoes')
              ? 'text-gray-950 dark:text-white font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px]">Operações</span>
        </Link>

        <Link
          href="/dashboard/alertas-homicidio"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            pathname === '/dashboard/alertas-homicidio'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px]">Alertas</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>

    </div>
  );
}
