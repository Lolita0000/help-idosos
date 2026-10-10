import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, ApiError, type RegisterInput, type User } from './core';
import { sessionStore } from './core/storage';

interface SessionState {
  ready: boolean;
  token: string | null;
  user: User | null;
  login(email: string, password: string): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
  /** Encerra a sessão quando a API responde que o token não vale mais (RN-013). */
  handleAuthError(error: unknown): boolean;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await sessionStore.get();
        if (saved) {
          const me = await api.me(saved);
          setToken(saved);
          setUser(me);
        }
      } catch {
        await sessionStore.clear();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await api.login(email, password);
    await sessionStore.set(s.token);
    setToken(s.token);
    setUser(s.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const s = await api.register(input);
    await sessionStore.set(s.token);
    setToken(s.token);
    setUser(s.user);
  }, []);

  const logout = useCallback(async () => {
    if (token) await api.logout(token).catch(() => undefined);
    await sessionStore.clear();
    setToken(null);
    setUser(null);
  }, [token]);

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
        void logout();
        return true;
      }
      return false;
    },
    [logout],
  );

  const value = useMemo(
    () => ({ ready, token, user, login, register, logout, handleAuthError }),
    [ready, token, user, login, register, logout, handleAuthError],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession fora do SessionProvider');
  return v;
}
