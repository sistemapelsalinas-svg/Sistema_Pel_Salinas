import React from 'react';
import { UserRole } from '@/lib/types';
import { Shield, Radio, AlertTriangle, Users } from 'lucide-react';

export function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case 'ADMIN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-error-50 dark:bg-error-950/40 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-800/60 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-error-500" />
          Admin
        </span>
      );
    case 'SOF':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          SOF Central
        </span>
      );
    case 'ALERTA_HOMICIDIO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-50 dark:bg-warning-950/40 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800/60 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
          Alerta Homicídios
        </span>
      );
    case 'EQUIPE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Equipe Rua
        </span>
      );
    default:
      return null;
  }
}
