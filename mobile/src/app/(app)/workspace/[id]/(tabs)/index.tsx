// Figma: dashboard — resumo do cuidado, últimas entradas, registros por categoria e equipe.
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '../../../../../components/AppHeader';
import { EntryCard } from '../../../../../components/EntryCard';
import { Alert, Avatar, Badge, Button, Feather, Screen, T } from '../../../../../components/ui';
import { useEntryActions } from '../../../../../components/useEntryActions';
import { api, type WorkspaceDetail } from '../../../../../core';
import { diaryStats } from '../../../../../core/diary';
import { initials, relativeTime } from '../../../../../core/format';
import { useLoad } from '../../../../../hooks';
import { colors, radius } from '../../../../../theme';

const LATEST = 3;

export default function Dashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(async (t) => {
    const [ws, entries] = await Promise.all([api.getWorkspace(t, id), api.listEntries(t, id)]);
    return { ws, entries };
  });
  const actions = useEntryActions(id, data?.ws.role, () => void reload());

  const newEntry = () => router.push({ pathname: '/workspace/[id]/diario/entrada', params: { id } });
  const goDiario = () => router.navigate({ pathname: '/workspace/[id]/diario', params: { id } });
  const goMembros = () => router.push({ pathname: '/workspace/[id]/membros', params: { id } });

  return (
    <Screen edges={['top']} contentStyle={{ paddingBottom: 24 }}>
      <AppHeader workspace={{ id, role: data?.ws.role }} current="dashboard" />
      {loading && !data ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
      ) : error || !data ? (
        <View style={styles.pad}>
          <Alert message={error ?? 'Workspace não encontrado.'} />
        </View>
      ) : (
        <View style={styles.pad}>
          <Body ws={data.ws} entries={data.entries} actions={actions} onNew={newEntry} onDiario={goDiario} onMembros={goMembros} />
        </View>
      )}
      {actions.dialog}
    </Screen>
  );
}

function Body({
  ws,
  entries,
  actions,
  onNew,
  onDiario,
  onMembros,
}: {
  ws: WorkspaceDetail;
  entries: Parameters<typeof diaryStats>[0];
  actions: ReturnType<typeof useEntryActions>;
  onNew: () => void;
  onDiario: () => void;
  onMembros: () => void;
}) {
  const stats = diaryStats(entries);
  const maxCategory = Math.max(1, ...stats.byCategory.map((c) => c.count));

  return (
    <>
      <T w="semibold" size={26} accessibilityRole="header">
        Dashboard
      </T>
      <T size={16} color={colors.textMuted} style={{ marginTop: 4 }}>
        Resumo de cuidado - {ws.name}
      </T>
      <Button title="+ Nova entrada" small onPress={onNew} style={{ alignSelf: 'flex-start', marginTop: 14, marginBottom: 16 }} />

      {actions.notice ? <Alert tone="success" message={actions.notice} /> : null}
      {actions.failure ? <Alert message={actions.failure} /> : null}

      <View style={styles.subject}>
        <View style={styles.heart}>
          <Feather name="heart" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <T size={13} color="#374151">
            Pessoa acompanhada
          </T>
          <T w="semibold" size={17}>
            {ws.subjectName}
          </T>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Feather name="clock" size={13} color="#374151" />
            <T size={13} color="#374151" style={{ marginLeft: 5, flexShrink: 1 }}>
              {stats.lastUpdate ? `Última atualização ${relativeTime(stats.lastUpdate)}` : 'Nenhum registro ainda'}
            </T>
          </View>
        </View>
        <View style={styles.faces} accessibilityLabel={`${ws.members.length} participantes`}>
          {ws.members.slice(0, 3).map((m, i) => (
            <View key={m.userId} style={{ marginLeft: i ? -8 : 0 }}>
              <Avatar text={initials(m.name)} size={26} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.grid}>
        <Stat label="Total de Registros" icon="book-open" value={String(stats.total)} hint="Desde o início" />
        <Stat label="Esta semana" icon="calendar" value={String(stats.thisWeek)} hint="Registros nos últimos 7 dias" />
        <Stat label="Membros ativos" icon="users" value={String(ws.members.length)} hint="Participando do cuidado" />
        <Stat
          label="Humor médio"
          icon="trending-up"
          value={stats.averageMood === null ? '—' : stats.averageMood.toFixed(1).replace('.', ',')}
          hint="Nos últimos 7 dias"
        />
      </View>

      <Panel
        title="Últimas Entradas"
        action={
          entries.length ? (
            <Pressable onPress={onDiario} accessibilityRole="link" hitSlop={10} style={styles.link}>
              <T w="medium" size={14} color={colors.primary}>
                Ver todas
              </T>
            </Pressable>
          ) : null
        }
      >
        {entries.length === 0 ? (
          <T size={15} color={colors.textMuted}>
            Ainda não há entradas no diário. Toque em “+ Nova entrada” para registrar a primeira.
          </T>
        ) : (
          entries.slice(0, LATEST).map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              {...actions.permissions(e)}
              onEdit={() => actions.edit(e)}
              onDelete={() => actions.requestDelete(e)}
            />
          ))
        )}
      </Panel>

      {stats.byCategory.length ? (
        <Panel title="Registros por categoria">
          {stats.byCategory.map((c) => (
            <View key={c.value} style={{ marginBottom: 12 }} accessibilityLabel={`${c.label}: ${c.count}`}>
              <View style={styles.barLabel}>
                <T size={16}>{c.label}</T>
                <T size={16}>{c.count}</T>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(c.count / maxCategory) * 100}%` }]} />
              </View>
            </View>
          ))}
        </Panel>
      ) : null}

      <Panel
        title="Equipe de cuidado"
        action={
          <Pressable onPress={onMembros} accessibilityRole="button" accessibilityLabel="Ver membros" hitSlop={10} style={styles.link}>
            <Feather name="arrow-right" size={22} color={colors.text} />
          </Pressable>
        }
      >
        {ws.members.map((m) => (
          <Person key={m.userId} name={m.name} role={m.role === 'admin' ? 'Admin' : 'Membro'} />
        ))}
        <Person name={ws.subjectName} role="Sujeito" subject />
      </Panel>
    </>
  );
}

function Stat({ label, icon, value, hint }: { label: string; icon: keyof typeof Feather.glyphMap; value: string; hint: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}. ${hint}`}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <T size={14} style={{ flex: 1 }}>
          {label}
        </T>
        <View style={styles.statIcon}>
          <Feather name={icon} size={13} color={colors.primary} />
        </View>
      </View>
      <T w="bold" size={22} style={{ marginTop: 8 }}>
        {value}
      </T>
      <T size={12} color="#374151" style={{ marginTop: 2 }}>
        {hint}
      </T>
    </View>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <T w="semibold" size={19} style={{ flex: 1 }} accessibilityRole="header">
          {title}
        </T>
        {action}
      </View>
      {children}
    </View>
  );
}

function Person({ name, role, subject }: { name: string; role: string; subject?: boolean }) {
  return (
    <View style={styles.person}>
      <Avatar text={initials(name)} size={38} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T w="medium" size={15} style={{ flexShrink: 1 }}>
            {name}
          </T>
          {subject ? (
            <View style={{ marginLeft: 8 }}>
              <Badge label="Sujeito" tone="info" />
            </View>
          ) : null}
        </View>
        <T size={13} color={colors.textMuted}>
          {role}
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 22, paddingTop: 20 },
  subject: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#9DB8F2',
    borderRadius: radius.md,
    padding: 12,
  },
  heart: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#B6C8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faces: { flexDirection: 'row', alignSelf: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, rowGap: 12 },
  stat: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: '#9DB8F2',
    borderRadius: radius.md,
    padding: 12,
  },
  statIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    borderWidth: 1,
    borderColor: '#9DB8F2',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 18,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  link: { minHeight: 44, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: '#D9D9D9', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  person: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
});
