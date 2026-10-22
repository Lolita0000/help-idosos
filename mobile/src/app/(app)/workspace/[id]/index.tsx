// Diário do workspace (abre direto em /workspace/[id]): entradas com filtro por categoria e ações de editar/excluir (HU-04, HU-06, HU-07).
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '../../../../components/AppHeader';
import { EntryCard } from '../../../../components/EntryCard';
import { Select } from '../../../../components/Select';
import { Alert, Button, Feather, Screen, T } from '../../../../components/ui';
import { useEntryActions } from '../../../../components/useEntryActions';
import { api, type DiaryCategory } from '../../../../core';
import { CATEGORIES } from '../../../../core/diary';
import { useLoad } from '../../../../hooks';
import { colors, fonts } from '../../../../theme';

type Filter = DiaryCategory | 'todas';
const FILTERS = [{ value: 'todas' as Filter, label: 'Todas as categorias' }, ...CATEGORIES];

export default function Diario() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(async (t) => {
    const [ws, entries] = await Promise.all([api.getWorkspace(t, id), api.listEntries(t, id)]);
    return { ws, entries };
  });
  const actions = useEntryActions(id, data?.ws.role, () => void reload());
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');

  const entries = data?.entries ?? [];
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (filter === 'todas' || e.category === filter) &&
        (!term || e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term)),
    );
  }, [entries, q, filter]);

  const newEntry = () => router.push({ pathname: '/workspace/[id]/diario/entrada', params: { id } });

  return (
    <Screen contentStyle={{ paddingBottom: 24 }}>
      <AppHeader workspace={{ id, role: data?.ws.role }} current="diario" />
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
        <View style={styles.search}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar entradas..."
            placeholderTextColor="#757575"
            accessibilityLabel="Buscar entradas"
            style={[styles.searchInput, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null]}
          />
        </View>
        <View style={styles.filterRow}>
          <Feather name="filter" size={22} color={colors.text} style={{ marginRight: 10 }} />
          <Select label="Filtrar por categoria" value={filter} options={FILTERS} onChange={setFilter} compact />
        </View>

        {actions.notice ? <Alert tone="success" message={actions.notice} /> : null}
        {actions.failure ? <Alert message={actions.failure} /> : null}
        {error ? <Alert message={error} /> : null}

        {loading && !data ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : !data ? null : entries.length === 0 ? (
          <Empty onNew={newEntry} />
        ) : shown.length === 0 ? (
          <T size={15} color={colors.textMuted} style={{ textAlign: 'center', marginTop: 24 }}>
            Nenhuma entrada encontrada com esses filtros.
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: fonts.regular, fontSize: 16, color: colors.text, minHeight: 46 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 16 },
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
