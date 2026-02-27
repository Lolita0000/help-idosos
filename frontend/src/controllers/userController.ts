import type { User } from "../models/User";
import { createUser } from "../services/userService";

export const cadastrarUsuario = async (nome: string, telefone: string) => {
  const user: User = { nome, telefone };
  return await createUser(user);
};