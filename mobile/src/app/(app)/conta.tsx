// Minha conta (Figma: perfil, perfil-sair, excluir-conta-aviso, excluir-conta-confirmar, excluir-conta-bloqueado).
// HU-05: exclusão da conta com aviso de irreversibilidade e dupla confirmação.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MenuButton } from '../../components/UserMenu';
import { Alert, Dialog, Feather, Screen, T } from '../../components/ui';
import { ApiError, messageOf } from '../../core';
import { initials } from '../../core/format';
import { useFontScale } from '../../fontScale';
import { useSession } from '../../session';
import { APP_VERSION, colors, fonts, TOUCH } from '../../theme';

/** Palavra que a pessoa digita na segunda confirmação. */
const CONFIRM_WORD = 'EXCLUIR';

const RED = '#FF0F0F';
const CARD_BORDER = 'rgba(0,0,0,0.1)';

type Step = 'idle' | 'warning' | 'confirm' | 'blocked';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

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
      <MenuButton current="conta" />

      <View style={styles.userCard}>
        <View style={styles.bubbleBig} />
        <View style={[styles.bubbleDot, { width: 13, height: 13, left: 303, top: 61 }]} />
        <View style={[styles.bubbleDot, { width: 13, height: 13, left: 314, top: 84 }]} />
        <View style={[styles.bubbleDot, { width: 6, height: 6, left: 285, top: 42 }]} />
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <T w="semibold" size={20} color={colors.white}>
              {initials(user.name)}
            </T>
          </View>
          <View style={styles.camera}>
            <Feather name="camera" size={9} color={colors.text} />
          </View>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <T w="semibold" size={20} numberOfLines={1}>
            {user.name}
          </T>
          <T w="medium" size={15} color="rgba(0,0,0,0.5)" numberOfLines={1}>
            {user.email}
          </T>
        </View>
      </View>

      <T w="semibold" size={15} style={{ marginTop: 24, marginBottom: 10, marginLeft: 6 }}>
        Minha conta
      </T>
      <View style={styles.list}>
        <Row icon="account-outline" label="Dados pessoais" href="/dados-pessoais" />
        <Row icon="palette-outline" label="Acessibilidade" href="/acessibilidade" />
        <Row icon="text-box-outline" label="Termos de uso" href="/termos" />
        <Row icon="shield-check-outline" label="Política de privacidade" href="/privacidade" />
        <Row icon="information" label="Sobre o Elo de Cuidado" href="/sobre" hint={`Versão ${APP_VERSION}`} last />
      </View>

      {failure ? <Alert message={failure} /> : null}

      <Pressable
        onPress={() => setConfirmLogout(true)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
      >
        <Feather name="log-out" size={16} color={RED} />
        <T w="medium" size={15} color={RED} style={{ marginLeft: 10 }}>
          Sair da conta
        </T>
      </Pressable>

      <T w="semibold" size={15} style={{ marginTop: 28, marginLeft: 6 }}>
        Privacidade e dados
      </T>
      <Pressable
        onPress={() => setStep('warning')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.danger, pressed && { opacity: 0.85 }]}
      >
        <Feather name="trash-2" size={16} color={RED} />
        <T w="medium" size={15} color={RED} style={{ marginLeft: 10 }}>
          Excluir minha conta
        </T>
      </Pressable>
      <T w="regular" size={12} color="#737373" style={{ marginTop: 8, textAlign: 'center' }}>
        Remove seus dados pessoais de forma permanente (LGPD).
      </T>

      {/* 1ª confirmação: aviso de que a ação é permanente e irreversível. */}
      <Dialog
        visible={step === 'warning'}
        danger
        title="Excluir sua conta?"
        message={
          'Esta ação é permanente e não pode ser desfeita. Seu nome, e-mail, senha e vínculos com workspaces serão apagados e sua sessão será encerrada.\n\nAs entradas que você registrou em workspaces compartilhados continuam no histórico, mas com autoria anônima.'
        }
        confirm="Continuar"
        onCancel={cancel}
        onConfirm={() => setStep('confirm')}
      />

      {/* 2ª confirmação: a pessoa digita a palavra de confirmação. */}
      <Dialog
        visible={step === 'confirm'}
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
          style={[styles.confirmInput, { fontSize: Math.round(14 * scale) }]}
        />
      </Dialog>

      {/* RN-012: administrador com membros ativos precisa transferir a administração antes. */}
      <Dialog
        visible={step === 'blocked'}
        title="Não é possível excluir agora"
        message={blockedMessage}
        cancel="Voltar"
        confirm="Entendi"
        onCancel={cancel}
        onConfirm={cancel}
      />

      <Dialog
        visible={confirmLogout}
        icon="log-out"
        title="Sair da conta?"
        message={'Tem certeza que deseja sair da sua conta?\nVocê precisará fazer login novamente para acessar o aplicativo'}
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

function Row({ icon, label, href, hint, last }: { icon: IconName; label: string; href: Href; hint?: string; last?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: '#F3F4F6' }]}
    >
      <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      <T w="medium" size={12} style={{ flex: 1, marginLeft: 14 }}>
        {label}
      </T>
      {hint ? (
        <T w="medium" size={11} color="rgba(0,0,0,0.5)" style={{ marginRight: 8 }}>
          {hint}
        </T>
      ) : null}
      <Feather name="chevron-right" size={18} color="#6B7280" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 30, paddingTop: 12, paddingBottom: 36 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    minHeight: 121,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
  },
  bubbleBig: { position: 'absolute', left: 289, top: -8, width: 68, height: 68, borderRadius: 34, backgroundColor: '#D0E1FF' },
  bubbleDot: { position: 'absolute', borderRadius: 999, backgroundColor: '#D0E1FF' },
  avatarWrap: { width: 60, height: 60 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  list: { borderRadius: 10, borderWidth: 1, borderColor: CARD_BORDER, overflow: 'hidden', marginBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH, paddingHorizontal: 20 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  logout: {
    minHeight: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: 20,
    backgroundColor: '#FCEDED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmInput: {
    marginTop: 14,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    letterSpacing: 1,
    textAlign: 'center',
    color: colors.text,
  },
});
