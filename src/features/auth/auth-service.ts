import { api, ApiError, NetworkError } from '@/lib/api/client';
import { saveSessionToken } from '@/lib/session';

// Contrato PROPOSTO: o back-end Laravel ainda não existe. Rotas e formato da
// resposta precisam ser confirmados com o responsável (docs/adr/0008).
type AuthResponse = { token: string };

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string };

export async function signIn(input: SignInInput) {
  const { token } = await api<AuthResponse>('/auth/login', { method: 'POST', body: input });
  await saveSessionToken(token);
}

export async function signUp(input: SignUpInput) {
  const { token } = await api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { ...input, password_confirmation: input.password },
  });
  await saveSessionToken(token);
}

/** Mensagem para o topo do formulário quando o erro não pertence a um campo. */
export function authErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status < 500) return error.message;
  if (error instanceof NetworkError) {
    return 'Não foi possível conectar. Confira sua internet e tente de novo.';
  }
  return 'Algo deu errado do nosso lado. Tente de novo em instantes.';
}

/** Primeiro erro de cada campo, vindo da validação (422) do Laravel. */
export function authFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0]]),
  );
}
