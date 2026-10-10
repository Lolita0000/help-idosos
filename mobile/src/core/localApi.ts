// Implementação da API que roda no próprio aparelho (modo demonstração).
//
// Aplica as mesmas regras de negócio da API ASP.NET para a v0.1, para que o app
// possa ser avaliado sem um servidor publicado. Quando EXPO_PUBLIC_API_URL estiver
// definida, o app usa httpApi.ts no lugar deste arquivo (ver core/index.ts).

import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';

import { ApiError } from './errors';
import { dataStore } from './storage';
import type {
  CreateWorkspaceInput,
  EloApi,
  InviteCode,
  Member,
  RegisterInput,
  Role,
  Session,
  User,
  WorkspaceDetail,
  WorkspaceSummary,
} from './types';
import { isValidEmail, normalizeCode, passwordError, validateWorkspace } from './validation';

bcrypt.setRandomFallback((len: number) => Array.from(Crypto.getRandomBytes(len)));

const DB_KEY = 'elo.db.v1';
const BCRYPT_ROUNDS = 8;
const SESSION_HOURS = 8;
const INVITE_HOURS = 24; // RN-005
const MAX_ATTEMPTS = 5; // HU-13, cenário 2
const LOCK_MINUTES = 15;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I

interface UserRow extends User {
  passwordHash: string;
}
interface WorkspaceRow {
  id: string;
  name: string;
  description: string | null;
  subjectName: string;
  createdById: string;
  createdAt: string;
}
interface MemberRow {
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}
interface Db {
  users: UserRow[];
  workspaces: WorkspaceRow[];
  members: MemberRow[];
  invites: InviteCode[];
  sessions: { token: string; userId: string; expiresAt: string }[];
  attempts: Record<string, { count: number; lockedUntil: string | null }>;
}

const emptyDb = (): Db => ({
  users: [],
  workspaces: [],
  members: [],
  invites: [],
  sessions: [],
  attempts: {},
});

async function load(): Promise<Db> {
  const raw = await dataStore.get(DB_KEY);
  if (!raw) return emptyDb();
  try {
    return { ...emptyDb(), ...(JSON.parse(raw) as Db) };
  } catch {
    return emptyDb();
  }
}

async function save(db: Db): Promise<void> {
  await dataStore.set(DB_KEY, JSON.stringify(db));
}

const now = () => new Date().toISOString();
const uuid = () => Crypto.randomUUID();

function publicUser(u: UserRow): User {
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}

function newCode(): string {
  const bytes = Crypto.getRandomBytes(8);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

function openSession(db: Db, user: UserRow): Session {
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString();
  const token = Crypto.randomUUID() + Crypto.randomUUID();
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > Date.now());
  db.sessions.push({ token, userId: user.id, expiresAt });
  return { token, expiresAt, user: publicUser(user) };
}

/** RN-013: sem token válido, nenhuma operação é executada (equivalente ao 401). */
function requireUser(db: Db, token: string): UserRow {
  const s = db.sessions.find((x) => x.token === token);
  if (!s || new Date(s.expiresAt).getTime() <= Date.now())
    throw new ApiError('UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');
  const user = db.users.find((u) => u.id === s.userId);
  if (!user) throw new ApiError('UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');
  return user;
}

/** RNF-002: só membros acessam os dados do workspace (equivalente ao 403). */
function requireMember(db: Db, userId: string, workspaceId: string): MemberRow {
  const m = db.members.find((x) => x.workspaceId === workspaceId && x.userId === userId);
  if (!m) throw new ApiError('FORBIDDEN', 'Você não tem acesso a este workspace.');
  return m;
}

function summary(db: Db, ws: WorkspaceRow, role: Role): WorkspaceSummary {
  const creator = db.users.find((u) => u.id === ws.createdById);
  return {
    id: ws.id,
    name: ws.name,
    description: ws.description,
    subjectName: ws.subjectName,
    createdBy: creator?.name ?? 'Usuário removido',
    memberCount: db.members.filter((m) => m.workspaceId === ws.id).length,
    createdAt: ws.createdAt,
    role,
  };
}

export const localApi: EloApi = {
  mode: 'local',

  // HU-02
  async register(input: RegisterInput) {
    const fields: Record<string, string> = {};
    if (!input.name.trim()) fields.name = 'Informe seu nome completo.';
    if (!isValidEmail(input.email)) fields.email = 'Este endereço de e-mail é inválido.';
    const pw = passwordError(input.password);
    if (pw) fields.password = pw;
    if (!input.acceptedTerms)
      fields.terms = 'É obrigatório aceitar os Termos de Serviço e a Política de Privacidade.';
    if (Object.keys(fields).length) throw new ApiError('VALIDATION', 'Revise os campos.', fields);

    const db = await load();
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email))
      throw new ApiError('EMAIL_IN_USE', 'Este e-mail já está em uso. Faça login para continuar.', {
        email: 'Este e-mail já está em uso. Faça login para continuar.',
      });

    const ts = now();
    const user: UserRow = {
      id: uuid(),
      name: input.name.trim(),
      email,
      // Senha guardada apenas como hash BCrypt (RNF-003).
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      createdAt: ts,
      termsAcceptedAt: ts, // RN-015
    };
    db.users.push(user);
    const session = openSession(db, user);
    await save(db);
    return session;
  },

  // HU-13
  async login(emailInput, password) {
    const db = await load();
    const email = emailInput.trim().toLowerCase();
    const att = db.attempts[email] ?? { count: 0, lockedUntil: null };

    if (att.lockedUntil && new Date(att.lockedUntil).getTime() > Date.now())
      throw new ApiError(
        'ACCOUNT_LOCKED',
        'Muitas tentativas sem sucesso. Por segurança, o acesso foi bloqueado por 15 minutos.',
      );

    const user = db.users.find((u) => u.email === email);
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !ok) {
      att.count = att.lockedUntil ? 1 : att.count + 1;
      att.lockedUntil = null;
      if (att.count >= MAX_ATTEMPTS) {
        att.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
        att.count = 0;
      }
      db.attempts[email] = att;
      await save(db);
      if (att.lockedUntil)
        throw new ApiError(
          'ACCOUNT_LOCKED',
          'Muitas tentativas sem sucesso. Por segurança, o acesso foi bloqueado por 15 minutos.',
        );
      // Mensagem genérica: não revela se o e-mail existe.
      throw new ApiError(
        'INVALID_CREDENTIALS',
        'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
      );
    }

    delete db.attempts[email];
    const session = openSession(db, user);
    await save(db);
    return session;
  },

  async logout(token) {
    const db = await load();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    await save(db);
  },

  async me(token) {
    const db = await load();
    return publicUser(requireUser(db, token));
  },

  async listWorkspaces(token) {
    const db = await load();
    const user = requireUser(db, token);
    return db.members
      .filter((m) => m.userId === user.id)
      .map((m) => {
        const ws = db.workspaces.find((w) => w.id === m.workspaceId)!;
        return summary(db, ws, m.role);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // HU-01
  async createWorkspace(token, input: CreateWorkspaceInput) {
    const fields = validateWorkspace(input.name, input.subjectName);
    if (Object.keys(fields).length) throw new ApiError('VALIDATION', 'Revise os campos.', fields);
    const db = await load();
    const user = requireUser(db, token);
    const ts = now();
    const ws: WorkspaceRow = {
      id: uuid(),
      name: input.name.trim(),
      description: input.description?.trim() || null,
      // RN-002: o sujeito é registrado no workspace, sem convite automático.
      subjectName: input.subjectName.trim(),
      createdById: user.id,
      createdAt: ts,
    };
    db.workspaces.push(ws);
    // RN-001: o criador vira administrador.
    db.members.push({ workspaceId: ws.id, userId: user.id, role: 'admin', joinedAt: ts });
    await save(db);
    return summary(db, ws, 'admin');
  },

  async getWorkspace(token, workspaceId) {
    const db = await load();
    const user = requireUser(db, token);
    const ws = db.workspaces.find((w) => w.id === workspaceId);
    if (!ws) throw new ApiError('NOT_FOUND', 'Workspace não encontrado.');
    const me = requireMember(db, user.id, workspaceId);
    const members: Member[] = db.members
      .filter((m) => m.workspaceId === workspaceId)
      .map((m) => {
        const u = db.users.find((x) => x.id === m.userId);
        return {
          userId: m.userId,
          name: u?.name ?? 'Usuário removido',
          email: u?.email ?? '',
          role: m.role,
          joinedAt: m.joinedAt,
        };
      })
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    const detail: WorkspaceDetail = { ...summary(db, ws, me.role), members };
    return detail;
  },

  async listInvites(token, workspaceId) {
    const db = await load();
    const user = requireUser(db, token);
    const me = requireMember(db, user.id, workspaceId);
    if (me.role !== 'admin')
      throw new ApiError('FORBIDDEN', 'Apenas o administrador gerencia convites.');
    return db.invites
      .filter((i) => i.workspaceId === workspaceId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // HU-03 (lado do administrador)
  async createInvite(token, workspaceId) {
    const db = await load();
    const user = requireUser(db, token);
    const me = requireMember(db, user.id, workspaceId);
    if (me.role !== 'admin')
      throw new ApiError('FORBIDDEN', 'Apenas o administrador pode gerar convites.');
    let code = newCode();
    while (db.invites.some((i) => i.code === code)) code = newCode();
    const created = new Date();
    const invite: InviteCode = {
      id: uuid(),
      workspaceId,
      code,
      createdAt: created.toISOString(),
      expiresAt: new Date(created.getTime() + INVITE_HOURS * 3600_000).toISOString(),
    };
    db.invites.push(invite);
    await save(db);
    return invite;
  },

  async deleteInvite(token, inviteId) {
    const db = await load();
    const user = requireUser(db, token);
    const invite = db.invites.find((i) => i.id === inviteId);
    if (!invite) throw new ApiError('NOT_FOUND', 'Convite não encontrado.');
    const me = requireMember(db, user.id, invite.workspaceId);
    if (me.role !== 'admin')
      throw new ApiError('FORBIDDEN', 'Apenas o administrador pode remover convites.');
    db.invites = db.invites.filter((i) => i.id !== inviteId);
    await save(db);
  },

  // HU-03 (lado de quem recebe o código)
  async joinWithCode(token, rawCode) {
    const code = normalizeCode(rawCode);
    if (!code) throw new ApiError('VALIDATION', 'Informe o código de convite.');
    const db = await load();
    const user = requireUser(db, token);
    const invite = db.invites.find((i) => i.code === code);
    if (!invite)
      throw new ApiError('INVITE_INVALID', 'Código inválido. Verifique o código e tente novamente.');
    if (new Date(invite.expiresAt).getTime() <= Date.now())
      throw new ApiError(
        'INVITE_EXPIRED',
        'Este código expirou (validade de 24 horas). Peça um novo código ao administrador.',
      );
    const ws = db.workspaces.find((w) => w.id === invite.workspaceId);
    if (!ws)
      throw new ApiError('INVITE_INVALID', 'Código inválido. Verifique o código e tente novamente.');
    if (db.members.some((m) => m.workspaceId === ws.id && m.userId === user.id))
      throw new ApiError('ALREADY_MEMBER', 'Você já faz parte deste workspace.');
    // RN-004: entra como membro com papel padrão.
    db.members.push({ workspaceId: ws.id, userId: user.id, role: 'member', joinedAt: now() });
    await save(db);
    return summary(db, ws, 'member');
  },
};
