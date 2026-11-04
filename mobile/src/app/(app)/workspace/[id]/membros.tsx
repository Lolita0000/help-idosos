// Equipe do workspace: Membros e Convites (Figma: membros, convites).
// É uma única tela: o cabeçalho e as abas ficam parados e só o conteúdo abaixo muda.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { ConvitesTab } from '../../../../components/ConvitesTab';
import { MembrosTab } from '../../../../components/MembrosTab';
import { WorkspaceHeader, type TeamTab } from '../../../../components/WorkspaceHeader';
import { Alert, FadeIn, Screen } from '../../../../components/ui';
import { useWorkspace } from '../../../../hooks';
import { colors } from '../../../../theme';

export default function Equipe() {
  const { id, aba } = useLocalSearchParams<{ id: string; aba?: string }>();
  const { ws, error, loading, reload } = useWorkspace(id);
  const [tab, setTab] = useState<TeamTab>(aba === 'convites' ? 'convites' : 'membros');

  // Quem chega de fora (menu lateral, atalhos) escolhe a aba pelo parâmetro.
  useEffect(() => {
    if (aba === 'convites' || aba === 'membros') setTab(aba);
  }, [aba]);

  // O parâmetro acompanha a aba, para tocar de novo no mesmo atalho de fora sempre ter efeito.
  const selectTab = (next: TeamTab) => {
    setTab(next);
    router.setParams({ aba: next });
  };

  return (
    <Screen scroll={false}>
      <WorkspaceHeader id={id} name={ws?.name ?? 'Workspace'} role={ws?.role} current={tab} onTab={selectTab} />
      <ScrollView key={tab} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <FadeIn>
          {loading && !ws ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
          ) : error || !ws ? (
            <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
              <Alert message={error ?? 'Workspace não encontrado.'} />
            </View>
          ) : tab === 'convites' ? (
            <ConvitesTab ws={ws} />
          ) : (
            <MembrosTab ws={ws} onInvite={() => selectTab('convites')} onChanged={reload} />
          )}
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}
