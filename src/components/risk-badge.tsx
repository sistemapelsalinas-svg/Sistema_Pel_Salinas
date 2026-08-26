import React from 'react';
import { RiskLevel } from '@/lib/types';

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  switch (risk) {
    case 'CRITICO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-50 dark:bg-error-950/50 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-error-500 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-error-600 -ml-3.5" />
          Crítico
        </span>
      );
    case 'ALTO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-50 dark:bg-warning-950/50 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
          Alto Risco
        </span>
      );
    case 'MEDIO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Médio
        </span>
      );
    case 'BAIXO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Baixo
        </span>
      );
    default:
      return null;
  }
}
