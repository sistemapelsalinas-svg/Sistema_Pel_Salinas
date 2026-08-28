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
      <div className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-800" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#161B26] hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs transition-all flex-shrink-0"
      title={isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
      type="button"
      aria-label="Alternar tema"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-medium hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
          <span className="text-xs font-medium hidden sm:inline">Escuro</span>
        </>
      )}
    </button>
  );
}
