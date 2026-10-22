// Campo de seleção (Figma: "Categoria" da nova entrada e filtro "Todas as categorias" do diário).
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, TOUCH } from '../theme';
import { Feather, T } from './ui';

export interface Option<V extends string> {
  value: V;
  label: string;
}

export function Select<V extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione',
  error,
  compact,
  style,
}: {
  label?: string;
  value: V | null;
  options: Option<V>[];
  onChange: (v: V) => void;
  placeholder?: string;
  error?: string;
  /** Versão pequena usada como filtro. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const borderColor = error ? colors.danger : '#9CA3AF';

  return (
    <View style={[!compact && { marginBottom: 14 }, style]}>
      {label && !compact ? (
        <T w="medium" size={16} style={{ marginBottom: 6 }}>
          {label}
        </T>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Selecionar'}: ${selected?.label ?? placeholder}`}
        style={[compact ? styles.compact : styles.field, { borderColor, borderWidth: error ? 1.5 : 1 }]}
      >
        <T
          size={compact ? 14 : 16}
          color={selected ? colors.text : '#757575'}
          numberOfLines={1}
          style={compact ? { flexShrink: 1 } : { flex: 1 }}
        >
          {selected?.label ?? placeholder}
        </T>
        <Feather name="chevron-down" size={compact ? 16 : 22} color="#4B5563" style={{ marginLeft: 6 }} />
      </Pressable>
      {error ? (
        <T size={13} color={colors.danger} style={{ marginTop: 5 }} accessibilityLiveRegion="polite">
          {error}
        </T>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} accessibilityLabel="Fechar">
          <Pressable style={styles.sheet} accessibilityViewIsModal>
            {label ? (
              <T w="semibold" size={17} style={{ marginBottom: 8, paddingHorizontal: 8 }}>
                {label}
              </T>
            ) : null}
            <ScrollView style={{ maxHeight: 420 }}>
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && { opacity: 0.7 }]}
                  >
                    <T w={active ? 'semibold' : 'regular'} size={16} color={active ? colors.primary : colors.text} style={{ flex: 1 }}>
                      {o.label}
                    </T>
                    {active ? <Feather name="check" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 24 },
  sheet: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  optionActive: { backgroundColor: colors.primarySoft },
});
