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
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'slide_from_right' }} />
        </View>
        {navVisible ? <BottomNav /> : null}
      </View>
    </BottomNavContext.Provider>
  );
}
