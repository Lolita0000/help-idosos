import { getWorkspaces } from "../services/workspaceService";

export const listarWorkspaces = async () => {
  return await getWorkspaces();
};