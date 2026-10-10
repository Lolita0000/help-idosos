// Texto da tela "Termo de Uso" do Figma.
import { LegalPage } from '../components/LegalPage';

export default function Termos() {
  return (
    <LegalPage
      title="Termos de Uso"
      updated="10 de maio de 2024"
      sections={[
        {
          body: 'Bem-vindo ao Elo de Cuidado. Estes Termos de Uso regulam o acesso e a utilização da plataforma Elo de Cuidado, desenvolvida para conectar pessoas através do cuidado, da organização e do carinho.',
        },
        {
          title: '1. Aceitação dos termos',
          body: 'Ao acessar ou utilizar a plataforma Elo de Cuidado, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.',
        },
        {
          title: '2. Descrição do serviço',
          body: 'O Elo de Cuidado é uma plataforma digital que oferece ferramentas para organização de cuidados, comunicação, acompanhamento de atividades e compartilhamento de informações entre usuários, como familiares, cuidadores e profissionais de saúde.',
        },
        {
          title: '3. Cadastro e conta',
          body: 'Para utilizar determinados recursos da plataforma, é necessário realizar um cadastro e manter suas informações sempre atualizadas, completas e verdadeiras. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.',
        },
        {
          title: '4. Uso adequado',
          body: 'Você concorda em utilizar a plataforma apenas para finalidades lícitas e de acordo com estes Termos de Uso. É proibido:\n• Utilizar o serviço para fins ilegais ou não autorizados;\n• Tentar acessar áreas restritas do sistema;\n• Interferir ou danificar o funcionamento da plataforma;\n• Compartilhar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros.',
        },
        {
          title: '5. Privacidade',
          body: 'O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade. Recomendamos que você a leia para entender como coletamos, usamos e protegemos suas informações.',
        },
        {
          title: '6. Propriedade intelectual',
          body: 'Todo o conteúdo, marcas, logotipos e materiais disponíveis na plataforma são de propriedade do Elo de Cuidado ou de seus licenciantes, sendo protegidos pelas leis de propriedade intelectual. É proibida a reprodução ou uso não autorizado.',
        },
        {
          title: '7. Alterações nos termos',
          body: 'Podemos atualizar estes Termos de Uso periodicamente. As alterações serão publicadas nesta página, com a data da última atualização. Recomendamos que você revise este documento regularmente.',
        },
        {
          title: '8. Contato',
          body: 'Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: contato@elodecuidado.com.br.',
        },
      ]}
    />
  );
}
