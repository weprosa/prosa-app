// O CEP digitado vai ao serviço externo ViaCEP; nada mais é enviado.

export type CepAddress = {
  cep: string;
  street: string;
  city: string;
  state: string;
};

export type CepLookupResult =
  | { status: 'found'; address: CepAddress }
  | { status: 'invalid' }
  | { status: 'not_found' }
  | { status: 'unavailable' };

export function cepDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

export function formatCep(value: string): string {
  const digits = cepDigits(value);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function isCompleteCep(value: string): boolean {
  return value.replace(/\D/g, '').length === 8;
}

export async function lookupCep(
  value: string,
  options?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<CepLookupResult> {
  if (!isCompleteCep(value)) {
    return { status: 'invalid' };
  }

  const digits = cepDigits(value);
  const controller = new AbortController();
  const signal = options?.signal;
  const onAbort = () => controller.abort();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    if (signal?.aborted) {
      return { status: 'unavailable' };
    }

    signal?.addEventListener('abort', onAbort);
    timer = setTimeout(onAbort, options?.timeoutMs ?? 8000);

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    });

    if (response.status !== 200) {
      return { status: 'unavailable' };
    }

    const data: unknown = await response.json();

    if (controller.signal.aborted) {
      return { status: 'unavailable' };
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { status: 'unavailable' };
    }

    if ('erro' in data && (data.erro === true || data.erro === 'true')) {
      return { status: 'not_found' };
    }

    if (
      !('logradouro' in data) ||
      typeof data.logradouro !== 'string' ||
      !('localidade' in data) ||
      typeof data.localidade !== 'string' ||
      data.localidade.trim().length === 0 ||
      !('uf' in data) ||
      typeof data.uf !== 'string' ||
      data.uf.trim().length === 0
    ) {
      return { status: 'unavailable' };
    }

    return {
      status: 'found',
      address: {
        cep: formatCep(digits),
        street: data.logradouro.trim(),
        city: data.localidade,
        state: data.uf.toUpperCase(),
      },
    };
  } catch {
    return { status: 'unavailable' };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
