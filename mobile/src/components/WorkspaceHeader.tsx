import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Role } from '../core';
import { colors } from '../theme';
import { Feather, T } from './ui';

/**
 * Cabeçalho das telas internas do workspace na v0.1.
 * Dashboard e Diário entram na v0.2; por isso a navegação aqui mostra só
 * Membros e, para o administrador, Convites.
 */
export function WorkspaceHeader({
  id,
  name,
  role,
  current,
}: {
  id: string;
  name: string;
  role?: Role;
  current: 'membros' | 'convites';
}) {
  return (
    <View>
      <View style={styles.top}>
        <Pressable
          onPress={() => router.navigate('/workspaces')}
          accessibilityRole="button"
          accessibilityLabel="Voltar para Meus Workspaces"
          style={styles.back}
          hitSlop={6}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <T w="semibold" size={17} numberOfLines={1} style={{ flex: 1, marginLeft: 6 }}>
          {name}
        </T>
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        <Tab label="Membros" icon="users" active={current === 'membros'} onPress={() => router.replace({ pathname: '/workspace/[id]', params: { id } })} />
        {role === 'admin' ? (
          <Tab label="Convites" icon="send" active={current === 'convites'} onPress={() => router.replace({ pathname: '/workspace/[id]/convites', params: { id } })} />
        ) : null}
      </View>
    </View>
  );
}

function Tab({ label, icon, active, onPress }: { label: string; icon: 'users' | 'send'; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={active ? undefined : onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Feather name={icon} size={18} color={active ? colors.primary : colors.textMuted} />
      <T w={active ? 'semibold' : 'medium'} size={15} color={active ? colors.primary : colors.textMuted} style={{ marginLeft: 8 }}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
});
