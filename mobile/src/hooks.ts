import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { messageOf } from './core';
import { useSession } from './session';

/**
 * Mensagem de confirmação ou de erro que some sozinha depois de alguns segundos
 * e também ao sair da tela, para não ficar pendurada na próxima visita.
 */
export function useTransient(ms = 4000) {
  const [value, setValue] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const show = useCallback(
    (message: string | null) => {
      stop();
      setValue(message);
      if (message !== null) timer.current = setTimeout(() => setValue(null), ms);
    },
    [ms, stop],
  );

  useEffect(() => stop, [stop]);
  useFocusEffect(
    useCallback(
      () => () => {
        stop();
        setValue(null);
      },
      [stop],
    ),
  );

  return [value, show] as const;
}

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
