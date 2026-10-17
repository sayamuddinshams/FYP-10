import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { subscribe } from '../data/store';
import authService from '../services/authService';

/**
 * Authentication Context & Provider
 * ---------------------------------
 * Manages user authentication state throughout the app.
 * Features:
 *  - Persistent session recovery on mount
 *  - Real-time synchronization with the data store
 *  - Simple helper methods: login(), signup(), loginWithGoogle(), logout()
 *  - Convenience getters: isAuthenticated, role
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Current user object: { id, name, email, role: 'tenant'|'owner'|'admin', ... } or null
  const [user, setUser] = useState(null);
  // True while checking for an existing active session on initial app load
  const [initializing, setInitializing] = useState(true);

  // Restore the session once when the app mounts
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

  // Synchronize state when user details update anywhere in the store (e.g. edit profile)
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

  // Authenticate with email/password (or demo buttons)
  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  // Register a new tenant or owner account
  const signup = useCallback(async (payload) => {
    const u = await authService.signup(payload);
    setUser(u);
    return u;
  }, []);

  // One-click demo Google sign-in
  const loginWithGoogle = useCallback(async () => {
    const u = await authService.loginWithGoogle();
    setUser(u);
    return u;
  }, []);

  // End session and clear auth state
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      signup,
      loginWithGoogle,
      logout,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
    }),
    [user, initializing, login, signup, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication state in any component.
 * Usage: const { user, login, logout, role } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
