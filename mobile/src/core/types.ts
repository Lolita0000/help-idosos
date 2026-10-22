// Tipos do domínio compartilhados pelas telas (núcleo CORE do app).
// Espelham os DTOs da API em backend/DTOs.

export type Role = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  /** Data e hora do aceite dos termos de uso e da política (RN-015). */
  termsAcceptedAt: string;
}

export interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description: string | null;
  subjectName: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  /** Papel do usuário autenticado neste workspace. */
  role: Role;
}

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface WorkspaceDetail extends WorkspaceSummary {
  members: Member[];
}

export interface InviteCode {
  id: string;
  workspaceId: string;
  code: string;
  createdAt: string;
  expiresAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

export interface CreateWorkspaceInput {
  name: string;
  subjectName: string;
  description?: string;
}

/** Categorias do RF05, uma para cada valor do EntryLabel do backend. */
export type DiaryCategory = 'medicamento' | 'humor' | 'sintoma' | 'consulta' | 'observacao' | 'outro';

export interface DiaryEntry {
  id: string;
  workspaceId: string;
  /** Autoria e horário são definidos pelo servidor, nunca pelo cliente (RF05). */
  authorId: string;
  authorName: string;
  category: DiaryCategory;
  title: string;
  description: string;
  createdAt: string;
  /** Preenchido quando a entrada foi editada (RN-008). */
  updatedAt: string | null;
}

export interface DiaryEntryInput {
  category: DiaryCategory;
  title: string;
  description: string;
}

/** Contrato único consumido pelas telas, independente de onde os dados vivem. */
export interface EloApi {
  readonly mode: 'local' | 'http';
  register(input: RegisterInput): Promise<Session>;
  login(email: string, password: string): Promise<Session>;
  logout(token: string): Promise<void>;
  me(token: string): Promise<User>;
  listWorkspaces(token: string): Promise<WorkspaceSummary[]>;
  createWorkspace(token: string, input: CreateWorkspaceInput): Promise<WorkspaceSummary>;
  getWorkspace(token: string, workspaceId: string): Promise<WorkspaceDetail>;
  listInvites(token: string, workspaceId: string): Promise<InviteCode[]>;
  createInvite(token: string, workspaceId: string): Promise<InviteCode>;
  deleteInvite(token: string, inviteId: string): Promise<void>;
  joinWithCode(token: string, code: string): Promise<WorkspaceSummary>;
  /** Entradas do workspace, da mais recente para a mais antiga. */
  listEntries(token: string, workspaceId: string): Promise<DiaryEntry[]>;
  getEntry(token: string, entryId: string): Promise<DiaryEntry>;
  createEntry(token: string, workspaceId: string, input: DiaryEntryInput): Promise<DiaryEntry>;
  updateEntry(token: string, entryId: string, input: DiaryEntryInput): Promise<DiaryEntry>;
  deleteEntry(token: string, entryId: string): Promise<void>;
}
