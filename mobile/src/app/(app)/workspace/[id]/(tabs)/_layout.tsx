// Abas inferiores do workspace (Figma: Dashboard · Diário · Relatório · Configurações).
// Relatório e Configurações entram na v1.0 (#68) e não aparecem como abas vazias.
import { Tabs } from 'expo-router';

import { Feather } from '../../../../../components/ui';
import { colors, fonts } from '../../../../../theme';

export default function WorkspaceTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarStyle: { minHeight: 64, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.white },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diário',
          tabBarIcon: ({ color, size }) => <Feather name="book" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
