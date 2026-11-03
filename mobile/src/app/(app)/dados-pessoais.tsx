// Dados pessoais (Figma: dados-pessoais). Nome, telefone, nascimento e gênero.
// O e-mail aparece só para leitura: ele identifica a conta no login.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Select } from '../../components/Select';
import { Alert, BackLink, Button, Field, Screen, T } from '../../components/ui';
import { api, ApiError, messageOf, type Gender } from '../../core';
import {
  displayToIso,
  isoToDisplay,
  maskDate,
  maskPhone,
  validateProfile,
} from '../../core/validation';
import { useFieldChain, useLoad, useTransient } from '../../hooks';
import { useSession } from '../../session';
import { colors } from '../../theme';
import { router } from 'expo-router';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
];

export default function DadosPessoais() {
  const { token, handleAuthError, updateUser } = useSession();
  const { data, error, loading, setData } = useLoad((t) => api.getProfile(t));

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useTransient();
  const [saving, setSaving] = useState(false);

  // O useLoad recarrega a cada foco; preencher só uma vez evita sobrescrever o que está sendo digitado.
  const seeded = useRef(false);
  useEffect(() => {
    if (!data || seeded.current) return;
    seeded.current = true;
    setName(data.name);
    setPhone(maskPhone(data.phone));
    setBirthDate(isoToDisplay(data.birthDate));
    setGender(data.gender);
  }, [data]);

  const dirty =
    !!data &&
    (name.trim() !== data.name ||
      phone.replace(/\D/g, '') !== data.phone ||
      (displayToIso(birthDate) ?? '') !== data.birthDate ||
      gender !== data.gender);

  const chain = useFieldChain(2);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/conta'));

  async function save() {
    setFailure(null);
    setNotice(null);
    const e = validateProfile({ name, phone, birthDate });
    setErrors(e);
    if (Object.keys(e).length || !token) return;
    setSaving(true);
    try {
      const saved = await api.updateProfile(token, {
        name,
        phone,
        birthDate: displayToIso(birthDate) ?? '',
        gender,
      });
      setData(saved);
      updateUser({ name: saved.name });
      setNotice('Dados salvos.');
    } catch (err) {
      if (handleAuthError(err)) return;
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setFailure(messageOf(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen contentStyle={styles.page}>
      <BackLink onPress={back} />
      <T w="semibold" size={24} accessibilityRole="header">
        Dados pessoais
      </T>
      <T size={16} color={colors.textMuted} style={{ marginTop: 6, marginBottom: 22 }}>
        Só você vê estas informações. Telefone, nascimento e gênero são opcionais.
      </T>

      {error ? <Alert message={error} /> : null}
      {loading && !data ? <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} /> : null}

      {data ? (
        <>
          <Field label="Nome completo:" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} maxLength={256} {...chain(0, 1)} />
          <Field label="E-mail:" value={data.email} onChangeText={() => undefined} readOnly helper="O e-mail identifica sua conta e não pode ser alterado aqui." />
          <Field
            label="Telefone: (opcional)"
            value={phone}
            onChangeText={(v) => setPhone(maskPhone(v))}
            placeholder="(61) 99999-0000"
            keyboardType="phone-pad"
            error={errors.phone}
            {...chain(1)}
          />
          <Field
            label="Data de nascimento: (opcional)"
            value={birthDate}
            onChangeText={(v) => setBirthDate(maskDate(v))}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            error={errors.birthDate}
            {...chain(2)}
          />
          <Select
            label="Gênero: (opcional)"
            value={gender || null}
            options={GENDERS}
            onChange={setGender}
            placeholder="Não informado"
          />

          {notice ? <Alert tone="success" message={notice} /> : null}
          {failure ? <Alert message={failure} /> : null}
          <View style={{ gap: 12, marginTop: 10 }}>
            <Button title="Salvar" onPress={save} loading={saving} disabled={!dirty} />
            <Button title="Voltar" variant="ghost" onPress={back} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 32 },
});
