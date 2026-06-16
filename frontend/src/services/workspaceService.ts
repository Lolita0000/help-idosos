import type { Workspace } from "../models/Workspace";

export const getWorkspaces = async (): Promise<Workspace[]> => {
  return Promise.resolve([
    {
      id: "1",
      nome: "Cuidados com a Vovó Joana",
      pessoaAcompanhada: "Joana",
      criador: "Carlos Pereira",
      descricao: "Acompanhamento diário da saúde da vovó.",
      quantidadeMembros: 3,
      dataCriacao: "14/03/2025",
      papel: "Admin",
    },
    {
      id: "2",
      nome: "Pós cirurgia do Tio Alberto",
      pessoaAcompanhada: "Alberto",
      criador: "Julia Silva",
      descricao: "Monitoramento da recuperação.",
      quantidadeMembros: 5,
      dataCriacao: "23/02/2025",
      papel: "Membro",
    },
  ]);
};