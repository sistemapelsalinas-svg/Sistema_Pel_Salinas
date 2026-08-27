'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { 
  Shield, 
  Compass, 
  Home, 
  Target, 
  AlertTriangle, 
  Calendar, 
  UserCheck, 
  Users, 
  BarChart2, 
  LogOut, 
  Search,
  PanelLeftClose,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import { RoleBadge } from './role-badge';
import { EgressosModal } from './egressos-modal';

import { storage } from '@/lib/storage';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, switchUserRole } = useAuth();
  const [showEgressosModal, setShowEgressosModal] = useState(false);
  const [showRoleTester, setShowRoleTester] = useState(false);

  if (!user) return null;

  const allLogs = storage.getLogs();
  const allTargets = storage.getTargets(8, 2026);
  const totalTargetCount = allTargets.reduce((acc, t) => acc + t.meta_total, 0);
  const totalExecutedCount = allLogs.length;
  const pctReal = totalTargetCount > 0 ? Math.min(100, Math.round((totalExecutedCount / totalTargetCount) * 100)) : 0;

  const isAdmin = user.role === 'ADMIN';
  const isSofOrAdmin = user.role === 'ADMIN' || user.role === 'SOF';

  const menuSections = [
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
        { title: 'Fiscalização de Egressos', href: '#', icon: UserCheck, onClick: () => setShowEgressosModal(true), badge: 'Breve' },
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

  const rolesList: UserRole[] = ['ADMIN', 'SOF', 'ALERTA_HOMICIDIO', 'EQUIPE'];

  return (
    <>
      <aside className="w-64 bg-white dark:bg-[#151A23] text-gray-700 dark:text-gray-200 flex flex-col flex-shrink-0 border-r border-gray-200/90 dark:border-[#222938] select-none min-h-screen">
        
        {/* Header (Figma/Untitled UI Style) */}
        <div className="p-4 border-b border-gray-100 dark:border-[#222938] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-950 dark:bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight leading-none">
                SGP Salinas
              </h1>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">2º Pel / 2ª Cia PM Ind</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="p-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#0E121A] border border-gray-200 dark:border-[#283042] rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-all"
            />
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-1 space-y-4 overflow-y-auto">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                {section.category}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  if (item.onClick) {
                    return (
                      <button
                        key={iIdx}
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-[#1D2432] hover:text-gray-900 dark:hover:text-white transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
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
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gray-100 dark:bg-[#1E2636] text-gray-950 dark:text-white font-semibold shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#19202D] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900 dark:text-emerald-400' : 'text-gray-400'}`} />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-semibold ${
                          item.badge === 'Plantão' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
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

        {/* Bottom Feature Widget (Matching "POINTS LIABILITY" from Figma Image) */}
        <div className="p-3">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0E121A] border border-gray-200/80 dark:border-[#222938] space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Missão do Plantão
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              Turno Ativo — {user.equipe_padrao || 'Salinas'}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Metas cumpridas</span>
                <span className="font-bold">{pctReal}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pctReal}%` }} />
              </div>
            </div>
            <Link
              href="/dashboard/missao-do-dia"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold shadow-xs transition-colors mt-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Ver Minha Missão</span>
            </Link>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-[#222938] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-gray-700 flex-shrink-0">
                {user.nome_guerra.slice(0, 2).toUpperCase()}
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#151A23] absolute bottom-0 right-0" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-none">
                {user.graduacao} {user.nome_guerra}
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">PM {user.numero_pm}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
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
