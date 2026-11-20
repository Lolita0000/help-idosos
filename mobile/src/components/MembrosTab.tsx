// Conteúdo da aba Membros (Figma: membros): pessoa acompanhada, administradores e membros.
// O administrador também remove membros e passa a administração, sempre com confirmação.
import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { api, messageOf, type Member, type WorkspaceDetail } from '../core';
import { initials, longDate, plural } from '../core/format';
import { useFontScale } from '../fontScale';
import { useTransient } from '../hooks';
import { useSession } from '../session';
import { colors, fonts, radius } from '../theme';
import { Alert, Avatar, Button, Dialog, Feather, T } from './ui';

type Pending = { kind: 'remove' | 'transfer'; member: Member };

export function MembrosTab({
  ws,
  onInvite,
  onChanged,
}: {
  ws: WorkspaceDetail;
  onInvite: () => void;
  /** Recarrega o workspace depois de uma remoção ou transferência. */
  onChanged: () => Promise<void>;
}) {
  const { scale } = useFontScale();
  const { token, handleAuthError } = useSession();
  const [q, setQ] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useTransient();
  const [failure, setFailure] = useTransient();
  const isAdmin = ws.role === 'admin';

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? ws.members.filter((x) => x.name.toLowerCase().includes(term) || x.email.toLowerCase().includes(term)) : ws.members;
  }, [ws, q]);
  const admins = filtered.filter((m) => m.role === 'admin');
  const members = filtered.filter((m) => m.role === 'member');
  const showSubject = !q.trim() || ws.subjectName.toLowerCase().includes(q.trim().toLowerCase());

  async function confirm() {
    if (!token || !pending || busy) return;
    const { kind, member } = pending;
    setBusy(true);
    setFailure(null);
    try {
      if (kind === 'remove') await api.removeMember(token, ws.id, member.userId);
      else await api.transferAdmin(token, ws.id, member.userId);
      setNotice(kind === 'remove' ? `${member.name} foi removido do workspace.` : `${member.name} agora administra este workspace.`);
      await onChanged();
    } catch (e) {
      if (!handleAuthError(e)) setFailure(messageOf(e));
      // Se a equipe mudou por outro lado (ex.: a pessoa já saiu), a lista precisa refletir isso.
      await onChanged().catch(() => undefined);
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  /** RN-002: marca ou desmarca a pessoa acompanhada. Marcar alguém desmarca quem estava marcado. */
  async function toggleSubject(m: Member) {
    if (!token || busy) return;
    setBusy(true);
    setFailure(null);
    try {
      await api.setSubject(token, ws.id, m.userId, !m.isSubject);
      setNotice(
        m.isSubject
          ? `${m.name} deixou de ser a pessoa acompanhada.`
          : `${m.name} agora é a pessoa acompanhada. As entradas que ela registrar serão identificadas assim.`,
      );
      await onChanged();
    } catch (e) {
      if (!handleAuthError(e)) setFailure(messageOf(e));
      await onChanged().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  // O administrador pode marcar qualquer participante como a pessoa acompanhada,
  // inclusive a si mesmo. Passar a administração e remover só valem para membros comuns.
  const actions = (m: Member): ReactNode =>
    isAdmin ? (
      <View style={{ marginTop: 12, gap: 10 }}>
        {m.role === 'member' ? (
          <View style={styles.actionsRow}>
            <Button
              title="Tornar administrador"
              icon="shield"
              variant="outline"
              small
              onPress={() => setPending({ kind: 'transfer', member: m })}
              style={{ flex: 1 }}
            />
            <Button title="Remover" icon="user-x" variant="ghost" small onPress={() => setPending({ kind: 'remove', member: m })} />
          </View>
        ) : null}
        <Button
          title={m.isSubject ? 'Desmarcar pessoa acompanhada' : 'Marcar como pessoa acompanhada'}
          icon="heart"
          variant="ghost"
          small
          disabled={busy}
          onPress={() => void toggleSubject(m)}
        />
      </View>
    ) : null;

  return (
    <View style={styles.pad}>
      <T w="semibold" size={26} accessibilityRole="header">
        Membros
      </T>
      <T size={16} color={colors.textMuted} style={{ marginTop: 4 }}>
        Gerencie a equipe de cuidado — {plural(ws.members.length, 'participante', 'participantes')}
      </T>
      {isAdmin ? (
        <Button title="Convidar membros" icon="user-plus" small onPress={onInvite} style={{ alignSelf: 'flex-start', marginTop: 14 }} />
      ) : null}

      {notice ? (
        <View style={{ marginTop: 14 }}>
          <Alert tone="success" message={notice} />
        </View>
      ) : null}
      {failure ? (
        <View style={{ marginTop: 14 }}>
          <Alert message={failure} />
        </View>
      ) : null}

      <View style={styles.search}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar membros..."
          placeholderTextColor="#757575"
          accessibilityLabel="Buscar membros"
          style={[styles.searchInput, { fontSize: Math.round(16 * scale) }]}
        />
      </View>

      {showSubject ? (
        <>
          <View style={styles.sectionRow}>
            <View style={styles.sectionIcon}>
              <Feather name="heart" size={14} color={colors.primary} />
            </View>
            <T w="medium" size={17}>
              Pessoa acompanhada
            </T>
          </View>
          <View style={[styles.person, styles.subject]}>
            <Avatar text={initials(ws.subjectName)} tone="strong" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <T w="medium" size={17}>
                {ws.subjectName}
              </T>
              <T size={13} color={colors.textMuted}>
                Sujeito acompanhado · registrado em {longDate(ws.createdAt)}
              </T>
            </View>
          </View>
        </>
      ) : null}

      <Section title={`Administradores (${admins.length})`} people={admins} actions={actions} />
      <Section
        title={`Membros (${members.length})`}
        people={members}
        empty="Nenhum membro ainda. Gere um código em Convites e compartilhe."
        actions={actions}
      />

      <Dialog
        visible={!!pending}
        icon={pending?.kind === 'remove' ? 'user-x' : 'shield'}
        danger={pending?.kind === 'remove'}
        title={pending?.kind === 'remove' ? `Remover ${pending.member.name}?` : 'Passar a administração?'}
        message={
          pending?.kind === 'remove'
            ? `${pending.member.name} perde o acesso a “${ws.name}”. A conta e as entradas registradas por essa pessoa continuam.`
            : pending
              ? `${pending.member.name} passará a administrar este workspace e você passará a ser membro comum. Só ${pending.member.name} poderá devolver a administração.`
              : ''
        }
        confirm={busy ? 'Aguarde...' : pending?.kind === 'remove' ? 'Remover' : 'Passar administração'}
        loading={busy}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </View>
  );
}

function Section({
  title,
  people,
  empty,
  actions,
}: {
  title: string;
  people: Member[];
  empty?: string;
  actions?: (m: Member) => ReactNode;
}) {
  return (
    <View>
      <T w="medium" size={17} style={{ marginTop: 22, marginBottom: 10 }}>
        {title}
      </T>
      {people.length === 0 && empty ? (
        <T size={14} color={colors.textMuted}>
          {empty}
        </T>
      ) : null}
      {people.map((p) => (
        <View key={p.userId} style={styles.personCard}>
          <View style={styles.personRow}>
            <Avatar text={initials(p.name)} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <T w="medium" size={17}>
                {p.name}
              </T>
              {p.isSubject ? (
                <View style={styles.subjectBadge}>
                  <Feather name="heart" size={12} color={colors.primary} />
                  <T w="semibold" size={12} color={colors.primary} style={{ marginLeft: 4 }}>
                    Pessoa acompanhada
                  </T>
                </View>
              ) : null}
              <T size={13} color={colors.textMuted}>
                {p.email}
              </T>
              <T size={13} color={colors.textMuted}>
                Entrou em {longDate(p.joinedAt)}
              </T>
            </View>
          </View>
          {actions?.(p)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 22, paddingTop: 20 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
    marginTop: 20,
    marginBottom: 6,
  },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: fonts.regular, fontSize: 16, color: colors.text, minHeight: 46 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 10 },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9CED6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  personCard: { borderWidth: 1, borderColor: '#C9CED6', borderRadius: 10, padding: 12, marginBottom: 10 },
  personRow: { flexDirection: 'row', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  subject: { backgroundColor: colors.primarySoft, borderColor: '#9DB8F2' },
});
