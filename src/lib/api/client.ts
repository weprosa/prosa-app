import { env } from '@/lib/env';
import { getSessionToken } from '@/lib/session';

const TIMEOUT_MS = 15_000;

/** Erro de resposta da API. `fieldErrors` segue o formato de validação (422) do Laravel. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Sem rede, timeout, ou `EXPO_PUBLIC_API_URL` ausente. */
export class NetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super('Não foi possível conectar ao servidor.', options);
    this.name = 'NetworkError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}) {
  if (!env.apiUrl) throw new NetworkError();

  const token = await getSessionToken();
  const timeout = AbortSignal.timeout(TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (cause) {
    throw new NetworkError({ cause });
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? 'Algo deu errado. Tente de novo.',
      response.status,
      payload?.errors,
    );
  }

  return payload as T;
}
