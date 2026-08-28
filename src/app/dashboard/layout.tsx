'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import Link from 'next/link';
import { 
  Home, 
  Compass, 
  Target, 
  Calendar, 
  AlertTriangle, 
  Users, 
  BarChart2, 
  Menu, 
  X, 
  PlusCircle, 
  SlidersHorizontal, 
  UserCheck, 
  LogOut, 
  Shield 
} from 'lucide-react';
import { EgressosModal } from '@/components/egressos-modal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showEgressosModal, setShowEgressosModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.primeiro_acesso) {
        router.push('/trocar-senha');
      }
    }
  }, [user, loading, router]);

  // Fecha o drawer mobile ao trocar de página
  useEffect(() => {
    setMobileDrawerOpen(false);
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

  const isAdmin = user.role === 'ADMIN';
  const isSofOrAdmin = user.role === 'ADMIN' || user.role === 'SOF';

  const allMobileNavSections = [
    {
      category: 'MENU PRINCIPAL',
      items: [
        { title: 'Visão Geral', href: '/dashboard', icon: Home },
        { title: 'Minha Missão do Dia', href: '/dashboard/missao-do-dia', icon: Compass, badge: 'Plantão' },
      ]
    },
    {
      category: 'OPERAÇÕES & METAS',
      items: [
        { title: 'Catálogo de Operações', href: '/dashboard/operacoes', icon: Target },
        ...(isSofOrAdmin ? [{ title: 'Lançar Operação', href: '/dashboard/operacoes/lancamento', icon: PlusCircle }] : []),
        ...(isAdmin ? [{ title: 'Configurar Metas', href: '/dashboard/operacoes/metas', icon: SlidersHorizontal }] : []),
      ]
    },
    {
      category: 'PREVENÇÃO & ESCALA',
      items: [
        { title: 'Alertas de Homicídios', href: '/dashboard/alertas-homicidio', icon: AlertTriangle, badge: 'Alerta' },
        { title: 'Escala Mensal', href: '/dashboard/escala', icon: Calendar },
        { title: 'Fiscalização de Egressos', href: '#', icon: UserCheck, onClick: () => { setShowEgressosModal(true); setMobileDrawerOpen(false); }, badge: 'Breve' },
      ]
    },
    {
      category: 'GESTÃO & RELATÓRIOS',
      items: [
        ...(isAdmin ? [{ title: 'Militares & Acessos', href: '/dashboard/usuarios', icon: Users }] : []),
        { title: 'Relatórios & Produtividade', href: '/dashboard/relatorios', icon: BarChart2 },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0E14] text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row max-w-full overflow-x-hidden">
      
      {/* Sidebar Desktop (Oculta no mobile) */}
      <Sidebar />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen max-w-full overflow-x-hidden">
        <Header />
        
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Barra de Navegação Inferior Fixa Permanente no Mobile (Padrão App Nativo) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#151A23]/95 backdrop-blur-lg border-t border-gray-200/90 dark:border-[#222938] h-16 w-full max-w-full px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        
        {/* 1. Início */}
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

        {/* 2. Missão */}
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

        {/* 3. Operações */}
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

        {/* 4. Escala */}
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

        {/* 5. Menu Completo (Acesso a todos os 10 módulos) */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
            mobileDrawerOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>

      </nav>

      {/* Drawer Mobile Completo (Acesso 100% a todas as funções) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur */}
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Sheet / Drawer Lateral */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-[88vw] bg-white dark:bg-[#151A23] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            
            {/* Header do Drawer */}
            <div className="p-4 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Menu do Sistema</h3>
                  <p className="text-[10px] text-gray-400">2º Pelotão Salinas</p>
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista Completa de Itens */}
            <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
              {allMobileNavSections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <p className="px-2 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                    {sec.category}
                  </p>
                  <div className="space-y-1">
                    {sec.items.map((item, iIdx) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      if (item.onClick) {
                        return (
                          <button
                            key={iIdx}
                            onClick={item.onClick}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1D2432] transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span>{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={iIdx}
                          href={item.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1D2432]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Rodapé com Informações do Usuário e Sair */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between bg-gray-50/50 dark:bg-[#0E121A]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user.nome_guerra.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {user.nome_guerra}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">PM {user.numero_pm} · {user.role}</p>
                </div>
              </div>

              <button
                onClick={() => { logout(); setMobileDrawerOpen(false); }}
                title="Sair da Conta"
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      <EgressosModal
        isOpen={showEgressosModal}
        onClose={() => setShowEgressosModal(false)}
      />

    </div>
  );
}
