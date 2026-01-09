import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { tokenStorage } from '../../data/storage/tokenStorage';
import { logout as logoutUsecase } from '../../application/usecases/auth/logout';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const syncAuth = useCallback(() => {
    setIsAuthenticated(!!tokenStorage.getAccess());
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, [syncAuth]);

  const logout = useCallback(() => {
    logoutUsecase();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated, // keep for your existing Login flow
      logout,
      syncAuth, // handy after login if you want it
    }),
    [isAuthenticated, logout, syncAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
