// HU-13 — Autenticar usuário (Figma: login, login-erro, login-bloqueado).
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '../components/AuthHeader';
import { Alert, Button, Card, Field, LinkText, Screen, T } from '../components/ui';
import { messageOf } from '../core';
import { validateLogin } from '../core/validation';
import { useSession } from '../session';
import { colors } from '../theme';

export default function Login() {
  const { login, user } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Redirect href="/workspaces" />;

  async function submit() {
    setFailure(null);
    // Cenário 3: campos em branco não geram requisição.
    const e = validateLogin(email, password);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/workspaces');
    } catch (err) {
      setFailure(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen bg={colors.bgSoft} edges={['bottom']}>
      <StatusBar style="light" />
      <AuthHeader
        title="Cuide de quem você ama!"
        subtitle="O Elo de Cuidado permite que você e sua família acompanhem juntos a saúde de pessoas queridas, compartilhando informações importantes de forma segura e organizada."
      />
      <View style={styles.body}>
        <Card style={styles.card}>
          <T w="semibold" size={25} style={styles.center}>
            Bem-vindo de volta
          </T>
          <T size={15} color={colors.textMuted} style={[styles.center, { marginTop: 6, marginBottom: 22 }]}>
            Entre com suas credenciais para acessar sua conta
          </T>
          <Field
            label="E-mail:"
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail.."
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            error={errors.email}
          />
          <Field
            label="Senha:"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secure
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            error={errors.password}
          />
          {failure ? <Alert message={failure} /> : null}
          <Button title="Entrar" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
          <View style={{ marginTop: 18 }}>
            <LinkText prefix="Não possui conta?" link="Cadastre-se." onPress={() => router.push('/cadastro')} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, marginTop: -12, paddingBottom: 32 },
  card: { borderWidth: 0, paddingHorizontal: 22, paddingVertical: 26 },
  center: { textAlign: 'center' },
});
