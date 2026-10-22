// Barra superior do Diário (Figma: menu ☰ com linha divisória abaixo).
// Mostra o nome do workspace ao lado do menu, para quem participa de mais de um
// saber em qual está registrando.
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { MenuButton, type MenuPage, type MenuWorkspace } from './UserMenu';
import { T } from './ui';

export function AppHeader({
  workspace,
  current,
  title,
}: {
  workspace: MenuWorkspace;
  current: MenuPage;
  /** Nome do workspace aberto. Fica vazio enquanto os dados carregam. */
  title?: string;
}) {
  return (
    <View style={styles.bar}>
      <MenuButton workspace={workspace} current={current} />
      {title ? (
        <T w="semibold" size={17} numberOfLines={1} style={styles.title}>
          {title}
        </T>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, marginLeft: 12 },
});
