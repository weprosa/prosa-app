import { showToast } from '@/design-system';
import { ApiError, NetworkError } from '@/lib/api/client';

/**
 * Mensagem de erro ao salvar uma etapa. O 422 do back-end traz mensagens por campo
 * em português, que podem ser mostradas como vieram.
 */
export function onboardingErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'Não foi possível conectar. Confira sua internet e tente de novo.';
  }
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const message = Object.values(apiFieldErrors(error))[0];
      if (message) return message;
    }
    if (error.status === 429) {
      return 'Muitas tentativas seguidas. Espere um pouco e tente de novo.';
    }
    if (error.status >= 400 && error.status < 500) {
      return 'Alguns dados não foram aceitos. Confira e tente de novo.';
    }
  }
  return 'Algo deu errado do nosso lado. Tente de novo em instantes.';
}

/** Primeira mensagem de cada campo de um 422 da API; {} para qualquer outro erro. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.status !== 422) return {};

  return Object.fromEntries(
    Object.entries(error.fieldErrors).flatMap(([field, messages]) => {
      const message = messages.find(
        (value) => typeof value === 'string' && value.trim().length > 0,
      );
      return message === undefined ? [] : [[field, message]];
    }),
  );
}

/** O cliente de API já avisa e redireciona quando a sessão expira. */
export function showOnboardingError(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) return;
  showToast({ tone: 'error', title: onboardingErrorMessage(error) });
}
