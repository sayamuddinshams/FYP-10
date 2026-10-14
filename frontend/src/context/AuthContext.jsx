import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { subscribe } from '../data/store';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restore the session once on boot.
  useEffect(() => {
    let active = true;
    authService
      .getSession()
      .then((u) => {
        if (active) setUser(u);
      })
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep the profile in sync when other parts of the app update it.
  useEffect(() => {
    return subscribe(() => {
      const current = authService.currentUser();
      setUser((prev) => {
        if (!prev && !current) return prev;
        if (prev?.id === current?.id) return current;
        if (prev && !current) return null;
        return current;
      });
    });
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (payload) => {
    const u = await authService.signup(payload);
    setUser(u);
    return u;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const u = await authService.loginWithGoogle();
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, signup, loginWithGoogle, logout, isAuthenticated: Boolean(user), role: user?.role || null }),
    [user, initializing, login, signup, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
