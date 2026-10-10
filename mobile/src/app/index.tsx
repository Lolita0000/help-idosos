// Tela "tela-1" do Figma: abertura do app.
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bubbles, Button, Logo, T } from '../components/ui';
import { useSession } from '../session';
import { colors } from '../theme';

export default function Welcome() {
  const { user } = useSession();
  if (user) return <Redirect href="/workspaces" />;

  return (
    <View style={styles.bg}>
      <StatusBar style="light" />
      <Bubbles variant="full" />
      <SafeAreaView style={styles.center}>
        <Logo variant="white" width={220} />
        <T size={19} color={colors.white} style={styles.tagline}>
          Cuidando de quem você ama, juntos
        </T>
        <Button title="Começar" onPress={() => router.push('/login')} style={styles.cta} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#4A90E2', overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  tagline: { textAlign: 'center', marginTop: 24, maxWidth: 260 },
  cta: { marginTop: 48, width: 230, minHeight: 60, borderRadius: 999 },
});
