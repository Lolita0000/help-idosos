// RNF-004: tamanho da fonte escolhido pela pessoa, aplicado a todas as telas.
// O componente de texto (T) e os campos de digitação multiplicam seus tamanhos por `scale`.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { dataStore } from './core/storage';

export type FontSize = 'pequena' | 'media' | 'grande';

export const FONT_SIZES: { value: FontSize; label: string; hint: string; scale: number }[] = [
  { value: 'pequena', label: 'Pequena', hint: 'Fonte menor para visualização compacta', scale: 0.9 },
  { value: 'media', label: 'Média (padrão)', hint: 'Tamanho padrão recomendado', scale: 1 },
  { value: 'grande', label: 'Grande', hint: 'Fonte maior para melhor legibilidade', scale: 1.25 },
];

const KEY = 'elo.fontSize';

interface FontScaleState {
  size: FontSize;
  scale: number;
  setSize(size: FontSize): Promise<void>;
}

const Ctx = createContext<FontScaleState>({ size: 'media', scale: 1, setSize: async () => undefined });

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [size, setSizeState] = useState<FontSize>('media');

  // A escolha fica salva no aparelho e vale a partir da próxima abertura do app.
  useEffect(() => {
    dataStore
      .get(KEY)
      .then((saved) => {
        if (saved && FONT_SIZES.some((f) => f.value === saved)) setSizeState(saved as FontSize);
      })
      .catch(() => undefined);
  }, []);

  const setSize = useCallback(async (next: FontSize) => {
    setSizeState(next);
    await dataStore.set(KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ size, scale: FONT_SIZES.find((f) => f.value === size)?.scale ?? 1, setSize }),
    [size, setSize],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFontScale(): FontScaleState {
  return useContext(Ctx);
}
