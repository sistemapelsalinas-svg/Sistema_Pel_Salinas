import React from 'react';
import { RiskLevel } from '@/lib/types';
import { Flame, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  switch (risk) {
    case 'CRITICO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse shadow-sm">
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          CRÍTICO
        </span>
      );
    case 'ALTO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm">
          <AlertOctagon className="w-3.5 h-3.5 text-slate-950" />
          ALTO RISCO
        </span>
      );
    case 'MEDIO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/90 text-slate-900 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-900" />
          MÉDIO
        </span>
      );
    case 'BAIXO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-600 text-white shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          BAIXO
        </span>
      );
    default:
      return null;
  }
}
