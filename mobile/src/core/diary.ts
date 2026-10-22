// Categorias do diário (RF05), as mesmas do EntryLabel do backend.
import type { DiaryCategory, DiaryEntry } from './types';

export const CATEGORIES: { value: DiaryCategory; label: string; bg: string; fg: string }[] = [
  { value: 'medicamento', label: 'Medicamento', bg: '#D3DDFB', fg: '#1D4ED8' },
  { value: 'humor', label: 'Humor', bg: '#FDE3C8', fg: '#9A3412' },
  { value: 'sintoma', label: 'Sintoma', bg: '#FDD5D5', fg: '#B42318' },
  { value: 'consulta', label: 'Consulta', bg: '#EBD9FC', fg: '#7E22CE' },
  { value: 'observacao', label: 'Observação', bg: '#C9F0D8', fg: '#166534' },
  { value: 'outro', label: 'Outro', bg: '#E5E7EB', fg: '#374151' },
];

export function categoryOf(value: DiaryCategory) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

const DAY = 24 * 3600_000;

/** Números dos cartões do dashboard, calculados a partir das entradas. */
export function diaryStats(entries: DiaryEntry[], now = Date.now()) {
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    count: entries.filter((e) => e.category === c.value).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  return {
    total: entries.length,
    thisWeek: entries.filter((e) => now - new Date(e.createdAt).getTime() < 7 * DAY).length,
    byCategory,
    lastUpdate: entries[0]?.createdAt ?? null,
  };
}
