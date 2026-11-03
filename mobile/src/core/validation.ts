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

export const ENTRY_TITLE_MAX = 120;
export const ENTRY_DESCRIPTION_MAX = 2000;

/** HU-04 (RF05): título, categoria e descrição são obrigatórios. */
export function validateEntry(f: { title: string; category: string | null; description: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = 'Informe um título para a entrada.';
  else if (f.title.trim().length > ENTRY_TITLE_MAX) e.title = `O título pode ter até ${ENTRY_TITLE_MAX} caracteres.`;
  if (!f.category) e.category = 'Escolha uma categoria.';
  if (!f.description.trim()) e.description = 'Descreva o que aconteceu.';
  else if (f.description.trim().length > ENTRY_DESCRIPTION_MAX)
    e.description = `A descrição pode ter até ${ENTRY_DESCRIPTION_MAX} caracteres.`;
  return e;
}

/** Normaliza o código digitado: aceita com ou sem hífen e em minúsculas. */
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Mantém só dígitos e aplica a máscara (61) 99999-0000 enquanto a pessoa digita. */
export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const area = `(${d.slice(0, 2)}) `;
  const rest = d.slice(2);
  return rest.length <= 4 ? area + rest : area + rest.slice(0, rest.length - 4) + '-' + rest.slice(-4);
}

/** Aplica a máscara DD/MM/AAAA enquanto a pessoa digita. */
export function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** AAAA-MM-DD → DD/MM/AAAA. Vazio fica vazio. */
export function isoToDisplay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** DD/MM/AAAA → AAAA-MM-DD, ou null se a data não existir no calendário. */
export function displayToIso(display: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const real = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return real ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Mesmas regras do servidor (ProfileRules): telefone com DDD, nascimento válido e não futuro. */
export function validateProfile(f: { name: string; phone: string; birthDate: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'Informe seu nome completo.';
  const digits = f.phone.replace(/\D/g, '');
  if (digits && (![10, 11].includes(digits.length) || digits.startsWith('0')))
    e.phone = 'Informe o telefone com DDD, por exemplo (61) 99999-0000.';
  if (f.birthDate) {
    const iso = displayToIso(f.birthDate);
    if (!iso) e.birthDate = 'Informe uma data válida, no formato DD/MM/AAAA.';
    else if (iso > new Date().toISOString().slice(0, 10)) e.birthDate = 'A data de nascimento não pode estar no futuro.';
    else if (iso < '1900-01-01') e.birthDate = 'Informe uma data de nascimento válida.';
  }
  return e;
}
