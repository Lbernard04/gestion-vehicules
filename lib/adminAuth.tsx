'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'gestion-vehicules-admin';
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || 'Oss117';

interface AdminContextValue {
  isAdmin: boolean;
  ready: boolean;
  unlock: (code: string) => boolean;
  lock: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsAdmin(window.localStorage.getItem(STORAGE_KEY) === 'true');
    setReady(true);
  }, []);

  function unlock(code: string): boolean {
    if (code === ADMIN_CODE) {
      window.localStorage.setItem(STORAGE_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  }

  function lock() {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }

  return <AdminContext.Provider value={{ isAdmin, ready, unlock, lock }}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin doit être utilisé à l’intérieur de <AdminProvider>.');
  }
  return ctx;
}
