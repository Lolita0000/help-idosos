export type ErrorCode =
  | 'VALIDATION'
  | 'EMAIL_IN_USE'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVITE_INVALID'
  | 'INVITE_EXPIRED'
  | 'ALREADY_MEMBER'
  | 'NETWORK';

/** Erro de negócio com código estável, para a tela decidir onde exibir a mensagem. */
export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    /** Erros por campo, quando a falha é de validação. */
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function messageOf(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}
