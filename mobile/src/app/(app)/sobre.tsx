// Sobre o Elo de Cuidado (Figma: sobre).
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Feather, Logo, Screen, ScreenHeader, T } from '../../components/ui';
import { APP_VERSION, colors } from '../../theme';

const CONTACTS: { icon: keyof typeof Feather.glyphMap; label: string; value: string; url: string }[] = [
  { icon: 'globe', label: 'Site', value: 'www.elodecuidado.com.br', url: 'https://www.elodecuidado.com.br' },
  { icon: 'instagram', label: 'Instagram', value: '@elodecuidado', url: 'https://www.instagram.com/elodecuidado' },
  { icon: 'help-circle', label: 'Suporte', value: 'contato@elodecuidado.com.br', url: 'mailto:contato@elodecuidado.com.br' },
];

export default function Sobre() {
  return (
    <Screen contentStyle={styles.page}>
      <ScreenHeader title="Sobre o Elo de Cuidado" onBack={() => (router.canGoBack() ? router.back() : router.replace('/conta'))} />

      <View style={styles.hero}>
        <Logo variant="blue" width={199} />
        <T w="medium" size={12} style={{ marginTop: 20 }}>
          Versão {APP_VERSION}
        </T>
        <T w="medium" size={12} color="rgba(0,0,0,0.7)" style={{ marginTop: 20, textAlign: 'center', maxWidth: 258 }}>
          Nosso propósito é conectar pessoas através do cuidado, da organização e do carinho.
        </T>
      </View>

      <View style={styles.card}>
        {CONTACTS.map((c) => (
          <Pressable
            key={c.label}
            onPress={() => void Linking.openURL(c.url).catch(() => undefined)}
            accessibilityRole="link"
            accessibilityLabel={`${c.label}: ${c.value}`}
            style={styles.contact}
          >
            <Feather name={c.icon} size={20} color={colors.primary} />
            <View style={{ marginLeft: 18, flex: 1 }}>
              <T w="semibold" size={12}>
                {c.label}
              </T>
              <T w="medium" size={12} color="rgba(0,0,0,0.75)">
                {c.value}
              </T>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 30, paddingTop: 12, paddingBottom: 32 },
  hero: { alignItems: 'center', marginTop: 40 },
  card: {
    marginTop: 56,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#ECF0FF',
    gap: 6,
  },
  contact: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
});
