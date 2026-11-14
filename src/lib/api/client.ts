import { env } from '@/lib/env';
import { clearSession, getSession, isExpired, saveSession } from '@/lib/session';

const TIMEOUT_MS = 15_000;
const REFRESH_WINDOW_MS = 5 * 60 * 1000;
const sessionExpiredListeners = new Set<() => void>();
let refreshPromise: Promise<boolean> | null = null;

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
  auth?: boolean;
};

export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

async function expireSession(): Promise<never> {
  try {
    await clearSession();
  } finally {
    for (const listener of sessionExpiredListeners) {
      try {
        listener();
      } catch {
        // Um ouvinte não deve impedir os demais de receber o aviso.
      }
    }
    throw new ApiError('Sua sessão expirou. Entre de novo.', 401);
  }
}

async function performRefresh(): Promise<boolean> {
  try {
    if (!env.apiUrl) return false;
    const session = await getSession();
    if (!session || isExpired(session)) return false;

    const response = await fetch(`${env.apiUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return false;

    const payload: unknown = await response.json();
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('token' in payload) ||
      typeof payload.token !== 'object' ||
      payload.token === null
    ) {
      return false;
    }
    const token = payload.token;
    if (
      !('access_token' in token) ||
      typeof token.access_token !== 'string' ||
      !token.access_token ||
      !('token_type' in token) ||
      token.token_type !== 'Bearer' ||
      !('expires_in' in token) ||
      typeof token.expires_in !== 'number' ||
      !Number.isFinite(token.expires_in) ||
      token.expires_in <= 0
    ) {
      return false;
    }

    await saveSession(token.access_token, token.expires_in);
    return true;
  } catch {
    return false;
  }
}

export async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function api<T>(
  path: string,
  { method = 'GET', body, signal, auth = true }: RequestOptions = {},
) {
  if (!env.apiUrl) throw new NetworkError();

  let session = auth ? await getSession() : null;
  if (session) {
    if (isExpired(session)) return expireSession();
    if (session.expiresAt - Date.now() < REFRESH_WINDOW_MS) {
      if (!(await refreshSession())) return expireSession();
      session = await getSession();
      if (!session || isExpired(session)) return expireSession();
    }
  }

  const request = async (token?: string): Promise<Response> => {
    const timeout = AbortSignal.timeout(TIMEOUT_MS);
    try {
      return await fetch(`${env.apiUrl}${path}`, {
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
  };

  let response = await request(session?.token);
  if (response.status === 401 && session) {
    // Outra chamada pode já ter renovado o token enquanto esta estava em voo: nesse
    // caso, só repete com o token novo, sem renovar de novo (o anterior morre na hora).
    const latest = await getSession();
    const alreadyRefreshed = !!latest && latest.token !== session.token;
    if (!alreadyRefreshed && !(await refreshSession())) return expireSession();
    const refreshedSession = alreadyRefreshed ? latest : await getSession();
    if (!refreshedSession || isExpired(refreshedSession)) return expireSession();
    response = await request(refreshedSession.token);
    if (response.status === 401) return expireSession();
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
