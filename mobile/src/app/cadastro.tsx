// HU-02 — Cadastrar usuário (Figma: cadastro, cadastro-preenchido, cadastro-erros).
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '../components/AuthHeader';
import { Alert, Button, Card, Checkbox, Field, LinkText, Screen, T } from '../components/ui';
import { ApiError, messageOf } from '../core';
import { PASSWORD_HINT, validateRegister } from '../core/validation';
import { useSession } from '../session';
import { colors } from '../theme';

export default function Cadastro() {
  const { register, user } = useSession();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', acceptedTerms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user && !loading) return <Redirect href="/workspaces" />;

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setFailure(null);
    const e = validateRegister(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        acceptedTerms: form.acceptedTerms,
      });
      router.replace('/workspaces');
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setFailure(messageOf(err));
      setLoading(false);
    }
  }

  return (
    <Screen bg={colors.bgSoft} edges={['bottom']}>
      <StatusBar style="light" />
      <AuthHeader
        title="Junte-se à nossa comunidade de cuidado"
        subtitle="Milhares de famílias já usam o Elo de Cuidado para manter todos informados sobre a saúde de seus entes queridos."
        bullets={[
          'Registre medicações e sintomas',
          'Compartilhe com toda família',
          'Histórico de saúde sempre organizado',
          'Dados seguros e privados (LGPD)',
        ]}
      />
      <View style={styles.body}>
        <Card style={styles.card}>
          <T w="semibold" size={30} style={styles.center}>
            Criar conta
          </T>
          <T size={15} color={colors.textMuted} style={[styles.center, { marginTop: 6, marginBottom: 22 }]}>
            Preencha os dados abaixo para começar a usar o Elo de Cuidado
          </T>
          <Field label="Nome completo:" value={form.name} onChangeText={set('name')} placeholder="Digite seu nome.." autoCapitalize="words" autoComplete="name" textContentType="name" error={errors.name} maxLength={256} />
          <Field label="E-mail:" value={form.email} onChangeText={set('email')} placeholder="Digite seu e-mail.." keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={errors.email} maxLength={254} />
          <Field label="Senha:" value={form.password} onChangeText={set('password')} placeholder="Crie uma senha forte" secure autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" error={errors.password} helper={PASSWORD_HINT} />
          <Field label="Confirmar senha:" value={form.confirm} onChangeText={set('confirm')} placeholder="Digite a senha novamente" secure autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" error={errors.confirm} />

          <View style={{ marginTop: 4 }}>
            <Checkbox
              checked={form.acceptedTerms}
              onToggle={() => setForm((f) => ({ ...f, acceptedTerms: !f.acceptedTerms }))}
              error={!!errors.terms}
            >
              <T size={15}>
                Li e concordo com os{' '}
                <T w="semibold" size={15} color={colors.primary} onPress={() => router.push('/termos')} accessibilityRole="link">
                  Termos de Serviço
                </T>{' '}
                e a{' '}
                <T w="semibold" size={15} color={colors.primary} onPress={() => router.push('/privacidade')} accessibilityRole="link">
                  Política de Privacidade
                </T>
                .
              </T>
            </Checkbox>
            {errors.terms ? (
              <T size={13} color={colors.danger} style={{ marginTop: 6 }}>
                {errors.terms}
              </T>
            ) : null}
          </View>

          {failure ? <View style={{ marginTop: 14 }}><Alert message={failure} /></View> : null}
          <Button title="Registrar" onPress={submit} loading={loading} style={{ marginTop: 22 }} />
          <View style={{ marginTop: 14 }}>
            <LinkText prefix="Já possui uma conta?" link="Entrar." onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, marginTop: -14, paddingBottom: 32 },
  card: { borderWidth: 0, paddingHorizontal: 22, paddingVertical: 26 },
  center: { textAlign: 'center' },
});
