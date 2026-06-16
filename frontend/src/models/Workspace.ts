export interface Workspace {
  id: string;
  nome: string;
  pessoaAcompanhada: string;
  criador: string;
  descricao: string;
  quantidadeMembros: number;
  dataCriacao: string;
  papel: "Admin" | "Membro";
}