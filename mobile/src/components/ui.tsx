import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, TOUCH } from '../theme';

/* ---------- Texto ---------- */

type Weight = keyof typeof fonts;
export function T({
  w = 'regular',
  size = 15,
  color = colors.text,
  style,
  ...rest
}: TextProps & { w?: Weight; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[{ fontFamily: fonts[w], fontSize: size, color, lineHeight: Math.round(size * 1.35) }, style]}
    />
  );
}

/* ---------- Estrutura de tela ---------- */

export function Screen({
  children,
  bg = colors.white,
  scroll = true,
  contentStyle,
  edges = ['top', 'bottom'],
}: {
  children: ReactNode;
  bg?: string;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom')[];
}) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scroll, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.column}>{body}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/** Círculos decorativos azuis presentes nas telas de abertura, cadastro e login. */
export function Bubbles({ variant = 'corner' }: { variant?: 'corner' | 'full' }) {
  const c = 'rgba(100,157,255,0.45)';
  if (variant === 'corner')
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.bubble, { width: 92, height: 92, right: -30, bottom: -36, backgroundColor: '#3B6EF0' }]} />
        <View style={[styles.bubble, { width: 58, height: 58, right: 24, bottom: -40, backgroundColor: '#4F86F7' }]} />
      </View>
    );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.bubble, { width: 170, height: 170, left: -70, top: -60, backgroundColor: c }]} />
      <View style={[styles.bubble, { width: 26, height: 26, left: 52, top: 50, backgroundColor: 'rgba(160,200,255,0.8)' }]} />
      <View style={[styles.bubble, { width: 180, height: 180, right: -90, top: -50, backgroundColor: '#3B6EF0' }]} />
      <View style={[styles.bubble, { width: 96, height: 96, right: 40, top: 26, backgroundColor: c }]} />
      <View style={[styles.bubble, { width: 180, height: 180, left: -60, bottom: -70, backgroundColor: c }]} />
      <View style={[styles.bubble, { width: 110, height: 110, right: -10, bottom: 70, backgroundColor: c }]} />
      <View style={[styles.bubble, { width: 110, height: 110, right: 10, bottom: -40, backgroundColor: c }]} />
    </View>
  );
}

export function BlueGradient({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

const logos = {
  white: require('../../assets/images/logo_white.webp'),
  blue: require('../../assets/images/logo_blue.webp'),
};

export function Logo({ variant = 'white', width = 170 }: { variant?: 'white' | 'blue'; width?: number }) {
  const ratio = variant === 'white' ? 170 / 69 : 199 / 73;
  return (
    <Image
      source={logos[variant]}
      style={{ width, height: width / ratio }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Elo de Cuidado"
    />
  );
}

/* ---------- Botões ---------- */

type Variant = 'primary' | 'outline' | 'danger' | 'ghost' | 'white';
export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && { opacity: 0.55 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={small ? 16 : 18} color={v.fg} style={{ marginRight: 8 }} /> : null}
          <T w="semibold" size={small ? 14 : 16} color={v.fg}>
            {title}
          </T>
        </View>
      )}
    </Pressable>
  );
}

const buttonVariants: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  outline: { bg: colors.white, fg: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.text, border: '#9CA3AF' },
  white: { bg: colors.white, fg: colors.primary, border: colors.white },
};

export function LinkText({
  prefix,
  link,
  onPress,
  color = colors.primary,
}: {
  prefix?: string;
  link: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={styles.linkHit} hitSlop={8}>
      <T size={16} color={colors.textSoft} style={{ textAlign: 'center' }}>
        {prefix ? `${prefix} ` : ''}
        <T w="semibold" size={16} color={color}>
          {link}
        </T>
      </T>
    </Pressable>
  );
}

/* ---------- Campos ---------- */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  secure,
  keyboardType,
  autoCapitalize = 'sentences',
  multiline,
  autoComplete,
  textContentType,
  maxLength,
  center,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  autoComplete?: 'email' | 'name' | 'password' | 'new-password' | 'off';
  textContentType?: 'emailAddress' | 'name' | 'password' | 'newPassword' | 'none';
  maxLength?: number;
  center?: boolean;
}) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : '#9CA3AF';
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <T w="medium" size={16} style={{ marginBottom: 6 }}>
          {label}
        </T>
      ) : null}
      <View style={[styles.inputWrap, { borderColor, borderWidth: error || focused ? 1.5 : 1 }, multiline && { minHeight: 96 }]}>
        <TextInput
          accessibilityLabel={label ?? placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#757575"
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top', paddingTop: 12, minHeight: 96 },
            center && { textAlign: 'center', letterSpacing: 2 },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            style={styles.eye}
          >
            <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color="#4B5563" />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <T size={13} color={colors.danger} style={{ marginTop: 5 }} accessibilityLiveRegion="polite">
          {error}
        </T>
      ) : helper ? (
        <T size={13} color={colors.textMuted} style={{ marginTop: 5 }}>
          {helper}
        </T>
      ) : null}
    </View>
  );
}

export function Checkbox({
  checked,
  onToggle,
  children,
  error,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <View style={[styles.row, { alignItems: 'flex-start' }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        hitSlop={10}
        style={[
          styles.check,
          { borderColor: error ? colors.danger : checked ? colors.primary : '#6B7280' },
          checked && { backgroundColor: colors.primary },
        ]}
      >
        {checked ? <Feather name="check" size={16} color={colors.white} /> : null}
      </Pressable>
      <View style={{ flex: 1, marginLeft: 12 }}>{children}</View>
    </View>
  );
}

/* ---------- Mensagens ---------- */

export function Alert({ message, tone = 'error' }: { message: string; tone?: 'error' | 'success' | 'info' }) {
  const t = {
    error: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle' as const },
    success: { bg: colors.successSoft, fg: colors.successText, icon: 'check-circle' as const },
    info: { bg: colors.primarySoft, fg: colors.primary, icon: 'info' as const },
  }[tone];
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.alert, { backgroundColor: t.bg, borderColor: t.fg }]}
    >
      <Feather name={t.icon} size={18} color={t.fg} style={{ marginRight: 10, marginTop: 1 }} />
      <T size={14} color={t.fg} style={{ flex: 1 }}>
        {message}
      </T>
    </View>
  );
}

export function Badge({ label, tone }: { label: string; tone: 'admin' | 'member' | 'active' | 'expired' | 'info' }) {
  const t = {
    admin: { bg: '#A7E6C1', fg: '#0F5132' },
    member: { bg: colors.warningSoft, fg: colors.warningText },
    active: { bg: colors.success, fg: colors.white },
    expired: { bg: '#F04646', fg: colors.white },
    info: { bg: colors.primarySoft, fg: colors.primary },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <T w="semibold" size={12} color={t.fg}>
        {label}
      </T>
    </View>
  );
}

export function Avatar({ text, size = 44, tone = 'soft' }: { text: string; size?: number; tone?: 'soft' | 'strong' }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tone === 'strong' ? '#4A7BD8' : '#B6C8EE',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T w="medium" size={size * 0.38} color={tone === 'strong' ? colors.white : colors.primary}>
        {text}
      </T>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

/** Diálogo de confirmação no estilo do "Sair da conta?" do Figma. */
export function Dialog({
  visible,
  title,
  message,
  icon,
  cancel = 'Cancelar',
  confirm,
  onCancel,
  onConfirm,
  danger,
  children,
}: {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Feather.glyphMap;
  cancel?: string;
  confirm?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  danger?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          {icon ? (
            <Feather name={icon} size={22} color={danger ? colors.danger : colors.primary} style={{ alignSelf: 'center', marginBottom: 8 }} />
          ) : null}
          <T w="semibold" size={18} style={{ textAlign: 'center' }}>
            {title}
          </T>
          {message ? (
            <T size={15} color={colors.textSoft} style={{ textAlign: 'center', marginTop: 10 }}>
              {message}
            </T>
          ) : null}
          {children}
          <View style={[styles.row, { marginTop: 20, gap: 12 }]}>
            <Button title={cancel} variant="outline" onPress={onCancel} style={{ flex: 1 }} small />
            {confirm ? (
              <Button title={confirm} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} style={{ flex: 1 }} small />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function BackLink({ label = 'Voltar', onPress }: { label?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.back} hitSlop={8}>
      <Feather name="arrow-left" size={24} color={colors.text} />
      <T w="medium" size={16} style={{ marginLeft: 8 }}>
        {label}
      </T>
    </Pressable>
  );
}

export { Feather };

const styles = StyleSheet.create({
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  scroll: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  bubble: { position: 'absolute', borderRadius: 999 },
  btn: {
    minHeight: TOUCH,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  btnSmall: { minHeight: 44, paddingHorizontal: 12 },
  linkHit: { minHeight: TOUCH, justifyContent: 'center', paddingHorizontal: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: radius.sm,
    minHeight: TOUCH,
  },
  input: {
    flex: 1,
    minHeight: TOUCH,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  eye: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 14,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#C9CED6',
    padding: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 22,
  },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH, alignSelf: 'flex-start' },
});
