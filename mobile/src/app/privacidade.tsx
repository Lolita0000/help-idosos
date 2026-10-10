// Texto da tela "Política de privacidade" do Figma.
import { LegalPage } from '../components/LegalPage';

export default function Privacidade() {
  return (
    <LegalPage
      title="Política de Privacidade"
      updated="15 de fevereiro de 2026"
      sections={[
        {
          title: '1. Identificação do Controlador',
          body: 'Esta política é aplicável à plataforma Elo de Cuidado. Para exercício de direitos ou esclarecimentos, o titular pode entrar em contato com o encarregado de Proteção de Dados (DPO) pelo e-mail: contato@elodecuidado.com.br.',
        },
        {
          title: '2. Âmbito e Base Legal',
          body: 'O tratamento de dados pessoais realizado por esta plataforma fundamenta-se exclusivamente nas hipóteses previstas na Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD), em especial:\n• Execução de contrato (art. 7º, V): dados estritamente necessários para a prestação dos serviços contratados pelo titular;\n• Cumprimento de obrigação legal ou regulatória (art. 7º, II): retenção de dados exigida por legislação aplicável;\n• Consentimento (art. 7º, I): quando aplicável e colhido de forma livre, informada e inequívoca.',
        },
        {
          title: '3. Dados Coletados e Finalidade',
          body: 'Coletamos exclusivamente os dados pessoais indispensáveis para o funcionamento da plataforma: nome, e-mail e senha (guardada apenas de forma criptografada), além do conteúdo que você registrar nos workspaces dos quais participa. Esses dados ficam visíveis apenas aos membros de cada workspace. Não realizamos nenhuma utilização secundária dos seus dados, incluindo:\n• Compartilhamento com terceiros para fins comerciais;\n• Análise para elaboração de perfis comportamentais;\n• Uso para publicidade, marketing direto ou inferências sobre o titular;\n• Venda, cessão ou licenciamento de dados a qualquer título.',
        },
        {
          title: '4. Armazenamento e retenção',
          body: 'Os dados pessoais são armazenados pelo período estritamente necessário ao cumprimento das finalidades para as quais foram coletados:\n• Durante a vigência da conta: os dados são mantidos enquanto houver uma relação ativa entre o titular e a plataforma;\n• Após a solicitação de exclusão: os dados pessoais são removidos, observados os prazos mínimos exigidos pela legislação aplicável.',
        },
      ]}
    />
  );
}
