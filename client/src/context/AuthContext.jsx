import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know whether someone is logged in

  // Restore the session (the login cookie is sent automatically)
  useEffect(() => {
    authService.getMe().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  // api.js fires this when any request comes back 401
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (body) => {
    const res = await authService.login(body);
    setUser(res.data);
    return res.data;
  }, []);

  const register = useCallback(async (body) => {
    const res = await authService.register(body);
    setUser(res.data);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } finally { setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, setUser, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
