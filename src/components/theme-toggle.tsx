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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#161B26] hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs transition-all"
      title={isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
      type="button"
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-warning-500" />
          <span className="text-xs font-medium">Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-xs font-medium">Escuro</span>
        </>
      )}
    </button>
  );
}
