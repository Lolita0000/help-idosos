# Política de ciclo de vida dos dados

Concilia exclusão definitiva (RN-006), direito de eliminação (RN-011, RN-014) e
auditoria (RN-010). Responde ao Parecer 01 e à issue #61. Descreve o que o
sistema **faz hoje**; o que ainda não existe está marcado como tal.

## Resumo

| Dado | Quando é apagado | O que sobra |
|---|---|---|
| Entrada do diário | Exclusão pelo autor ou pelo administrador (RN-006, RN-007) | Registro de auditoria sem o conteúdo |
| Conta e dados pessoais | Exclusão da conta pelo titular (HU-05) | Nada que identifique a pessoa |
| Entradas de quem excluiu a conta | Permanecem no workspace | Autoria anulada, exibida como "Usuário removido" |
| Workspace | Exclusão pelo administrador, ou quando o último participante exclui a conta | Nada: entradas, convites e auditoria saem junto |
| Backup | Rotação automática | Cópias antigas com dados já excluídos, ver abaixo |

## 1. O que a auditoria retém

O `AuditLog` guarda **quem** agiu, **qual ação** (edição ou exclusão), **qual
entidade**, o **id** dela e **quando**. Nunca guarda título, descrição ou
qualquer conteúdo da entrada. Assim "apagar de vez" é verdade: depois da
exclusão, o conteúdo não existe mais em nenhuma tabela.

O registro é gravado na mesma transação da operação (RNF-006): não há ação sem
rastro, nem rastro de ação que não ocorreu.

## 2. Autoria quando o usuário exclui a própria conta

A autoria é **anonimizada**, não removida com o conteúdo. Ao excluir a conta, o
vínculo com o autor é anulado (`SetNull`) nas entradas e nos registros de
auditoria, e o app mostra "Usuário removido" (RN-014). Não há escolha: a
anonimização é sempre aplicada.

Motivo: as entradas descrevem a saúde de outra pessoa (o idoso cuidado) e são
úteis aos demais membros. Apagá-las puniria quem não pediu nada.

## 3. Entradas em workspaces compartilhados

Permanecem no histórico, com autoria anônima. O que é apagado é o que
identifica o titular: nome, e-mail, senha, telefone, nascimento, gênero e os
vínculos com workspaces. A sessão é encerrada e o token deixa de valer no ato.

## 4. Quanto tempo os dados permanecem

- **Dados da conta e entradas:** enquanto a conta existir. Excluídos no pedido.
- **Auditoria:** enquanto o workspace existir. **Não há prazo de expurgo
  automático hoje**; o registro só sai com o workspace.
- **Backups:** o serviço `backup` guarda as últimas `BACKUP_KEEP` cópias
  (padrão 7), uma a cada `BACKUP_INTERVAL_SECONDS` (padrão 6 horas). Um dado
  excluído pode, portanto, continuar em backup por cerca de **42 horas** (7
  cópias a cada 6 horas) até a cópia que o contém ser rotacionada. Os arquivos
  ficam fora do repositório e do volume do banco.
- **Se uma cópia for restaurada**, os pedidos de exclusão posteriores a ela
  precisam ser reaplicados. Hoje isso é manual.

## 5. RN-012 x HU-05: administrador que exclui a conta

- Se o titular **administra um workspace que ainda tem outros participantes**,
  a exclusão é **recusada** (erro `ADMIN_HAS_MEMBERS`) e o app lista os
  workspaces. Ele deve transferir a administração ou remover os membros antes.
  Isso evita um workspace sem administrador e um histórico de saúde inacessível.
- Se o titular é o **único participante**, o workspace é excluído junto, com
  entradas, convites e auditoria. Ninguém mais depende dele.
- Se o titular é **membro comum**, apenas o vínculo é removido.

Há uma só regra para as duas histórias: nunca deixar um workspace com membros e
sem administrador, e nunca apagar o histórico de quem não pediu.

## 6. Exclusão de workspace

Quando o administrador exclui o workspace, tudo o que pertence a ele é apagado
em cascata, **inclusive a trilha de auditoria**. A auditoria existe para
proteger os membros daquele workspace; sem ele, não há a quem prestar contas.

## Decisões em aberto

- **Prazo de expurgo da auditoria.** Hoje é indeterminado. Proposta para a
  versão seguinte: expurgar registros com mais de 12 meses.
- **Reaplicação das exclusões após restaurar backup.** Hoje manual. Proposta:
  manter uma lista de ids excluídos fora do banco.
- **Janela de backup.** Reduzir `BACKUP_KEEP` encurta o tempo que um dado
  excluído sobrevive, ao custo de menos pontos de restauração.
