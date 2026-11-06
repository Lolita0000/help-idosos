// Configuração do workspace (Figma: configuracao, configuracao-2, dashboard-edt).
// Edição dos dados, totais e Zona de Perigo com exclusão em duas confirmações (RN-012).
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '../../../../components/AppHeader';
import { Alert, Button, Dialog, Feather, Field, Screen, T } from '../../../../components/ui';
import { api, ApiError, messageOf } from '../../../../core';
import { plural } from '../../../../core/format';
import { validateWorkspace } from '../../../../core/validation';
import { useFontScale } from '../../../../fontScale';
import { useFieldChain, useLoad, useTransient } from '../../../../hooks';
import { useSession } from '../../../../session';
import { colors, fonts, radius, TOUCH } from '../../../../theme';

/** Palavra que a pessoa digita na segunda confirmação. */
const CONFIRM_WORD = 'EXCLUIR';

type Step = 'idle' | 'warning' | 'confirm';

export default function Configuracao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, handleAuthError } = useSession();
  const { scale } = useFontScale();
  const { data, error, loading, setData } = useLoad(async (t) => {
    const ws = await api.getWorkspace(t, id);
    // Os totais só aparecem para o administrador, que é quem usa esta tela.
    const stats = ws.role === 'admin' ? await api.getWorkspaceStats(t, id) : null;
    return { ws, stats };
  });

  const [name, setName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useTransient();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  // O useLoad recarrega a cada foco; preencher só uma vez evita sobrescrever o que está sendo digitado.
  const seeded = useRef(false);
  useEffect(() => {
    if (!data || seeded.current) return;
    seeded.current = true;
    setName(data.ws.name);
    setSubjectName(data.ws.subjectName);
    setDescription(data.ws.description ?? '');
  }, [data]);

  const chain = useFieldChain(2);

  const ws = data?.ws;
  const isAdmin = ws?.role === 'admin';
  const dirty =
    !!ws &&
    (name.trim() !== ws.name || subjectName.trim() !== ws.subjectName || description.trim() !== (ws.description ?? ''));

  async function save() {
    setFailure(null);
    setNotice(null);
    const e = validateWorkspace(name, subjectName);
    setErrors(e);
    if (Object.keys(e).length || !token) return;
    setSaving(true);
    try {
      const updated = await api.updateWorkspace(token, id, { name, subjectName, description });
      setName(updated.name);
      setSubjectName(updated.subjectName);
      setDescription(updated.description ?? '');
      // Atualiza a base de comparação do "dirty" e o nome no cabeçalho.
      setData((d) => (d ? { ...d, ws: { ...d.ws, ...updated, members: d.ws.members, role: d.ws.role } } : d));
      setNotice('Alterações salvas.');
    } catch (err) {
      if (handleAuthError(err)) return;
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setFailure(messageOf(err));
    } finally {
      setSaving(false);
    }
  }

  const cancelDelete = () => {
    setStep('idle');
    setTyped('');
  };

  async function remove() {
    if (typed.trim().toUpperCase() !== CONFIRM_WORD || !token) return;
    setDeleting(true);
    try {
      await api.deleteWorkspace(token, id);
      router.replace('/workspaces');
    } catch (err) {
      setDeleting(false);
      cancelDelete();
      if (!handleAuthError(err)) setFailure(messageOf(err));
    }
  }

  return (
    <Screen contentStyle={{ paddingBottom: 32 }}>
      <AppHeader workspace={{ id, role: ws?.role }} current="configuracao" title={ws?.name} />
      <View style={styles.pad}>
        <T w="semibold" size={26} accessibilityRole="header">
          Configuração
        </T>
        <T size={16} color={colors.textMuted} style={{ marginTop: 4, marginBottom: 18 }}>
          Dados do workspace
        </T>

        {error ? <Alert message={error} /> : null}
        {loading && !data ? <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} /> : null}
        {ws && !isAdmin ? <Alert message="Apenas o administrador pode alterar ou excluir este workspace." /> : null}

        {ws && isAdmin ? (
          <>
            {data?.stats ? (
              <View style={styles.stats}>
                <Stat icon="users" value={data.stats.memberCount} label={data.stats.memberCount === 1 ? 'membro' : 'membros'} />
                <Stat icon="book-open" value={data.stats.entryCount} label={data.stats.entryCount === 1 ? 'registro' : 'registros'} />
              </View>
            ) : null}

            <Field label="Nome do espaço:" value={name} onChangeText={setName} error={errors.name} maxLength={100} {...chain(0, 1)} />
            <Field label="Descrição: (opcional)" value={description} onChangeText={setDescription} multiline maxLength={500} inputRef={chain(1).inputRef} />
            <Field
              label="Nome do sujeito:"
              value={subjectName}
              onChangeText={setSubjectName}
              autoCapitalize="words"
              error={errors.subjectName}
              maxLength={100}
              {...chain(2)}
            />

            {notice ? <Alert tone="success" message={notice} /> : null}
            {failure ? <Alert message={failure} /> : null}
            <Button title="Salvar alterações" onPress={save} loading={saving} disabled={!dirty} style={{ marginTop: 6 }} />

            <View style={styles.zone}>
              <View style={styles.zoneTitle}>
                <Feather name="alert-triangle" size={20} color={colors.danger} />
                <T w="semibold" size={17} color={colors.danger} style={{ marginLeft: 8 }}>
                  Zona de Perigo
                </T>
              </View>
              <T size={14} color={colors.textMuted} style={{ marginTop: 6 }}>
                Excluir o workspace apaga também os membros, os convites e todas as entradas do diário, para todos os
                participantes. Não há como recuperar.
              </T>
              <Button
                title="Excluir workspace"
                icon="trash-2"
                variant="danger"
                onPress={() => setStep('warning')}
                style={{ marginTop: 14 }}
              />
            </View>
          </>
        ) : null}
      </View>

      {/* 1ª confirmação: aviso do que será apagado. */}
      <Dialog
        visible={step === 'warning'}
        icon="alert-triangle"
        danger
        title="Excluir este workspace?"
        message={`Esta ação é permanente e não pode ser desfeita. ${
          data?.stats
            ? `${plural(data.stats.entryCount, 'entrada', 'entradas')} e ${plural(data.stats.memberCount, 'vínculo de membro', 'vínculos de membros')} serão apagados`
            : 'As entradas e os vínculos dos membros serão apagados'
        } para todos os participantes. As contas dos membros continuam existindo.`}
        confirm="Continuar"
        onCancel={cancelDelete}
        onConfirm={() => setStep('confirm')}
      />

      {/* 2ª confirmação: a pessoa digita a palavra de confirmação. */}
      <Dialog
        visible={step === 'confirm'}
        icon="trash-2"
        danger
        title="Confirme a exclusão"
        message={`Para excluir "${ws?.name ?? ''}", digite ${CONFIRM_WORD} no campo abaixo.`}
        confirm={deleting ? 'Excluindo...' : 'Excluir workspace'}
        confirmDisabled={typed.trim().toUpperCase() !== CONFIRM_WORD}
        loading={deleting}
        onCancel={cancelDelete}
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
    </Screen>
  );
}

function Stat({ icon, value, label }: { icon: keyof typeof Feather.glyphMap; value: number; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Feather name={icon} size={22} color={colors.primary} />
      <T w="semibold" size={24} style={{ marginTop: 6 }}>
        {value}
      </T>
      <T size={14} color={colors.textMuted}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 22, paddingTop: 20 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D6E4F5',
    borderRadius: radius.md,
    backgroundColor: colors.bgSoft,
  },
  zone: {
    marginTop: 32,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  zoneTitle: { flexDirection: 'row', alignItems: 'center' },
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
