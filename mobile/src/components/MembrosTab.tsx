// Conteúdo da aba Membros (Figma: membros): pessoa acompanhada, administradores e membros.
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import type { Member, WorkspaceDetail } from '../core';
import { initials, longDate, plural } from '../core/format';
import { useFontScale } from '../fontScale';
import { colors, fonts } from '../theme';
import { Avatar, Button, Feather, T } from './ui';

export function MembrosTab({ ws, onInvite }: { ws: WorkspaceDetail; onInvite: () => void }) {
  const { scale } = useFontScale();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? ws.members.filter((x) => x.name.toLowerCase().includes(term) || x.email.toLowerCase().includes(term)) : ws.members;
  }, [ws, q]);
  const admins = filtered.filter((m) => m.role === 'admin');
  const members = filtered.filter((m) => m.role === 'member');
  const showSubject = !q.trim() || ws.subjectName.toLowerCase().includes(q.trim().toLowerCase());

  return (
    <View style={styles.pad}>
      <T w="semibold" size={26} accessibilityRole="header">
        Membros
      </T>
      <T size={16} color={colors.textMuted} style={{ marginTop: 4 }}>
        Gerencie a equipe de cuidado — {plural(ws.members.length, 'participante', 'participantes')}
      </T>
      {ws.role === 'admin' ? (
        <Button title="Convidar membros" icon="user-plus" small onPress={onInvite} style={{ alignSelf: 'flex-start', marginTop: 14 }} />
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

      <Section title={`Administradores (${admins.length})`} people={admins} />
      <Section title={`Membros (${members.length})`} people={members} empty="Nenhum membro ainda. Gere um código em Convites e compartilhe." />
    </View>
  );
}

function Section({ title, people, empty }: { title: string; people: Member[]; empty?: string }) {
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
        <View key={p.userId} style={styles.person}>
          <Avatar text={initials(p.name)} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <T w="medium" size={17}>
              {p.name}
            </T>
            <T size={13} color={colors.textMuted}>
              {p.email}
            </T>
            <T size={13} color={colors.textMuted}>
              Entrou em {longDate(p.joinedAt)}
            </T>
          </View>
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
  subject: { backgroundColor: colors.primarySoft, borderColor: '#9DB8F2' },
});
