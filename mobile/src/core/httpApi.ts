// Implementação da API que conversa com o backend ASP.NET (pasta backend/).
// Rotas usadas:
//   POST /api/auth/register · POST /api/auth/login
//   GET  /api/workspaces · POST /api/workspaces · GET /api/workspaces/{id} · GET /api/workspaces/{id}/members
//   GET  /api/invite-code?workspaceId= · POST /api/invite-code · DELETE /api/invite-code/{id}
//   POST /api/invite-code/join

import { ApiError, type ErrorCode } from './errors';
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

interface WorkspaceDto {
  id: number;
  name: string;
  description: string | null;
  subjectName: string;
  createdBy: string;
  memberCount: number;
  myRole: Role | null;
  createdAt: string;
}
interface MemberDto {
  userId: number;
  name: string;
  email: string;
  role: Role;
  isSubject: boolean;
  joinedAt: string;
}
interface InviteDto {
  id: number;
  workspaceId: number;
  code: string;
  expiresAt: string;
  createdAt: string;
}
interface AuthDto {
  token: string;
  expiresAt: string;
  user: { id: number; name: string; email: string; createdAt: string };
}

/** O backend grava datas em UTC sem o sufixo Z; sem ele o JS leria como hora local. */
const utc = (d: string) => (/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`);

const toWorkspace = (w: WorkspaceDto): WorkspaceSummary => ({
  id: String(w.id),
  name: w.name,
  description: w.description,
  subjectName: w.subjectName,
  createdBy: w.createdBy,
  memberCount: w.memberCount,
  createdAt: utc(w.createdAt),
  role: w.myRole ?? 'member',
});

const toInvite = (i: InviteDto): InviteCode => ({
  id: String(i.id),
  workspaceId: String(i.workspaceId),
  code: i.code,
  createdAt: utc(i.createdAt),
  expiresAt: utc(i.expiresAt),
});

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = globalThis.atob(b64);
  // Decodifica UTF-8 sem depender de TextDecoder (nem todo motor JS do Android tem).
  return decodeURIComponent(
    Array.from(binary, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
  );
}

/** Lê os dados do usuário das claims do JWT emitido pelo TokenService (sub, email, name, exp). */
function userFromToken(token: string): User {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) throw new Error('expired');
    return {
      id: String(payload.sub),
      name: payload.name ?? '',
      email: payload.email ?? '',
      createdAt: '',
      termsAcceptedAt: '',
    };
  } catch {
    throw new ApiError('UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');
  }
}

export function createHttpApi(baseUrl: string): EloApi {
  const base = baseUrl.replace(/\/+$/, '');

  async function call<T>(method: string, path: string, token?: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError('NETWORK', 'Sem conexão com o servidor. Verifique sua internet e tente novamente.');
    }
    if (res.ok) {
      const text = await res.text();
      return (text ? JSON.parse(text) : undefined) as T;
    }
    let payload: { error?: string; code?: string; title?: string } = {};
    try {
      payload = await res.json();
    } catch {
      /* corpo vazio */
    }
    const byStatus: Record<number, ErrorCode> = {
      400: 'VALIDATION',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'EMAIL_IN_USE',
      410: 'INVITE_EXPIRED',
      423: 'ACCOUNT_LOCKED',
    };
    const code = (payload.code as ErrorCode) ?? byStatus[res.status] ?? 'VALIDATION';
    const fallback =
      res.status === 401
        ? 'Sua sessão expirou. Entre novamente.'
        : res.status === 403
          ? 'Você não tem acesso a esta ação.'
          : res.status >= 500
            ? 'O servidor teve um problema. Tente novamente em instantes.'
            : 'Não foi possível concluir a operação.';
    throw new ApiError(code, payload.error ?? fallback);
  }

  const toSession = (r: AuthDto): Session => ({
    token: r.token,
    expiresAt: utc(r.expiresAt),
    user: {
      id: String(r.user.id),
      name: r.user.name,
      email: r.user.email,
      createdAt: utc(r.user.createdAt),
      termsAcceptedAt: '',
    },
  });

  return {
    mode: 'http',

    async register(input: RegisterInput) {
      try {
        const r = await call<AuthDto>('POST', '/api/auth/register', undefined, {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
          acceptedTerms: input.acceptedTerms,
        });
        return toSession(r);
      } catch (e) {
        if (e instanceof ApiError && e.code === 'EMAIL_IN_USE')
          throw new ApiError('EMAIL_IN_USE', e.message, { email: 'Este e-mail já está em uso. Faça login para continuar.' });
        if (e instanceof ApiError && e.code === 'VALIDATION') throw new ApiError('VALIDATION', e.message, { password: e.message });
        throw e;
      }
    },

    async login(email, password) {
      try {
        return toSession(await call<AuthDto>('POST', '/api/auth/login', undefined, { email: email.trim().toLowerCase(), password }));
      } catch (e) {
        if (e instanceof ApiError && e.code === 'UNAUTHORIZED')
          throw new ApiError('INVALID_CREDENTIALS', 'E-mail ou senha incorretos. Verifique os dados e tente novamente.');
        throw e;
      }
    },

    async logout() {
      // JWT é sem estado no servidor: basta descartar o token no aparelho.
    },

    async me(token) {
      return userFromToken(token);
    },

    async listWorkspaces(token) {
      const list = await call<WorkspaceDto[]>('GET', '/api/workspaces', token);
      return list.map(toWorkspace);
    },

    async createWorkspace(token, input: CreateWorkspaceInput) {
      const w = await call<WorkspaceDto>('POST', '/api/workspaces', token, {
        name: input.name.trim(),
        subjectName: input.subjectName.trim(),
        description: input.description?.trim() || null,
      });
      return toWorkspace({ ...w, myRole: w.myRole ?? 'admin' });
    },

    async getWorkspace(token, id) {
      const [w, members] = await Promise.all([
        call<WorkspaceDto>('GET', `/api/workspaces/${id}`, token),
        call<MemberDto[]>('GET', `/api/workspaces/${id}/members`, token),
      ]);
      const detail: WorkspaceDetail = {
        ...toWorkspace(w),
        members: members
          .filter((m) => !m.isSubject)
          .map<Member>((m) => ({
            userId: String(m.userId),
            name: m.name,
            email: m.email,
            role: m.role,
            joinedAt: utc(m.joinedAt),
          })),
      };
      return detail;
    },

    async listInvites(token, workspaceId) {
      const list = await call<InviteDto[]>('GET', `/api/invite-code?workspaceId=${encodeURIComponent(workspaceId)}`, token);
      return list.map(toInvite);
    },

    async createInvite(token, workspaceId) {
      return toInvite(await call<InviteDto>('POST', '/api/invite-code', token, { workspaceId: Number(workspaceId) }));
    },

    async deleteInvite(token, id) {
      await call<void>('DELETE', `/api/invite-code/${id}`, token);
    },

    async joinWithCode(token, code) {
      try {
        return toWorkspace(await call<WorkspaceDto>('POST', '/api/invite-code/join', token, { code }));
      } catch (e) {
        if (e instanceof ApiError && e.code === 'NOT_FOUND')
          throw new ApiError('INVITE_INVALID', 'Código inválido. Verifique o código e tente novamente.');
        if (e instanceof ApiError && e.code === 'EMAIL_IN_USE')
          throw new ApiError('ALREADY_MEMBER', 'Você já faz parte deste workspace.');
        throw e;
      }
    },
  };
}
