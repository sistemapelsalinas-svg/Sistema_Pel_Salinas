'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-gray-800 flex items-center justify-center text-slate-400" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm"
      title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro Tático'}
      type="button"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Modo Clean</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Modo Tático</span>
        </>
      )}
    </button>
  );
}
