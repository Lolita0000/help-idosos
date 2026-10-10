// Menu lateral (Figma: menu com usuário no rodapé) reduzido ao escopo da v0.1.
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '../core/format';
import { useSession } from '../session';
import { colors } from '../theme';
import { Avatar, Dialog, Feather, Logo, T } from './ui';

export function MenuButton() {
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
      <UserMenu visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function UserMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, logout } = useSession();
  const insets = useSafeAreaInsets();
  const [confirm, setConfirm] = useState(false);
  if (!user) return null;

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
          <T w="medium" size={14} color="rgba(255,255,255,0.8)" style={{ marginTop: 18, marginBottom: 6 }}>
            Workspaces
          </T>
          <Pressable
            style={styles.item}
            accessibilityRole="button"
            onPress={() => {
              onClose();
              router.navigate('/workspaces');
            }}
          >
            <Feather name="grid" size={22} color={colors.white} />
            <T w="medium" size={18} color={colors.white} style={{ marginLeft: 12 }}>
              Meus Workspaces
            </T>
          </Pressable>

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
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
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
