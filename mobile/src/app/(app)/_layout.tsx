import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { BottomNav, useBottomNavVisible } from '../../components/BottomNav';
import { BottomNavContext } from '../../components/ui';
import { useSession } from '../../session';
import { colors } from '../../theme';

/**
 * Área autenticada: sem sessão válida, sai dela (RN-013). Depois de "Sair da conta"
 * ou de a sessão expirar, vai para o login; depois de excluir a conta, para a abertura.
 */
export default function AppLayout() {
  const { user, exitTo } = useSession();
  const navVisible = useBottomNavVisible();
  if (!user) return <Redirect href={exitTo} />;
  return (
    <BottomNavContext.Provider value={navVisible}>
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1 }}>
          {/* Telas de detalhe deslizam e invertem o sentido ao voltar; telas de aba trocam sem direção, para não parecer que "vão" quando se "volta". */}
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'ios_from_right' }}>
            <Stack.Screen name="workspaces" options={{ animation: 'fade' }} />
            <Stack.Screen name="conta" options={{ animation: 'fade' }} />
            <Stack.Screen name="workspace/[id]/index" options={{ animation: 'fade' }} />
            <Stack.Screen name="workspace/[id]/membros" options={{ animation: 'none' }} />
            <Stack.Screen name="workspace/[id]/convites" options={{ animation: 'none' }} />
          </Stack>
        </View>
        {navVisible ? <BottomNav /> : null}
      </View>
    </BottomNavContext.Provider>
  );
}
