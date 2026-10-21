// Barra superior das abas do workspace (Figma: menu ☰ com linha divisória abaixo).
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { MenuButton, type MenuPage, type MenuWorkspace } from './UserMenu';

export function AppHeader({ workspace, current }: { workspace: MenuWorkspace; current: MenuPage }) {
  return (
    <View style={styles.bar}>
      <MenuButton workspace={workspace} current={current} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
