// Barra de navegação inferior do Figma (nav-bar MVP): Dashboard, Diário, Membros e Configurações.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { T } from './ui';

type Tab = 'dashboard' | 'diario' | 'membros' | 'configuracoes';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'chart-bubble' },
  { key: 'diario', label: 'Diário', icon: 'notebook' },
  { key: 'membros', label: 'Membros', icon: 'account-group' },
  { key: 'configuracoes', label: 'Configurações', icon: 'cog-outline' },
];

/** Telas de formulário e de confirmação, que ficam sem a barra para não distrair do que está sendo feito. */
const NO_NAV = [/^\/criar-workspace/, /^\/workspace-criado/, /\/diario\/entrada$/];

const WORKSPACE = /^\/workspace\/([^/]+)/;

function activeTab(path: string): Tab | null {
  if (/^\/(conta|acessibilidade|sobre|dados-pessoais)/.test(path)) return 'configuracoes';
  if (/^\/workspaces/.test(path)) return 'dashboard';
  if (/\/(membros|convites)$/.test(path)) return 'membros';
  if (WORKSPACE.test(path) && !/\/configuracao$/.test(path)) return 'diario';
  return null;
}

/** Diz se a barra aparece, para as telas reservarem (ou não) o espaço da área segura inferior. */
export function useBottomNavVisible(): boolean {
  const path = usePathname();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return !keyboard && !NO_NAV.some((re) => re.test(path));
}

export function BottomNav() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  // Diário e Membros precisam de um workspace: usa o último aberto.
  const lastWorkspace = useRef<string | null>(null);
  const current = WORKSPACE.exec(path)?.[1];
  if (current) lastWorkspace.current = current;
  const id = lastWorkspace.current;
  const active = activeTab(path);

  const target = (tab: Tab): Href | null => {
    switch (tab) {
      case 'dashboard':
        return '/workspaces';
      case 'configuracoes':
        return '/conta';
      case 'diario':
        return id ? { pathname: '/workspace/[id]', params: { id } } : null;
      case 'membros':
        return id ? { pathname: '/workspace/[id]/membros', params: { id } } : null;
    }
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const href = target(t.key);
        const isActive = active === t.key;
        const color = isActive ? colors.primary : 'rgba(0,0,0,0.65)';
        return (
          <Pressable
            key={t.key}
            disabled={!href}
            onPress={() => href && router.navigate(href)}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: isActive, disabled: !href }}
            style={({ pressed }) => [styles.tab, !href && { opacity: 0.4 }, pressed && { backgroundColor: '#F3F4F6' }]}
          >
            <MaterialCommunityIcons name={t.icon} size={28} color={color} />
            <T w="medium" size={10} color={color} numberOfLines={1}>
              {t.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  tab: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 },
});
