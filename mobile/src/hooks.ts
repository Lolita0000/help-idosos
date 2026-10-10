import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { messageOf } from './core';
import { useSession } from './session';

/** Carrega dados sempre que a tela ganha foco, tratando sessão expirada. */
export function useLoad<T>(loader: (token: string) => Promise<T>) {
  const { token, handleAuthError } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setData(await loaderRef.current(token));
      setError(null);
    } catch (e) {
      if (!handleAuthError(e)) setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { data, error, loading, reload, setData };
}
