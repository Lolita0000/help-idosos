import { Redirect, Stack } from 'expo-router';

import { useSession } from '../../session';
import { colors } from '../../theme';

/** Área autenticada: sem sessão válida, volta para a abertura (RN-013). */
export default function AppLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'slide_from_right' }} />
  );
}
