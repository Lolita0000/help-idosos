// Diário do workspace (abre direto em /workspace/[id]): histórico das entradas com contagem e
// filtros por categoria e por autor (HU-08) e ações de editar/excluir (HU-04, HU-06, HU-07).
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppHeader } from '../../../../components/AppHeader';
import { EntryCard } from '../../../../components/EntryCard';
import { Select } from '../../../../components/Select';
import { Alert, Button, Feather, Screen, T } from '../../../../components/ui';
import { useEntryActions } from '../../../../components/useEntryActions';
import { api, type DiaryCategory } from '../../../../core';
import { CATEGORIES } from '../../../../core/diary';
import { plural } from '../../../../core/format';
import { useLoad } from '../../../../hooks';
import { colors } from '../../../../theme';

type Filter = DiaryCategory | 'todas';
const FILTERS = [{ value: 'todas' as Filter, label: 'Todas as categorias' }, ...CATEGORIES];
const ALL_AUTHORS = 'todos';

export default function Diario() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(async (t) => {
    const [ws, entries] = await Promise.all([api.getWorkspace(t, id), api.listEntries(t, id)]);
    return { ws, entries };
  });
  const actions = useEntryActions(id, data?.ws.role, () => void reload());
  const [filter, setFilter] = useState<Filter>('todas');
  const [author, setAuthor] = useState<string>(ALL_AUTHORS);

  const entries = data?.entries ?? [];
  // Autores que aparecem nas entradas do workspace, em ordem alfabética.
  const authors = useMemo(() => {
    const byId = new Map(entries.map((e) => [e.authorId, e.authorName]));
    return [
      { value: ALL_AUTHORS, label: 'Todos os autores' },
      ...[...byId].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
    ];
  }, [entries]);
  // HU-08: os filtros são combináveis e a lista mantém a ordem da mais recente para a mais antiga.
  const shown = useMemo(
    () =>
      entries.filter(
        (e) => (filter === 'todas' || e.category === filter) && (author === ALL_AUTHORS || e.authorId === author),
      ),
    [entries, filter, author],
  );
  const filtered = filter !== 'todas' || author !== ALL_AUTHORS;

  const newEntry = () => router.push({ pathname: '/workspace/[id]/diario/entrada', params: { id } });

  return (
    <Screen contentStyle={{ paddingBottom: 24 }}>
      <AppHeader workspace={{ id, role: data?.ws.role }} current="diario" title={data?.ws.name} />
      <View style={styles.intro}>
        <T w="semibold" size={26} accessibilityRole="header">
          Diário de Cuidado
        </T>
        <T size={16} color={colors.textMuted} style={{ marginTop: 4 }}>
          Registre e acompanhe todas as informações importantes
        </T>
        {data ? (
          <Button title="+ Nova entrada" small onPress={newEntry} style={{ alignSelf: 'flex-start', marginTop: 14 }} />
        ) : null}
      </View>

      <View style={styles.pad}>
        {data && entries.length > 0 ? (
          <>
            <View style={styles.filterRow}>
              <Feather name="filter" size={22} color={colors.text} />
              <Select label="Filtrar por categoria" value={filter} options={FILTERS} onChange={setFilter} compact />
              <Select label="Filtrar por autor" value={author} options={authors} onChange={setAuthor} compact />
            </View>
            <T size={14} color={colors.textMuted} style={{ marginBottom: 12 }} accessibilityLiveRegion="polite">
              {filtered
                ? `${plural(shown.length, 'registro exibido', 'registros exibidos')} de ${entries.length}`
                : plural(entries.length, 'registro', 'registros')}
            </T>
          </>
        ) : null}

        {actions.notice ? <Alert tone="success" message={actions.notice} /> : null}
        {actions.failure ? <Alert message={actions.failure} /> : null}
        {error ? <Alert message={error} /> : null}

        {loading && !data ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : !data ? null : entries.length === 0 ? (
          <Empty onNew={newEntry} />
        ) : shown.length === 0 ? (
          <T size={15} color={colors.textMuted} style={{ textAlign: 'center', marginTop: 24 }}>
            Nenhuma entrada com esses filtros.
          </T>
        ) : (
          shown.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              {...actions.permissions(e)}
              onEdit={() => actions.edit(e)}
              onDelete={() => actions.requestDelete(e)}
            />
          ))
        )}
      </View>
      {actions.dialog}
    </Screen>
  );
}

function Empty({ onNew }: { onNew: () => void }) {
  return (
    <View style={styles.empty}>
      <Feather name="book-open" size={36} color={colors.primary} />
      <T w="semibold" size={17} style={{ marginTop: 12, textAlign: 'center' }}>
        Nenhuma entrada ainda
      </T>
      <T size={15} color={colors.textMuted} style={{ marginTop: 6, textAlign: 'center' }}>
        Registre medicamentos, consultas, sintomas e o que mais for importante no cuidado.
      </T>
      <Button title="Registrar a primeira entrada" small onPress={onNew} style={{ marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  pad: { paddingHorizontal: 22, paddingTop: 18 },
  filterRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  empty: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#D6E4F5',
    borderRadius: 12,
    backgroundColor: colors.bgSoft,
    marginTop: 8,
  },
});
