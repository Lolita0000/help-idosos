// Validações executadas no cliente antes de qualquer requisição.
// As mesmas regras são reaplicadas na camada de dados (o cliente nunca é a única barreira).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_HINT =
  'Mínimo de 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.';

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Mesmas regras de PasswordHasher.IsStrong no backend. */
export function passwordError(password: string): string | null {
  if (!password || password.length < 8) return 'A senha deve conter no mínimo 8 caracteres.';
  if (!/[A-ZÀ-Ý]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.';
  if (!/[a-zß-ÿ]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.';
  if (!/\d/.test(password)) return 'A senha deve conter pelo menos um número.';
  if (/^[\p{L}\p{N}]+$/u.test(password))
    return 'A senha deve conter pelo menos um caractere especial (ex: @, $, !, %, *, ?, &).';
  return null;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm: string;
  acceptedTerms: boolean;
}

/** HU-02, cenários 2, 4 e 5. */
export function validateRegister(f: RegisterForm): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'Informe seu nome completo.';
  if (!f.email.trim()) e.email = 'Informe seu e-mail.';
  else if (!isValidEmail(f.email)) e.email = 'Este endereço de e-mail é inválido.';
  const pw = passwordError(f.password);
  if (pw) e.password = pw;
  if (!f.confirm) e.confirm = 'Confirme sua senha.';
  else if (f.password !== f.confirm) e.confirm = 'As senhas não coincidem.';
  if (!f.acceptedTerms)
    e.terms = 'É obrigatório aceitar os Termos de Serviço e a Política de Privacidade.';
  return e;
}

/** HU-13, cenário 3. */
export function validateLogin(email: string, password: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!email.trim()) e.email = 'Informe seu e-mail.';
  if (!password) e.password = 'Informe sua senha.';
  return e;
}

/** HU-01, cenário 3. */
export function validateWorkspace(name: string, subjectName: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!name.trim()) e.name = 'Informe o nome do espaço.';
  if (!subjectName.trim()) e.subjectName = 'O nome do sujeito acompanhado é obrigatório.';
  return e;
}

/** Normaliza o código digitado: aceita com ou sem hífen e em minúsculas. */
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
