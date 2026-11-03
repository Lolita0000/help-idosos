import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { api, messageOf, type WorkspaceDetail } from './core';
import { workspaceCache } from './core/workspaceCache';
import { useSession } from './session';

export function useWorkspace(id: string) {
  const { token, handleAuthError } = useSession();
  const [ws, setWs] = useState<WorkspaceDetail | null>(() => workspaceCache.get(id) ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!workspaceCache.has(id));

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      const fresh = await api.getWorkspace(token, id);
      workspaceCache.set(id, fresh);
      setWs(fresh);
      setError(null);
    } catch (e) {
      if (!handleAuthError(e)) setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  }, [token, id, handleAuthError]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { ws, error, loading, reload };
}

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

/**
 * Liga os campos de um formulário em sequência: o Enter do teclado leva ao campo
 * seguinte e, no último, fecha o teclado (ou envia, se `onDone` for informado).
 * `last` é o índice do último campo de texto; `next` pula campos que não recebem foco.
 */
export function useFieldChain(last: number, onDone?: () => void) {
  const refs = useRef<(TextInput | null)[]>([]);
  return (i: number, next = i + 1) => ({
    inputRef: (el: TextInput | null) => {
      refs.current[i] = el;
    },
    returnKeyType: i >= last ? ('done' as const) : ('next' as const),
    onSubmitEditing: () => (i >= last ? onDone?.() : refs.current[next]?.focus()),
  });
}
