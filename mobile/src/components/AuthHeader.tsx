import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { BlueGradient, Bubbles, Feather, Logo, T } from './ui';

/** Cabeçalho azul das telas de cadastro e login (Figma: cadastro / login). */
export function AuthHeader({ title, subtitle, bullets, children }: {
  title: string;
  subtitle: string;
  bullets?: string[];
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <BlueGradient style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <Bubbles variant="corner" />
      <View style={{ alignItems: 'center' }}>
        <Logo variant="white" width={150} />
      </View>
      <T w="semibold" size={20} color={colors.white} style={styles.title}>
        {title}
      </T>
      <T size={15} color={colors.white} style={styles.subtitle}>
        {subtitle}
      </T>
      {bullets?.map((b) => (
        <View key={b} style={styles.bullet}>
          <Feather name="check-circle" size={18} color={colors.white} />
          <T w="medium" size={15} color={colors.white} style={{ marginLeft: 10 }}>
            {b}
          </T>
        </View>
      ))}
      {children}
    </BlueGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 26,
    paddingBottom: 40,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  title: { textAlign: 'center', marginTop: 14 },
  subtitle: { textAlign: 'center', marginTop: 10, opacity: 0.95 },
  bullet: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
});
