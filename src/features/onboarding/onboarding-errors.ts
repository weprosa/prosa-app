import { showToast } from '@/design-system';
import { ApiError, NetworkError } from '@/lib/api/client';

/**
 * Mensagem de erro ao salvar uma etapa. As telas validam antes no cliente; o 422 do
 * back-end traz mensagens em inglês, então não é mostrado como veio (ADR 0008).
 */
export function onboardingErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'Não foi possível conectar. Confira sua internet e tente de novo.';
  }
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Muitas tentativas seguidas. Espere um pouco e tente de novo.';
    }
    if (error.status >= 400 && error.status < 500) {
      return 'Alguns dados não foram aceitos. Confira e tente de novo.';
    }
  }
  return 'Algo deu errado do nosso lado. Tente de novo em instantes.';
}

/** O cliente de API já avisa e redireciona quando a sessão expira. */
export function showOnboardingError(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) return;
  showToast({ tone: 'error', title: onboardingErrorMessage(error) });
}
