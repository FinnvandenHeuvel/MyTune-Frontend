import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { tokenStorage } from '../../data/storage/tokenStorage';
import { logout as logoutUsecase } from '../../application/usecases/auth/logout';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const syncAuth = useCallback(() => {
    const next = !!tokenStorage.getAccess();
    setIsAuthenticated((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    syncAuth();
  }, [syncAuth]);

  useEffect(() => {
    const onStorage = () => syncAuth();

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncAuth]);

  const logout = useCallback(() => {
    logoutUsecase();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      logout,
      syncAuth,
    }),
    [isAuthenticated, logout, syncAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
