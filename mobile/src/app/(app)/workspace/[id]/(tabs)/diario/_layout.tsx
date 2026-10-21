import { Stack } from 'expo-router';

import { colors } from '../../../../../../theme';

// Garante que "Voltar" da nova entrada caia na lista, mesmo quando ela foi aberta pelo Dashboard.
export const unstable_settings = { initialRouteName: 'index' };

export default function DiarioLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'slide_from_right' }} />
  );
}
