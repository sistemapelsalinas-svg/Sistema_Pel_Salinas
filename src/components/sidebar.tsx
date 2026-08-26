'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { 
  Shield, 
  Compass, 
  LayoutDashboard, 
  Target, 
  PlusCircle, 
  AlertTriangle, 
  CalendarDays, 
  UserCheck, 
  Users, 
  BarChart3, 
  LogOut, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { RoleBadge } from './role-badge';
import { EgressosModal } from './egressos-modal';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, switchUserRole, switchActiveUser } = useAuth();
  const [showEgressosModal, setShowEgressosModal] = useState(false);
  const [showRoleTester, setShowRoleTester] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isSofOrAdmin = user.role === 'ADMIN' || user.role === 'SOF';
  const isAlertaOrAdmin = user.role === 'ADMIN' || user.role === 'ALERTA_HOMICIDIO';

  const navItems = [
    {
      title: 'Minha Missão do Dia',
      href: '/dashboard/missao-do-dia',
      icon: Compass,
      highlight: true,
      badge: 'PRIORIDADE'
    },
    {
      title: 'Painel Geral',
      href: '/dashboard',
      icon: LayoutDashboard
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
      title: 'Alerta de Homicídios',
      href: '/dashboard/alertas-homicidio',
      icon: AlertTriangle,
      badge: 'PREVENÇÃO'
    },
    {
      title: 'Escala de Serviço',
      href: '/dashboard/escala',
      icon: CalendarDays
    },
    {
      title: 'Fiscalização de Egressos',
      href: '#',
      icon: UserCheck,
      onClick: () => setShowEgressosModal(true),
      badge: 'EM BREVE'
    },
    ...(isAdmin ? [{
      title: 'Militares & Usuários',
      href: '/dashboard/usuarios',
      icon: Users
    }] : []),
    {
      title: 'Relatórios & Produtividade',
      href: '/dashboard/relatorios',
      icon: BarChart3
    }
  ];

  const rolesList: UserRole[] = ['ADMIN', 'SOF', 'ALERTA_HOMICIDIO', 'EQUIPE'];

  return (
    <>
      <aside className="w-72 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none min-h-screen">
        {/* Header da Fração PM */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3.5 bg-slate-950/70">
          <div className="w-11 h-11 rounded-xl bg-emerald-700/30 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">SGP SALINAS</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PMMG
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">2º Pel / 2ª Cia PM Ind</p>
            <p className="text-[10px] text-emerald-400/80 font-medium">11ª RPM — Norte de Minas</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(s => pathname === s.href));
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
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
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-900/30 ring-1 ring-emerald-400/50'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-400" />
                    <span>{item.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 animate-pulse">
                    HOJE
                  </span>
                </Link>
              );
            }

            return (
              <div key={idx} className="space-y-1">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive && !item.subItems
                      ? 'bg-slate-800 text-white font-bold border-l-4 border-emerald-500'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Sub-items */}
                {item.subItems && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {item.subItems.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                            isSubActive
                              ? 'bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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

        {/* Simulador de Papéis (Tester de Perfis) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
          <button
            type="button"
            onClick={() => setShowRoleTester(!showRoleTester)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-slate-200 text-[11px] font-medium"
          >
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulador de Perfil (Demo)</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showRoleTester ? 'rotate-90' : ''}`} />
          </button>

          {showRoleTester && (
            <div className="mt-2 p-2 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5 animate-in fade-in">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Alternar Perfil Atual:</p>
              <div className="grid grid-cols-2 gap-1">
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => switchUserRole(r)}
                    className={`px-2 py-1 rounded text-[10px] font-bold truncate transition-colors ${
                      user.role === r 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perfil do Usuário & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
              {user.nome_guerra.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.graduacao} {user.nome_guerra}</p>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sair do Sistema"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
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
