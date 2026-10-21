// Categorias e humores do diário (Figma: diario, nova entrada, dashboard).
import type { DiaryCategory, DiaryEntry, Mood } from './types';

export const CATEGORIES: { value: DiaryCategory; label: string; bg: string; fg: string }[] = [
  { value: 'medicamento', label: 'Medicamento', bg: '#D3DDFB', fg: '#1D4ED8' },
  { value: 'consulta', label: 'Consulta', bg: '#EBD9FC', fg: '#7E22CE' },
  { value: 'sintoma', label: 'Sintoma', bg: '#FDD5D5', fg: '#B42318' },
  { value: 'atividade', label: 'Atividade', bg: '#FDE3C8', fg: '#9A3412' },
  { value: 'alimentacao', label: 'Alimentação', bg: '#C9F0D8', fg: '#166534' },
  { value: 'observacao', label: 'Observação', bg: '#E5E7EB', fg: '#374151' },
];

export function categoryOf(value: DiaryCategory) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** Pontuação usada no "Humor médio" do dashboard, numa escala de 1 a 5. */
export const MOODS: { value: Mood; label: string; emoji: string; score: number }[] = [
  { value: 'otimo', label: 'Ótimo', emoji: '☺️', score: 5 },
  { value: 'bom', label: 'Bom', emoji: '🙂', score: 4 },
  { value: 'neutro', label: 'Neutro', emoji: '😕', score: 3 },
  { value: 'ruim', label: 'Ruim', emoji: '😣', score: 1 },
];

export function moodOf(value: Mood | null) {
  return MOODS.find((m) => m.value === value) ?? null;
}

const DAY = 24 * 3600_000;

/** Números dos cartões do dashboard, calculados a partir das entradas. */
export function diaryStats(entries: DiaryEntry[], now = Date.now()) {
  const week = entries.filter((e) => now - new Date(e.createdAt).getTime() < 7 * DAY);
  const scores = week.map((e) => moodOf(e.mood)?.score).filter((s): s is number => s !== undefined);
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    count: entries.filter((e) => e.category === c.value).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  return {
    total: entries.length,
    thisWeek: week.length,
    averageMood: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    byCategory,
    lastUpdate: entries[0]?.createdAt ?? null,
  };
}
