// RNF-004 — Acessibilidade (Figma: acessibilidade, acessibilidade-p, acessibilidade-g).
// A escolha vale na hora para todas as telas e fica salva no aparelho.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackLink, Feather, Screen, T } from '../../components/ui';
import { FONT_SIZES, useFontScale } from '../../fontScale';
import { colors, radius } from '../../theme';

export default function Acessibilidade() {
  const { size, scale, setSize } = useFontScale();

  return (
    <Screen contentStyle={styles.page}>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/conta'))} />
      <T w="semibold" size={26} style={{ marginTop: 8 }} accessibilityRole="header">
        Acessibilidade
      </T>

      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Feather name="type" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <T w="semibold" size={17}>
            Ajuste o tamanho da fonte
          </T>
          <T size={14} color={colors.textMuted} style={{ marginTop: 4 }}>
            Escolha o tamanho ideal para facilitar sua leitura. A alteração vale para todas as telas do aplicativo.
          </T>
        </View>
      </View>

      <T w="semibold" size={17} style={{ marginTop: 22, marginBottom: 10 }}>
        Tamanho da fonte
      </T>
      <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
        {FONT_SIZES.map((f) => {
          const active = f.value === size;
          return (
            <Pressable
              key={f.value}
              onPress={() => void setSize(f.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`Fonte ${f.label}`}
              style={[styles.option, active && styles.optionActive]}
            >
              <View style={styles.sample}>
                {/* "Aa" mostra o tamanho fixo de cada opção, sem depender da escolha atual. */}
                <T w="semibold" size={(18 * f.scale) / scale} color={active ? colors.primary : colors.text} allowFontScaling={false}>
                  Aa
                </T>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <T w="semibold" size={16} color={active ? colors.primary : colors.text}>
                  {f.label}
                </T>
                <T size={13} color={colors.textMuted}>
                  {f.hint}
                </T>
              </View>
              <Feather name={active ? 'check-circle' : 'circle'} size={22} color={active ? colors.primary : '#9CA3AF'} />
            </Pressable>
          );
        })}
      </View>

      <T w="semibold" size={17} style={{ marginTop: 24, marginBottom: 10 }}>
        Visualização
      </T>
      <View style={styles.preview} accessibilityLiveRegion="polite">
        <T w="semibold" size={18}>
          Título de exemplo
        </T>
        <T size={15} color={colors.textSoft} style={{ marginTop: 6 }}>
          Este é um exemplo de como os textos são exibidos no aplicativo. Ajuste o tamanho até encontrar a opção mais
          confortável para você.
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 32 },
  intro: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#C9CED6',
  },
  optionActive: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primarySoft },
  sample: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: '#C9CED6' },
});
