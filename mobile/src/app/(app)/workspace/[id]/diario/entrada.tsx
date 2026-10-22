// Figma: nova entrada — registrar (HU-04) e, com ?entryId=, editar a própria entrada (HU-06).
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Select } from '../../../../../components/Select';
import { Alert, BackLink, Button, Field, Screen, T } from '../../../../../components/ui';
import { api, ApiError, messageOf, type DiaryCategory } from '../../../../../core';
import { CATEGORIES } from '../../../../../core/diary';
import { ENTRY_DESCRIPTION_MAX, ENTRY_TITLE_MAX, validateEntry } from '../../../../../core/validation';
import { useSession } from '../../../../../session';
import { colors, radius } from '../../../../../theme';

export default function Entrada() {
  const { id, entryId } = useLocalSearchParams<{ id: string; entryId?: string }>();
  const editing = !!entryId;
  const { token, handleAuthError } = useSession();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DiaryCategory | null>(null);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing || !token) return;
    api
      .getEntry(token, entryId)
      .then((e) => {
        setTitle(e.title);
        setCategory(e.category);
        setDescription(e.description);
      })
      .catch((e) => {
        if (!handleAuthError(e)) setFailure(messageOf(e));
      })
      .finally(() => setLoading(false));
  }, [editing, entryId, token, handleAuthError]);

  /** Ao corrigir um campo, a mensagem de erro dele some. */
  const clear =
    <V,>(field: string, set: (v: V) => void) =>
    (v: V) => {
      set(v);
      setErrors(({ [field]: _omit, ...rest }) => rest);
    };

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/workspace/[id]', params: { id } });
  };

  async function submit() {
    const fields = validateEntry({ title, category, description });
    setErrors(fields);
    setFailure(null);
    if (Object.keys(fields).length || !token || !category) return;
    setSaving(true);
    try {
      const input = { title, category, description };
      if (editing) await api.updateEntry(token, entryId, input);
      else await api.createEntry(token, id, input);
      back();
    } catch (e) {
      if (handleAuthError(e)) return;
      if (e instanceof ApiError && Object.keys(e.fields).length) setErrors(e.fields);
      else setFailure(messageOf(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen contentStyle={styles.page}>
      <BackLink onPress={back} />
      <T w="semibold" size={26} style={{ marginTop: 8 }} accessibilityRole="header">
        {editing ? 'Editar Entrada' : 'Nova Entrada'}
      </T>
      <T size={16} color={colors.textMuted} style={{ marginTop: 4, marginBottom: 18 }}>
        {editing ? 'Atualize as informações registradas.' : 'Registre informações sobre o cuidado.'}
      </T>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.card}>
          {failure ? <Alert message={failure} /> : null}
          <Field
            label="Título"
            value={title}
            onChangeText={clear('title', setTitle)}
            placeholder="Ex: Medicação da manhã tomada"
            error={errors.title}
            maxLength={ENTRY_TITLE_MAX}
          />
          <Select
            label="Categoria"
            value={category}
            options={CATEGORIES}
            onChange={clear('category', setCategory)}
            placeholder="Selecione a categoria"
            error={errors.category}
          />
          <Field
            label="Descrição"
            value={description}
            onChangeText={clear('description', setDescription)}
            placeholder="Descreva os detalhes do cuidado..."
            error={errors.description}
            maxLength={ENTRY_DESCRIPTION_MAX}
            multiline
          />

          <View style={styles.actions}>
            <Button title="Cancelar" variant="ghost" small onPress={back} style={{ flex: 1 }} />
            <Button
              title={editing ? 'Salvar' : 'Registrar'}
              icon="save"
              small
              loading={saving}
              onPress={submit}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32 },
  card: {
    borderWidth: 1,
    borderColor: '#D6E4F5',
    borderRadius: radius.md,
    padding: 16,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
});
