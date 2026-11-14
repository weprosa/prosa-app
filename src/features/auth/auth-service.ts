import { api, ApiError, NetworkError } from '@/lib/api/client';
import { saveSession } from '@/lib/session';

// Contrato confirmado pela doc OpenAPI do back-end (Prosa API 0.0.1). Ver docs/adr/0008.
export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string | null;
};

type AuthResponse = {
  user: User;
  token: { access_token: string | false; token_type: 'Bearer'; expires_in: number };
};

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string };

async function startSession({ user, token }: AuthResponse) {
  if (!token.access_token) throw new Error('Token ausente na resposta de autenticação.');
  await saveSession(token.access_token, token.expires_in);
  return user;
}

export async function signIn(input: SignInInput) {
  return startSession(
    await api<AuthResponse>('/v1/auth/login', { method: 'POST', body: input, auth: false }),
  );
}

/** Cria a conta. Não abre sessão: a pessoa é levada para entrar com a conta nova. */
export async function signUp(input: SignUpInput) {
  const { user } = await api<AuthResponse>('/v1/auth/register', {
    method: 'POST',
    body: { ...input, password_confirmation: input.password },
    auth: false,
  });
  return user;
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
