// Implementação da API que conversa com o backend ASP.NET (pasta backend/).
//
// Rotas já existentes no backend: POST /api/auth/register, POST /api/auth/login,
// POST /api/workspaces, POST /api/invite-code, DELETE /api/invite-code/{id}.
// Rotas marcadas com "PENDENTE" ainda precisam ser criadas no backend para a v0.1
// funcionar de ponta a ponta contra o servidor; o contrato esperado está descrito aqui.

import { ApiError, type ErrorCode } from './errors';
import type {
  CreateWorkspaceInput,
  EloApi,
  InviteCode,
  RegisterInput,
  Session,
  User,
  WorkspaceDetail,
  WorkspaceSummary,
} from './types';

export function createHttpApi(baseUrl: string): EloApi {
  const base = baseUrl.replace(/\/+$/, '');

  async function call<T>(method: string, path: string, token?: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError('NETWORK', 'Sem conexão com o servidor. Verifique sua internet.');
    }
    if (res.ok) {
      const text = await res.text();
      return (text ? JSON.parse(text) : undefined) as T;
    }
    let payload: { error?: string; code?: string } = {};
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
    throw new ApiError(code, payload.error ?? 'Não foi possível concluir a operação.');
  }

  const toSession = (r: { token: string; expiresAt: string; user: User }): Session => ({
    token: r.token,
    expiresAt: r.expiresAt,
    user: { ...r.user, id: String(r.user.id) },
  });

  return {
    mode: 'http',
    async register(input: RegisterInput) {
      const r = await call<{ token: string; expiresAt: string; user: User }>(
        'POST',
        '/api/auth/register',
        undefined,
        { name: input.name, email: input.email, password: input.password, acceptedTerms: input.acceptedTerms },
      );
      return toSession(r);
    },
    async login(email, password) {
      try {
        return toSession(await call('POST', '/api/auth/login', undefined, { email, password }));
      } catch (e) {
        if (e instanceof ApiError && e.code === 'UNAUTHORIZED')
          throw new ApiError('INVALID_CREDENTIALS', 'E-mail ou senha incorretos. Verifique os dados e tente novamente.');
        throw e;
      }
    },
    async logout() {
      // JWT é sem estado no servidor: basta descartar o token no cliente.
    },
    // PENDENTE no backend: GET /api/auth/me → UserResponse
    me: (token) => call<User>('GET', '/api/auth/me', token),
    // PENDENTE no backend: GET /api/workspaces/mine → WorkspaceSummary[] (com o papel do usuário)
    listWorkspaces: (token) => call<WorkspaceSummary[]>('GET', '/api/workspaces/mine', token),
    async createWorkspace(token, input: CreateWorkspaceInput) {
      const r = await call<Omit<WorkspaceSummary, 'role'>>('POST', '/api/workspaces', token, input);
      return { ...r, id: String(r.id), role: 'admin' };
    },
    // PENDENTE no backend: GET /api/workspaces/{id}/members incluído no detalhe
    getWorkspace: (token, id) => call<WorkspaceDetail>('GET', `/api/workspaces/${id}/detail`, token),
    // PENDENTE no backend: GET /api/invite-code?workspaceId={id}
    listInvites: (token, id) =>
      call<InviteCode[]>('GET', `/api/invite-code?workspaceId=${encodeURIComponent(id)}`, token),
    createInvite: (token, workspaceId) =>
      call<InviteCode>('POST', '/api/invite-code', token, { workspaceId: Number(workspaceId) }),
    deleteInvite: (token, id) => call<void>('DELETE', `/api/invite-code/${id}`, token),
    // PENDENTE no backend: POST /api/invite-code/join { code } → WorkspaceSummary
    // (404 código inexistente, 410 expirado, 409 já é membro)
    async joinWithCode(token, code) {
      try {
        return await call<WorkspaceSummary>('POST', '/api/invite-code/join', token, { code });
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
