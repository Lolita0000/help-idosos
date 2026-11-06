// RNF-004 — Acessibilidade (Figma: acessibilidade, acessibilidade-p, acessibilidade-g).
// A pessoa escolhe o tamanho, vê a prévia na hora e só aplica ao tocar em "Salvar alterações".
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Alert, Screen, ScreenHeader, T } from '../../components/ui';
import { FONT_SIZES, useFontScale, type FontSize } from '../../fontScale';
import { colors } from '../../theme';

const SOFT_BORDER = 'rgba(0,0,0,0.3)';
const BODY = 'rgba(0,0,0,0.7)';

export default function Acessibilidade() {
  const { size, scale, setSize } = useFontScale();
  const [draft, setDraft] = useState<FontSize>(size);
  const [saved, setSaved] = useState(false);

  // A prévia usa a escala do rascunho; T já multiplica pela escala salva, então compensa aqui.
  const previewScale = (FONT_SIZES.find((f) => f.value === draft)?.scale ?? 1) / scale;

  async function save() {
    await setSize(draft);
    setSaved(true);
  }

  return (
    <Screen contentStyle={styles.page}>
      <ScreenHeader title="Acessibilidade" onBack={() => (router.canGoBack() ? router.back() : router.replace('/conta'))} />

      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Ionicons name="accessibility-outline" size={34} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 20 }}>
          <T w="semibold" size={20}>
            Ajuste o tamanho da fonte
          </T>
          <T w="medium" size={12} color={BODY} style={{ marginTop: 4 }}>
            Escolha o tamanho ideal para facilitar sua leitura em todo o sistema.
          </T>
        </View>
      </View>

      <T w="semibold" size={15} style={{ marginTop: 32 }}>
        Tamanho da fonte
      </T>
      <T w="medium" size={12} color={BODY} style={{ marginTop: 6 }}>
        A alteração será aplicada em todas as telas e textos do sistema.
      </T>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {FONT_SIZES.map((f) => {
          const active = f.value === draft;
          return (
            <Pressable
              key={f.value}
              onPress={() => {
                setDraft(f.value);
                setSaved(false);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`Fonte ${f.label}`}
              style={[styles.option, active && styles.optionActive]}
            >
              {/* "Aa" mostra o tamanho fixo de cada opção, sem depender da escolha atual. */}
              <T w="semibold" size={(12 * f.scale) / scale} color={active ? colors.primary : colors.text}>
                Aa
              </T>
              <T w="medium" size={10} color={active ? colors.primary : colors.text} style={{ marginTop: 6, textAlign: 'center' }}>
                {f.label}
              </T>
              <T w="medium" size={10} color={BODY} style={{ marginTop: 6, textAlign: 'center' }}>
                {f.hint}
              </T>
              <View style={{ flex: 1 }} />
              <View style={[styles.radio, active && { borderColor: colors.primary }]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <T w="semibold" size={15} style={{ marginTop: 28 }}>
        Visualização
      </T>
      <T w="medium" size={12} color={BODY} style={{ marginTop: 6 }}>
        Veja um exemplo de como os textos serão exibidos.
      </T>
      <View style={styles.preview} accessibilityLiveRegion="polite">
        <T w="semibold" size={15 * previewScale}>
          Título de exemplo
        </T>
        <T w="medium" size={12 * previewScale} color={BODY} style={{ marginTop: 8 }}>
          Este é um exemplo de como os textos serão exibidos em todo o sistema.
        </T>
        <T w="medium" size={12 * previewScale} color={BODY} style={{ marginTop: 10 }}>
          Ajuste o tamanho até encontrar a opção mais confortável para você.
        </T>
      </View>

      {saved ? (
        <View style={{ marginTop: 16 }}>
          <Alert tone="success" message="Tamanho da fonte salvo." />
        </View>
      ) : null}

      <Pressable
        onPress={() => void save()}
        accessibilityRole="button"
        style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}
      >
        <T w="semibold" size={18} color={colors.white}>
          Salvar alterações
        </T>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 30, paddingTop: 12, paddingBottom: 32 },
  intro: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  introIcon: {
    width: 73,
    height: 73,
    borderRadius: 37,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: { flexDirection: 'row', gap: 12, marginTop: 24 },
  option: {
    flex: 1,
    minHeight: 108,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
  },
  optionActive: { borderColor: colors.primary },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  preview: {
    marginTop: 22,
    minHeight: 194,
    padding: 17,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
  },
  save: {
    marginTop: 24,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
