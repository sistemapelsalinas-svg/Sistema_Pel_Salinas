import React from 'react';
import { UserRole } from '@/lib/types';
import { Shield, Radio, AlertTriangle, Users } from 'lucide-react';

export function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case 'ADMIN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-900">
          <Shield className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          ADMINISTRADOR
        </span>
      );
    case 'SOF':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-900">
          <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          S.O.F. (SALA DE OPS)
        </span>
      );
    case 'ALERTA_HOMICIDIO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          ALERTA DE HOMICÍDIO
        </span>
      );
    case 'EQUIPE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900">
          <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          EQUIPE OPERACIONAL
        </span>
      );
    default:
      return null;
  }
}
