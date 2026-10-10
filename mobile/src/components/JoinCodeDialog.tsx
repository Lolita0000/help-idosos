// HU-03 — Entrar por convite (Figma: modal "Entrar com Código" e estados de erro).
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { api, messageOf, type WorkspaceSummary } from '../core';
import { normalizeCode } from '../core/validation';
import { useSession } from '../session';
import { colors } from '../theme';
import { Button, Feather, Field, T } from './ui';

export function JoinCodeDialog({
  visible,
  onClose,
  onJoined,
}: {
  visible: boolean;
  onClose: () => void;
  onJoined: (ws: WorkspaceSummary) => void;
}) {
  const { token, handleAuthError } = useSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode('');
      setError(undefined);
    }
  }, [visible]);

  async function submit() {
    // Cenário 5: código em branco não gera requisição.
    if (!normalizeCode(code)) {
      setError('Informe o código de convite.');
      return;
    }
    if (!token) return;
    setLoading(true);
    setError(undefined);
    try {
      const ws = await api.joinWithCode(token, code);
      onJoined(ws);
    } catch (e) {
      if (!handleAuthError(e)) setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" style={styles.close} hitSlop={8}>
            <Feather name="x" size={24} color={colors.text} />
          </Pressable>
          <T w="medium" size={22} style={{ textAlign: 'center', marginTop: 6 }} accessibilityRole="header">
            Entrar com Código
          </T>
          <T size={14} color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            Insira o código de convite recebido pelo administrador.
          </T>
          <Field
            label="Código de convite"
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="Ex: KHO6-NY67"
            autoCapitalize="characters"
            error={error}
            maxLength={12}
            center
          />
          <Button title="Enviar" onPress={submit} loading={loading} style={{ marginTop: 6 }} />
          <Button title="Cancelar" variant="ghost" onPress={onClose} style={{ marginTop: 12 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 16 },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    paddingTop: 28,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  close: { position: 'absolute', right: 12, top: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});
