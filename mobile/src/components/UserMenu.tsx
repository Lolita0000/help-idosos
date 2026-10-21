// Menu lateral (Figma: nova entrada — menu com usuário no rodapé).
// Relatórios e Configurações entram na v1.0.
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Role } from '../core';
import { initials } from '../core/format';
import { useSession } from '../session';
import { colors } from '../theme';
import { Avatar, Dialog, Feather, Logo, T } from './ui';

export type MenuPage = 'dashboard' | 'diario' | 'membros' | 'convites' | 'workspaces';

/** Workspace aberto: com ele, o menu mostra o "Menu principal" do workspace. */
export interface MenuWorkspace {
  id: string;
  role?: Role;
}

export function MenuButton({ workspace, current = 'workspaces' }: { workspace?: MenuWorkspace; current?: MenuPage }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
        style={styles.menuBtn}
        hitSlop={6}
      >
        <Feather name="menu" size={30} color={colors.text} />
      </Pressable>
      <UserMenu visible={open} onClose={() => setOpen(false)} workspace={workspace} current={current} />
    </>
  );
}

function UserMenu({
  visible,
  onClose,
  workspace,
  current,
}: {
  visible: boolean;
  onClose: () => void;
  workspace?: MenuWorkspace;
  current: MenuPage;
}) {
  const { user, logout } = useSession();
  const insets = useSafeAreaInsets();
  const [confirm, setConfirm] = useState(false);
  if (!user) return null;

  const go = (href: Href) => {
    onClose();
    router.navigate(href);
  };
  const id = workspace?.id ?? '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.drawer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.headerRow}>
            <Logo variant="white" width={140} />
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar menu" style={styles.icon}>
              <Feather name="x" size={26} color={colors.white} />
            </Pressable>
          </View>
          <View style={styles.sep} />
          {workspace ? (
            <>
              <SectionLabel>Menu principal</SectionLabel>
              <Item icon="grid" label="Dashboard" active={current === 'dashboard'} onPress={() => go({ pathname: '/workspace/[id]', params: { id } })} />
              <Item icon="book" label="Diário de Cuidados" active={current === 'diario'} onPress={() => go({ pathname: '/workspace/[id]/diario', params: { id } })} />
              <Item icon="users" label="Membros" active={current === 'membros'} onPress={() => go({ pathname: '/workspace/[id]/membros', params: { id } })} />
              {workspace.role === 'admin' ? (
                <Item icon="send" label="Convites" active={current === 'convites'} onPress={() => go({ pathname: '/workspace/[id]/convites', params: { id } })} />
              ) : null}
            </>
          ) : null}
          <SectionLabel>Workspaces</SectionLabel>
          <Item icon="layers" label="Meus Workspaces" active={current === 'workspaces'} onPress={() => go('/workspaces')} />

          <View style={{ flex: 1 }} />
          <View style={styles.sep} />
          <View style={styles.userRow}>
            <Avatar text={initials(user.name)} size={46} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <T w="semibold" size={17} color={colors.white} numberOfLines={1}>
                {user.name}
              </T>
              <T size={14} color="rgba(255,255,255,0.9)" numberOfLines={1}>
                {user.email}
              </T>
            </View>
          </View>
          <Pressable style={styles.logout} onPress={() => setConfirm(true)} accessibilityRole="button">
            <Feather name="log-out" size={20} color={colors.danger} />
            <T w="semibold" size={16} color={colors.danger} style={{ marginLeft: 10 }}>
              Sair da conta
            </T>
          </Pressable>
        </View>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Fechar menu" />
      </View>
      <Dialog
        visible={confirm}
        icon="log-out"
        title="Sair da conta?"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o aplicativo."
        confirm="Sair da conta"
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setConfirm(false);
          onClose();
          await logout();
          router.replace('/login');
        }}
      />
    </Modal>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <T w="medium" size={14} color="rgba(255,255,255,0.8)" style={{ marginTop: 18, marginBottom: 6 }}>
      {children}
    </T>
  );
}

function Item({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.item, active && styles.itemActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
    >
      <Feather name={icon} size={22} color={colors.white} />
      <T w="medium" size={18} color={colors.white} style={{ marginLeft: 12 }}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  backdrop: { flex: 1, flexDirection: 'row', backgroundColor: colors.overlay },
  drawer: {
    width: '84%',
    maxWidth: 380,
    backgroundColor: '#0B6BD3',
    paddingHorizontal: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.35)', marginTop: 18 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  itemActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  logout: {
    marginTop: 20,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
