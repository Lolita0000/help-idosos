import { router } from 'expo-router';
import { View } from 'react-native';

import { colors } from '../theme';
import { BackLink, Screen, T } from './ui';

export interface LegalSection {
  title?: string;
  body: string;
}

/** Telas "Termo de Uso" e "Política de privacidade" do Figma (RN-015). */
export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <Screen contentStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
      <View style={{ marginTop: 8 }}>
        <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/cadastro'))} />
      </View>
      <T w="semibold" size={26} style={{ marginTop: 10 }} accessibilityRole="header">
        {title}
      </T>
      <T size={14} color={colors.textMuted} style={{ marginTop: 4, marginBottom: 12 }}>
        Última atualização: {updated}
      </T>
      {sections.map((s, i) => (
        <View key={i} style={{ marginTop: 14 }}>
          {s.title ? (
            <T w="semibold" size={17} style={{ marginBottom: 6 }}>
              {s.title}
            </T>
          ) : null}
          <T size={15} color={colors.textSoft} style={{ lineHeight: 23 }}>
            {s.body}
          </T>
        </View>
      ))}
    </Screen>
  );
}
