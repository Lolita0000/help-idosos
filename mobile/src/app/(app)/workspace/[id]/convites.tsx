import { Redirect, useLocalSearchParams } from 'expo-router';

/** Convites é uma aba da tela de equipe: esta rota só leva até ela, para os links antigos continuarem valendo. */
export default function Convites() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/workspace/[id]/membros', params: { id, aba: 'convites' } }} />;
}
