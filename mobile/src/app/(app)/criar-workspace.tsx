// HU-01 — Criar workspace (Figma: criar-workspace e criar-workspace-erro).
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Alert, BackLink, Button, Field, Screen, T } from '../../components/ui';
import { api, ApiError, messageOf } from '../../core';
import { validateWorkspace } from '../../core/validation';
import { useSession } from '../../session';
import { colors } from '../../theme';

export default function CriarWorkspace() {
  const { token, handleAuthError } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cenário 5: cancelar não salva nada.
  const cancel = () => (router.canGoBack() ? router.back() : router.replace('/workspaces'));

  async function submit() {
    setFailure(null);
    const e = validateWorkspace(name, subjectName);
    setErrors(e);
    if (Object.keys(e).length || !token) return;
    setLoading(true);
    try {
      const ws = await api.createWorkspace(token, { name, subjectName, description });
      router.replace({ pathname: '/workspace-criado', params: { id: ws.id } });
    } catch (err) {
      if (handleAuthError(err)) return;
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setFailure(messageOf(err));
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.page}>
      <BackLink onPress={cancel} />
      <T w="semibold" size={24} style={styles.center} accessibilityRole="header">
        Criar Workspace
      </T>
      <T size={16} color={colors.textMuted} style={[styles.center, { marginTop: 8, marginBottom: 26 }]}>
        Defina o nome, a descrição e o sujeito que será acompanhado.
      </T>

      <Field label="Nome do espaço:" value={name} onChangeText={setName} placeholder="Ex: Cuidados com a mamãe" error={errors.name} maxLength={120} />
      <Field label="Descrição: (opcional)" value={description} onChangeText={setDescription} placeholder="Descreva o objetivo do espaço criado" multiline maxLength={500} />
      <Field
        label="Nome do sujeito:"
        value={subjectName}
        onChangeText={setSubjectName}
        placeholder="Ex: Carla da Silva"
        autoCapitalize="words"
        error={errors.subjectName}
        helper="O sujeito não recebe convite automático. Para dar acesso a ele, gere um código de convite depois."
        maxLength={256}
      />

      {failure ? <Alert message={failure} /> : null}
      <View style={{ gap: 12, marginTop: 14 }}>
        <Button title="Criar Workspace" onPress={submit} loading={loading} />
        <Button title="Cancelar" variant="ghost" onPress={cancel} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 32 },
  center: { textAlign: 'center' },
});
