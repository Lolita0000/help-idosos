// Figma: criado-workspace (HU-01, cenário 1).
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { Button, Screen, T } from '../../components/ui';
import { colors } from '../../theme';

export default function WorkspaceCriado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.art}>
        <Image source={require('../../../assets/images/confete.webp')} style={styles.confetti} resizeMode="contain" accessible={false} />
        <View style={styles.check}>
          <Feather name="check" size={92} color={colors.white} />
        </View>
      </View>
      <T w="semibold" size={24} style={styles.center} accessibilityRole="header">
        Workspace criado com sucesso!
      </T>
      <T size={17} color={colors.textSoft} style={[styles.center, { marginTop: 14, maxWidth: 320 }]}>
        Agora você pode adicionar membros e começar a acompanhar os cuidados.
      </T>
      <View style={{ flex: 1, minHeight: 40 }} />
      <Button
        title="Acessar Workspace"
        onPress={() => router.replace({ pathname: '/workspace/[id]', params: { id } })}
        style={{ alignSelf: 'stretch' }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 40, paddingBottom: 40 },
  art: { width: 340, height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  confetti: { position: 'absolute', width: 340, height: 251 },
  check: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
