import { Redirect, Stack } from 'expo-router';

import { useSession } from '../../session';
import { colors } from '../../theme';

/**
 * Área autenticada: sem sessão válida, sai dela (RN-013). Depois de "Sair da conta"
 * ou de a sessão expirar, vai para o login; depois de excluir a conta, para a abertura.
 */
export default function AppLayout() {
  const { user, exitTo } = useSession();
  if (!user) return <Redirect href={exitTo} />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'slide_from_right' }} />
  );
}
