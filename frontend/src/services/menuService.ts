import type { MenuItem } from "../models/MenuItem";

export const getMenuItems = async (): Promise<MenuItem[]> => {
  return Promise.resolve([
    {
      id: 1,
      nome: "Dashboard",
      categoria: "Menu principal",
    },
    {
      id: 2,
      nome: "Diário de Cuidados",
      categoria: "Menu principal",
    },
    {
      id: 3,
      nome: "Membros",
      categoria: "Menu principal",
    },
    {
      id: 4,
      nome: "Convites",
      categoria: "Menu principal",
    },
    {
      id: 5,
      nome: "Relatórios",
      categoria: "Menu principal",
    },
    {
      id: 6,
      nome: "Meus Workspaces",
      categoria: "Workspaces",
    },
    {
      id: 7,
      nome: "Configurações",
      categoria: "Administração",
    },
  ]);
};