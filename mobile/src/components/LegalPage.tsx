import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen, ScreenHeader, T } from './ui';

export interface LegalSection {
  title?: string;
  body: string;
}

/** Telas "Termo de Uso" e "Política de privacidade" do Figma (RN-015). */
export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <Screen contentStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}>
      <View style={{ paddingHorizontal: 6 }}>
        <ScreenHeader title={title} onBack={() => (router.canGoBack() ? router.back() : router.replace('/cadastro'))} />
      </View>
      <View
        style={{
          marginTop: 16,
          paddingHorizontal: 20,
          paddingVertical: 20,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        }}
      >
        <T w="medium" size={11} color="rgba(0,0,0,0.7)">
          Última atualização: {updated}
        </T>
        {sections.map((s, i) => (
          <View key={i} style={{ marginTop: 20 }}>
            {s.title ? (
              <T w="semibold" size={15} style={{ marginBottom: 8 }}>
                {s.title}
              </T>
            ) : null}
            <T w="medium" size={12} color="rgba(0,0,0,0.7)" style={{ lineHeight: 18 }}>
              {s.body}
            </T>
          </View>
        ))}
      </View>
    </Screen>
  );
}
