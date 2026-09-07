'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
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
  SlidersHorizontal, 
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { EgressosModal } from './egressos-modal';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [showEgressosModal, setShowEgressosModal] = useState(false);

  if (!user) return null;

  const isExpanded = !isCollapsed || isHovered;
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
        { title: 'Militares & Acessos', href: '/dashboard/usuarios', icon: Users },
        { title: 'Relatórios & Produtividade', href: '/dashboard/relatorios', icon: BarChart2 },
      ]
    }
  ];

  return (
    <>
      <aside 
        onMouseEnter={() => {
          if (isCollapsed) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (isCollapsed) setIsHovered(false);
        }}
        className={`hidden lg:flex flex-col flex-shrink-0 border-r border-gray-200/90 dark:border-[#222938] bg-white dark:bg-[#151A23] sticky top-0 h-screen select-none transition-all duration-300 ${
          isExpanded ? 'w-64 z-40 shadow-xl' : 'w-16 z-30'
        }`}
      >
        
        {/* Header da Sidebar */}
        <div className={`p-3.5 border-b border-gray-100 dark:border-[#222938] flex items-center ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-950 dark:bg-emerald-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight leading-none truncate">
                  SGP Salinas
                </h1>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">2º Pel / 2ª Cia PM Ind</p>
              </div>
            )}
          </div>

          {/* Botão de Toggle do Menu */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E2636] transition-colors"
          >
            {!isExpanded ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {isExpanded && (
                <p className="px-2 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase truncate">
                  {section.category}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  if (item.onClick) {
                    return (
                      <button
                        key={iIdx}
                        onClick={item.onClick}
                        title={!isExpanded ? item.title : undefined}
                        className={`w-full flex items-center ${!isExpanded ? 'justify-center px-0 py-2.5' : 'justify-between px-2.5 py-2'} rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-[#1D2432] hover:text-gray-900 dark:hover:text-white transition-all text-left`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          {isExpanded && <span className="truncate">{item.title}</span>}
                        </div>
                        {isExpanded && item.badge && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0">
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
                      title={!isExpanded ? item.title : undefined}
                      className={`flex items-center ${!isExpanded ? 'justify-center px-0 py-2.5' : 'justify-between px-2.5 py-2'} rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gray-100 dark:bg-[#1E2636] text-gray-950 dark:text-white font-semibold shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#19202D] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gray-900 dark:text-emerald-400' : 'text-gray-400'}`} />
                        {isExpanded && <span className="truncate">{item.title}</span>}
                      </div>
                      {isExpanded && item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-semibold flex-shrink-0 ${
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

        {/* User Profile Footer */}
        <div className={`p-3 border-t border-gray-100 dark:border-[#222938] flex items-center ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-gray-700 flex-shrink-0">
                {user.nome_guerra.slice(0, 2).toUpperCase()}
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#151A23] absolute bottom-0 right-0" />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-none">
                  {user.nome_guerra}
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">PM {user.numero_pm}</p>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </aside>

      <EgressosModal
        isOpen={showEgressosModal}
        onClose={() => setShowEgressosModal(false)}
      />
    </>
  );
}
