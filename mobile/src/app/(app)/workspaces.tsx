// Meus Workspaces (Figma: workspace) e estado inicial sem workspaces (Figma: primeiro-contato).
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { JoinCodeDialog } from '../../components/JoinCodeDialog';
import { MenuButton } from '../../components/UserMenu';
import { Alert, Badge, Button, Card, Feather, Logo, Screen, T } from '../../components/ui';
import { api, type WorkspaceSummary } from '../../core';
import { plural, shortDateTime } from '../../core/format';
import { useLoad } from '../../hooks';
import { colors } from '../../theme';

type Filter = 'all' | 'admin' | 'member';

export default function Workspaces() {
  const { data, error, loading, reload } = useLoad((t) => api.listWorkspaces(t));
  const [joinOpen, setJoinOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const list = data ?? [];
  const counts = useMemo(
    () => ({
      all: list.length,
      admin: list.filter((w) => w.role === 'admin').length,
      member: list.filter((w) => w.role === 'member').length,
    }),
    [list],
  );
  const shown = filter === 'all' ? list : list.filter((w) => w.role === filter);

  const join = (
    <JoinCodeDialog
      visible={joinOpen}
      onClose={() => setJoinOpen(false)}
      onJoined={(ws) => {
        setJoinOpen(false);
        setNotice(`Você entrou no workspace “${ws.name}”.`);
        setFilter('all');
        void reload();
      }}
    />
  );

  if (loading && !data) {
    return (
      <Screen scroll={false} contentStyle={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  if (!error && list.length === 0) return <FirstContact onJoin={() => setJoinOpen(true)}>{join}</FirstContact>;

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.titleRow}>
        <MenuButton />
        <T w="semibold" size={25} style={{ marginLeft: 14 }} accessibilityRole="header">
          Meus Workspaces
        </T>
      </View>
      <T size={16} color={colors.textMuted} style={{ marginTop: 14 }}>
        Gerencie seus núcleos de cuidado e acompanhe a saúde de pessoas queridas.
      </T>
      <View style={styles.actions}>
        <Button title="Entrar com código" icon="key" variant="outline" small onPress={() => setJoinOpen(true)} style={{ flex: 1 }} />
        <Button title="+ Criar workspace" small onPress={() => router.push('/criar-workspace')} style={{ flex: 1 }} />
      </View>

      {notice ? <Alert tone="success" message={notice} /> : null}
      {error ? <Alert message={error} /> : null}

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['all', 'admin', 'member'] as Filter[]).map((f) => {
          const label = { all: 'Todos', admin: 'Admin', member: 'Membro' }[f];
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.tabActive]}
            >
              <T w="semibold" size={14} color={active ? colors.white : colors.text}>
                {label} ({counts[f]})
              </T>
            </Pressable>
          );
        })}
      </View>

      {shown.map((w) => (
        <WorkspaceCard key={w.id} ws={w} />
      ))}
      {shown.length === 0 ? (
        <T size={15} color={colors.textMuted} style={{ textAlign: 'center', marginTop: 24 }}>
          Nenhum workspace neste filtro.
        </T>
      ) : null}
      {join}
    </Screen>
  );
}

function WorkspaceCard({ ws }: { ws: WorkspaceSummary }) {
  const open = () => router.push({ pathname: '/workspace/[id]', params: { id: ws.id } });
  return (
    <Card style={styles.wsCard}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.wsIcon}>
          <Feather name="heart" size={30} color={colors.sky} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <T w="medium" size={18} style={{ flex: 1, marginRight: 8 }}>
              {ws.name}
            </T>
            <Badge label={ws.role === 'admin' ? 'Admin' : 'Membro'} tone={ws.role} />
          </View>
          <T size={13} color={colors.textMuted} style={{ marginTop: 2 }}>
            Criado por {ws.createdBy}
          </T>
        </View>
      </View>
      <T size={15} style={{ marginTop: 12 }}>
        {ws.description || `Acompanhamento da saúde de ${ws.subjectName}`}
      </T>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Feather name="users" size={16} color={colors.textMuted} />
          <T size={14} color={colors.textMuted} style={{ marginLeft: 6 }}>
            {plural(ws.memberCount, 'membro', 'membros')}
          </T>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={16} color={colors.textMuted} />
          <T size={14} color={colors.textMuted} style={{ marginLeft: 6 }}>
            {shortDateTime(ws.createdAt)}
          </T>
        </View>
      </View>
      <Button title="Acessar Workspace" onPress={open} small style={{ marginTop: 14 }} />
    </Card>
  );
}

function FirstContact({ onJoin, children }: { onJoin: () => void; children: React.ReactNode }) {
  return (
    <Screen contentStyle={styles.first}>
      <View style={{ alignSelf: 'flex-start' }}>
        <MenuButton />
      </View>
      <Logo variant="blue" width={190} />
      <T size={18} color="#3F3F46" style={styles.firstText}>
        Gerencie seus núcleos de cuidado e acompanhe a saúde de pessoas queridas
      </T>
      <Image
        source={require('../../../assets/images/ilustracao.webp')}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <View style={{ width: '100%', maxWidth: 340, gap: 14 }}>
        <Button title="+ Criar Workspace" onPress={() => router.push('/criar-workspace')} />
        <Button title="Entrar com código" icon="key" variant="ghost" onPress={onJoin} />
      </View>
      <View style={styles.info}>
        <Feather name="info" size={20} color={colors.sky} style={{ marginTop: 1 }} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <T w="semibold" size={15} color="#0A85B8">
            O que é um workspace?
          </T>
          <T size={14} color="#0A85B8" style={{ marginTop: 6 }}>
            É um espaço onde você e outras pessoas podem acompanhar de perto os cuidados dos seus entes queridos.
          </T>
        </View>
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center' },
  page: { paddingHorizontal: 22, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 18 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 999,
    padding: 5,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  tab: { minHeight: 44, paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  wsCard: { borderColor: '#5BD2F5', borderWidth: 1.5, marginBottom: 16 },
  wsIcon: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  first: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 12, paddingBottom: 32 },
  firstText: { textAlign: 'center', marginTop: 16, maxWidth: 360 },
  illustration: { width: 285, height: 224, marginVertical: 28 },
  info: {
    flexDirection: 'row',
    marginTop: 36,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#EAF6FD',
    width: '100%',
    maxWidth: 340,
  },
});
