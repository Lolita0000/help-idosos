import type { WorkspaceDetail } from './types';

/**
 * Último detalhe conhecido de cada workspace. Cada aba (Membros, Convites) é uma
 * tela nova que começaria vazia: com o cache, ela abre já com o nome e o papel
 * certos e só atualiza em segundo plano, sem o cabeçalho piscar.
 */
export const workspaceCache = new Map<string, WorkspaceDetail>();
