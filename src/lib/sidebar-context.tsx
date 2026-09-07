'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sgp_salinas_sidebar_collapsed_v1');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sgp_salinas_sidebar_collapsed_v1', String(next));
      }
      return next;
    });
  };

  const handleSetIsCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sgp_salinas_sidebar_collapsed_v1', String(val));
    }
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetIsCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {}
    };
  }
  return context;
}
