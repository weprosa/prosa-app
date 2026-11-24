import { ApiError } from '@/lib/api/client';

/** Primeiro erro de cada campo, vindo da validação (422) do Laravel. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0]]),
  );
}
