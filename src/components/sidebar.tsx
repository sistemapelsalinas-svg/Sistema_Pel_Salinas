'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { 
  Shield, 
  Compass, 
  LayoutGrid, 
  Target, 
  AlertTriangle, 
  Calendar, 
  UserCheck, 
  Users, 
  BarChart2, 
  LogOut, 
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { RoleBadge } from './role-badge';
import { EgressosModal } from './egressos-modal';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, switchUserRole } = useAuth();
  const [showEgressosModal, setShowEgressosModal] = useState(false);
  const [showRoleTester, setShowRoleTester] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isSofOrAdmin = user.role === 'ADMIN' || user.role === 'SOF';

  const navItems = [
    {
      title: 'Minha Missão do Dia',
      href: '/dashboard/missao-do-dia',
      icon: Compass,
      highlight: true,
      badge: 'Plantão'
    },
    {
      title: 'Visão Geral',
      href: '/dashboard',
      icon: LayoutGrid
    },
    {
      title: 'Operações & Metas',
      href: '/dashboard/operacoes',
      icon: Target,
      subItems: [
        { title: 'Catálogo de Operações', href: '/dashboard/operacoes' },
        ...(isSofOrAdmin ? [{ title: 'Lançar Operação', href: '/dashboard/operacoes/lancamento' }] : []),
        ...(isAdmin ? [{ title: 'Configurar Metas', href: '/dashboard/operacoes/metas' }] : [])
      ]
    },
    {
      title: 'Alertas de Homicídios',
      href: '/dashboard/alertas-homicidio',
      icon: AlertTriangle,
      badge: 'Prevenção'
    },
    {
      title: 'Escala Mensal',
      href: '/dashboard/escala',
      icon: Calendar
    },
    {
      title: 'Fiscalização de Egressos',
      href: '#',
      icon: UserCheck,
      onClick: () => setShowEgressosModal(true),
      badge: 'Em Breve'
    },
    ...(isAdmin ? [{
      title: 'Militares & Acessos',
      href: '/dashboard/usuarios',
      icon: Users
    }] : []),
    {
      title: 'Relatórios & BI',
      href: '/dashboard/relatorios',
      icon: BarChart2
    }
  ];

  const rolesList: UserRole[] = ['ADMIN', 'SOF', 'ALERTA_HOMICIDIO', 'EQUIPE'];

  return (
    <>
      <aside className="w-64 bg-white dark:bg-[#0C111D] text-gray-700 dark:text-gray-200 flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-[#1F242F] select-none min-h-screen">
        
        {/* Header / Brand */}
        <div className="p-5 border-b border-gray-100 dark:border-[#1F242F] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">SGP Salinas</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                PMMG
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">2º Pel / 2ª Cia PM Ind</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(s => pathname === s.href));
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            if (item.highlight) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-2 ${
                    pathname === item.href
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 hover:bg-brand-50/60 dark:hover:bg-brand-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>{item.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-200 border border-brand-200 dark:border-brand-800">
                    {item.badge}
                  </span>
                </Link>
              );
            }

            return (
              <div key={idx} className="space-y-0.5">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive && !item.subItems
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Sub-items */}
                {item.subItems && (
                  <div className="pl-9 pr-2 py-1 space-y-0.5">
                    {item.subItems.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isSubActive
                              ? 'text-brand-600 dark:text-brand-400 font-semibold bg-brand-50/50 dark:bg-brand-950/30'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                          }`}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Simulador de Perfil */}
        <div className="p-3 border-t border-gray-100 dark:border-[#1F242F]">
          <button
            type="button"
            onClick={() => setShowRoleTester(!showRoleTester)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-warning-500" />
              <span>Simular Perfil</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showRoleTester ? 'rotate-90' : ''}`} />
          </button>

          {showRoleTester && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-[#161B26] rounded-xl border border-gray-200 dark:border-gray-800 space-y-1 animate-in fade-in">
              <div className="grid grid-cols-2 gap-1">
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => switchUserRole(r)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold truncate transition-colors ${
                      user.role === r 
                        ? 'bg-brand-600 text-white shadow-xs' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Untitled UI User Profile Footer */}
        <div className="p-3.5 border-t border-gray-100 dark:border-[#1F242F] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-200 dark:border-brand-800 flex-shrink-0">
                {user.nome_guerra.slice(0, 2).toUpperCase()}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-white dark:ring-[#0C111D] absolute bottom-0 right-0" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {user.graduacao} {user.nome_guerra}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Encerrar Sessão"
            className="p-1.5 rounded-lg text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      <EgressosModal
        isOpen={showEgressosModal}
        onClose={() => setShowEgressosModal(false)}
      />
    </>
  );
}
