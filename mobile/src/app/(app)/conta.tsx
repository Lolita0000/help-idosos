// Minha conta (Figma: perfil, excluir-conta-aviso, excluir-conta-confirmar, excluir-conta-bloqueado).
// HU-05: exclusão da conta com aviso de irreversibilidade e dupla confirmação.
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MenuButton } from '../../components/UserMenu';
import { Alert, Avatar, Button, Dialog, Feather, Screen, T } from '../../components/ui';
import { ApiError, messageOf } from '../../core';
import { initials } from '../../core/format';
import { useFontScale } from '../../fontScale';
import { useSession } from '../../session';
import { colors, fonts, radius, TOUCH } from '../../theme';

/** Palavra que a pessoa digita na segunda confirmação. */
const CONFIRM_WORD = 'EXCLUIR';

type Step = 'idle' | 'warning' | 'confirm' | 'blocked';

export default function Conta() {
  const { user, logout, deleteAccount, handleAuthError } = useSession();
  const { scale } = useFontScale();
  const [step, setStep] = useState<Step>('idle');
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!user) return null;

  const cancel = () => {
    setStep('idle');
    setTyped('');
  };

  async function remove() {
    if (typed.trim().toUpperCase() !== CONFIRM_WORD) return;
    setDeleting(true);
    setFailure(null);
    try {
      await deleteAccount();
    } catch (e) {
      setDeleting(false);
      setTyped('');
      if (e instanceof ApiError && e.code === 'ADMIN_HAS_MEMBERS') {
        setBlockedMessage(e.message);
        setStep('blocked');
        return;
      }
      setStep('idle');
      if (!handleAuthError(e)) setFailure(messageOf(e));
    }
  }

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.top}>
        <MenuButton current="conta" />
        <T w="semibold" size={22} style={{ marginLeft: 12 }} accessibilityRole="header">
          Minha conta
        </T>
      </View>

      <View style={styles.userCard}>
        <Avatar text={initials(user.name)} size={56} tone="strong" />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <T w="semibold" size={19} numberOfLines={1}>
            {user.name}
          </T>
          <T size={14} color={colors.textMuted} numberOfLines={1}>
            {user.email}
          </T>
        </View>
      </View>

      <View style={styles.list}>
        <Row icon="type" label="Acessibilidade" href="/acessibilidade" />
        <Row icon="file-text" label="Termos de uso" href="/termos" />
        <Row icon="shield" label="Política de privacidade" href="/privacidade" last />
      </View>

      {failure ? <Alert message={failure} /> : null}

      <Button title="Sair da conta" icon="log-out" variant="outline" onPress={() => setConfirmLogout(true)} style={{ marginTop: 8 }} />

      <T w="semibold" size={17} style={{ marginTop: 28 }}>
        Privacidade e dados
      </T>
      <Pressable
        onPress={() => setStep('warning')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.danger, pressed && { opacity: 0.85 }]}
      >
        <Feather name="trash-2" size={18} color={colors.danger} />
        <T w="semibold" size={16} color={colors.danger} style={{ marginLeft: 10 }}>
          Excluir minha conta
        </T>
      </Pressable>
      <T size={13} color={colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
        Remove seus dados pessoais de forma permanente (LGPD).
      </T>

      {/* 1ª confirmação: aviso de que a ação é permanente e irreversível. */}
      <Dialog
        visible={step === 'warning'}
        icon="alert-triangle"
        danger
        title="Excluir sua conta?"
        message={
          'Esta ação é permanente e não pode ser desfeita. Seu nome, e-mail, senha e vínculos com workspaces serão apagados e sua sessão será encerrada.\n\nAs entradas que você registrou em workspaces compartilhados continuam no histórico, com a autoria anônima.'
        }
        confirm="Continuar"
        onCancel={cancel}
        onConfirm={() => setStep('confirm')}
      />

      {/* 2ª confirmação: a pessoa digita a palavra de confirmação. */}
      <Dialog
        visible={step === 'confirm'}
        icon="trash-2"
        danger
        title="Confirme a exclusão"
        message={`Para confirmar, digite ${CONFIRM_WORD} no campo abaixo.`}
        confirm={deleting ? 'Excluindo...' : 'Excluir conta'}
        confirmDisabled={typed.trim().toUpperCase() !== CONFIRM_WORD}
        loading={deleting}
        onCancel={cancel}
        onConfirm={remove}
      >
        <TextInput
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={CONFIRM_WORD}
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={`Digite ${CONFIRM_WORD} para confirmar`}
          style={[styles.confirmInput, { fontSize: Math.round(16 * scale) }]}
        />
      </Dialog>

      {/* RN-012: administrador com membros ativos precisa transferir a administração antes. */}
      <Dialog
        visible={step === 'blocked'}
        icon="lock"
        title="Não é possível excluir agora"
        message={blockedMessage}
        cancel="Entendi"
        onCancel={cancel}
      />

      <Dialog
        visible={confirmLogout}
        icon="log-out"
        title="Sair da conta?"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o aplicativo."
        confirm="Sair da conta"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout();
        }}
      />
    </Screen>
  );
}

function Row({ icon, label, href, last }: { icon: keyof typeof Feather.glyphMap; label: string; href: Href; last?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: '#F3F4F6' }]}
    >
      <Feather name={icon} size={20} color={colors.primary} />
      <T size={16} style={{ flex: 1, marginLeft: 14 }}>
        {label}
      </T>
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36 },
  top: { flexDirection: 'row', alignItems: 'center' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#C9CED6',
  },
  list: { marginTop: 18, marginBottom: 16, borderRadius: radius.md, borderWidth: 1, borderColor: '#C9CED6', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH + 8, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  danger: {
    marginTop: 10,
    minHeight: TOUCH,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmInput: {
    marginTop: 14,
    minHeight: TOUCH,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    fontFamily: fonts.semibold,
    letterSpacing: 2,
    textAlign: 'center',
    color: colors.text,
  },
});
