import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, ApiError, type RegisterInput, type User } from './core';
import { sessionStore } from './core/storage';

interface SessionState {
  ready: boolean;
  token: string | null;
  user: User | null;
  login(email: string, password: string): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  /** Para onde a área autenticada leva quando a sessão termina. */
  exitTo: '/' | '/login';
  /** Sai da conta e leva à tela de login. */
  logout(): Promise<void>;
  /** HU-05: exclui a conta no servidor, encerra a sessão e leva à tela inicial. */
  deleteAccount(): Promise<void>;
  /** Encerra a sessão quando a API responde que o token não vale mais (RN-013). */
  handleAuthError(error: unknown): boolean;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // O destino é definido antes de limpar o usuário, para a área autenticada já
  // redirecionar ao lugar certo (sem disputar a navegação com a tela que saiu).
  const [exitTo, setExitTo] = useState<'/' | '/login'>('/');

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
    setExitTo('/login');
    setToken(null);
    setUser(null);
  }, [token]);

  const deleteAccount = useCallback(async () => {
    if (!token) return;
    await api.deleteAccount(token);
    await sessionStore.clear();
    setExitTo('/');
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
    () => ({ ready, token, user, exitTo, login, register, logout, deleteAccount, handleAuthError }),
    [ready, token, user, exitTo, login, register, logout, deleteAccount, handleAuthError],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession fora do SessionProvider');
  return v;
}
