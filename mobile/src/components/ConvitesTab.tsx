// Conteúdo da aba Convites (Figma: convites / convites-atv): o administrador gera e gerencia códigos (HU-03, RN-004, RN-005).
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Share, StyleSheet, View } from 'react-native';

import { api, ApiError, messageOf, type InviteCode, type WorkspaceDetail } from '../core';
import { formatCode, isExpired, longDateTime } from '../core/format';
import { useLoad, useTransient } from '../hooks';
import { useSession } from '../session';
import { colors } from '../theme';
import { Alert, Badge, Button, Dialog, Feather, T } from './ui';

export function ConvitesTab({ ws }: { ws: WorkspaceDetail }) {
  const { token, handleAuthError } = useSession();
  const isAdmin = ws.role === 'admin';
  const { data: invites, error, loading, reload } = useLoad(async (t) => (isAdmin ? api.listInvites(t, ws.id) : []));
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useTransient();
  const [failure, setFailure] = useTransient();
  const [toDelete, setToDelete] = useState<InviteCode | null>(null);
  // Códigos já enviados para exclusão: somem da lista na hora e não podem ser excluídos de novo.
  const [removing, setRemoving] = useState<string[]>([]);

  if (!isAdmin) {
    return (
      <View style={styles.pad}>
        <Alert message="Apenas o administrador do workspace gerencia convites." />
      </View>
    );
  }

  async function generate() {
    if (!token) return;
    setCreating(true);
    setFailure(null);
    try {
      const inv = await api.createInvite(token, ws.id);
      setNotice(`Código ${formatCode(inv.code)} gerado. Ele vale por 24 horas.`);
      await reload();
    } catch (e) {
      if (!handleAuthError(e)) setFailure(messageOf(e));
    } finally {
      setCreating(false);
    }
  }

  async function copy(inv: InviteCode) {
    await Clipboard.setStringAsync(formatCode(inv.code));
    setNotice(`Código ${formatCode(inv.code)} copiado.`);
  }

  async function share(inv: InviteCode) {
    const message = `Você foi convidado para o workspace “${ws.name}” no Elo de Cuidado. Abra o app, toque em “Entrar com código” e use: ${formatCode(inv.code)} (válido por 24 horas).`;
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(message);
      setNotice('Convite copiado. Cole na conversa com a pessoa convidada.');
      return;
    }
    await Share.share({ message });
  }

  async function remove() {
    if (!token || !toDelete) return;
    const inv = toDelete;
    setToDelete(null);
    if (removing.includes(inv.id)) return;
    setRemoving((r) => [...r, inv.id]);
    try {
      await api.deleteInvite(token, inv.id);
      setNotice(`Código ${formatCode(inv.code)} removido.`);
    } catch (e) {
      // O servidor responde "sem acesso" a um código que não existe mais, então
      // um código já excluído não deve aparecer como erro de permissão.
      if (e instanceof ApiError && (e.code === 'FORBIDDEN' || e.code === 'NOT_FOUND')) {
        setNotice(`O código ${formatCode(inv.code)} já foi removido.`);
      } else if (!handleAuthError(e)) {
        setFailure(messageOf(e));
      }
    }
    await reload();
    setRemoving((r) => r.filter((x) => x !== inv.id));
  }

  if (loading && !invites) return <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />;
  if (error && !invites)
    return (
      <View style={styles.pad}>
        <Alert message={error} />
      </View>
    );

  const visible = (invites ?? []).filter((inv) => !removing.includes(inv.id));

  return (
    <View style={styles.pad}>
      <T w="semibold" size={26} accessibilityRole="header">
        Convites
      </T>
      <T size={16} color={colors.textMuted} style={styles.justify}>
        Gerencie códigos de convite para adicionar novos membros
      </T>
      <Button title="+ Gerar Código" small loading={creating} onPress={generate} style={{ alignSelf: 'flex-start', marginTop: 14 }} />

      <View style={styles.how}>
        <View style={styles.howIcon}>
          <Feather name="credit-card" size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <T w="medium" size={17}>
            Como funciona?
          </T>
          <T size={14} color={colors.textSoft} style={[styles.justify, { marginTop: 4 }]}>
            Gere um código de convite e compartilhe com a pessoa que deseja adicionar ao workspace. Ela poderá usar o código na
            tela de workspaces, em “Entrar com código”. Cada código vale por 24 horas.
          </T>
        </View>
      </View>

      {notice ? <Alert tone="success" message={notice} /> : null}
      {failure ? <Alert message={failure} /> : null}

      <T w="medium" size={17} style={{ marginTop: 8, marginBottom: 12 }}>
        Códigos gerados
      </T>
      {visible.length === 0 ? (
        <T size={15} color={colors.textMuted} style={styles.justify}>
          Nenhum código gerado ainda. Toque em “+ Gerar Código”.
        </T>
      ) : null}
      {visible.map((inv) => {
        const expired = isExpired(inv.expiresAt);
        return (
          <View key={inv.id} style={[styles.code, expired && { opacity: 0.75 }]}>
            <View style={styles.codeTop}>
              <T w="bold" size={20} color={expired ? '#555' : colors.text} selectable style={{ letterSpacing: 1 }}>
                {formatCode(inv.code)}
              </T>
              <Badge label={expired ? 'Expirado' : 'Ativo'} tone={expired ? 'expired' : 'active'} />
            </View>
            <T size={13} color={colors.textMuted}>
              Criado em {longDateTime(inv.createdAt)}
            </T>
            <View style={styles.codeBottom}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Feather name="clock" size={14} color={colors.textMuted} />
                <T size={13} color={colors.textMuted} style={{ marginLeft: 6, flex: 1 }}>
                  {expired ? 'Expirou em' : 'Expira em'} {longDateTime(inv.expiresAt)}
                </T>
              </View>
              {!expired ? (
                <>
                  <IconBtn icon="share-2" label="Compartilhar código" onPress={() => share(inv)} />
                  <IconBtn icon="copy" label="Copiar código" onPress={() => copy(inv)} />
                </>
              ) : null}
              <IconBtn icon="trash-2" label="Remover código" color={colors.danger} onPress={() => setToDelete(inv)} />
            </View>
          </View>
        );
      })}

      <Dialog
        visible={!!toDelete}
        icon="trash-2"
        danger
        title="Remover código?"
        message={toDelete ? `O código ${formatCode(toDelete.code)} deixará de funcionar.` : ''}
        confirm="Remover"
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      />
    </View>
  );
}

function IconBtn({
  icon,
  label,
  onPress,
  color = colors.text,
}: {
  icon: 'share-2' | 'copy' | 'trash-2';
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.iconBtn}>
      <Feather name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 22, paddingTop: 20 },
  justify: { textAlign: 'justify', marginTop: 4 },
  how: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderColor: '#9DB8F2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 18,
  },
  howIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A7BD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    borderWidth: 1,
    borderColor: '#C9CED6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 12,
  },
  codeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  codeBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
