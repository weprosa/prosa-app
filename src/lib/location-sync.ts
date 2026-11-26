/** Sincronização pontual de localização, com consentimento e deduplicação em memória. */
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { api } from '@/lib/api/client';
import { readRoundedCoordinates } from '@/lib/location';
import { ensureLocationPermission, type PermissionResult } from '@/lib/permissions';
import { getSession, isExpired } from '@/lib/session';

/** Contrato proposto (docs/adr/0014): desligado até o back-end publicar `PUT /v1/me/location`. */
export const LOCATION_API_ENABLED = false;

export type LocationSyncStatus =
  /** Posição lida e enviada (ou simulada, com a chave desligada). */
  | 'sent'
  /** Mesma posição (2 casas) enviada há pouco: nada a fazer. */
  | 'unchanged'
  /** Sem sessão válida: nada a enviar. */
  | 'no-session'
  /** O servidor ainda não marcou o onboarding como concluído: nada a enviar. */
  | 'onboarding-incomplete'
  | 'denied'
  | 'blocked'
  /** Sem GPS, timeout ou serviço de localização desligado. */
  | 'unavailable'
  /** Erro de rede ou da API ao enviar. */
  | 'failed';

export type LocationSyncResult =
  | { status: 'sent'; latitude: number; longitude: number }
  | { status: Exclude<LocationSyncStatus, 'sent'> };

export type LocationSyncOptions = {
  /**
   * true só quando a tela acabou de explicar o motivo (fim do onboarding).
   * false (abertura do app, volta do segundo plano): nunca mostra o diálogo do sistema.
   */
  prompt: boolean;
  /** Ignora o intervalo mínimo entre envios. */
  force?: boolean;
  signal?: AbortSignal;
};

type OnboardingStatusResponse = { user: { onboarding_completed?: boolean } };

const SYNC_INTERVAL_MS = 10 * 60 * 1000;
const PERMISSION_TIMEOUT_MS = 15_000;

let lastSent: { latitude: number; longitude: number; sentAt: number } | null = null;
let inFlight: Promise<LocationSyncResult> | null = null;
/** `onboarding_completed` só volta a false trocando de conta, então guardamos o true. */
let onboardingCompleted = false;
/** Se a operação em andamento pode mostrar o diálogo de permissão. */
let inFlightPrompts = false;
let generation = 0;

/** Limpa a deduplicação e invalida operações pendentes ao encerrar ou trocar a sessão. */
export function resetLocationSync(): void {
  lastSent = null;
  onboardingCompleted = false;
  inFlight = null;
  generation += 1;
}

async function readPermission(prompt: boolean): Promise<PermissionResult> {
  if (prompt) return ensureLocationPermission();

  const permission = await Location.getForegroundPermissionsAsync();
  if (permission.granted) return 'granted';
  return permission.canAskAgain ? 'denied' : 'blocked';
}

async function checkPermission(prompt: boolean): Promise<PermissionResult> {
  if (Platform.OS !== 'web') return readPermission(prompt);

  // Na web, o pedido de permissão pode ficar esperando uma posição do navegador.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      readPermission(prompt),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Tempo de localização esgotado.')),
          PERMISSION_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function performSync(
  { prompt, force = false, signal }: LocationSyncOptions,
  currentGeneration: number,
): Promise<LocationSyncResult> {
  try {
    const session = await getSession();
    if (currentGeneration !== generation) return { status: 'no-session' };
    if (!session || isExpired(session)) {
      resetLocationSync();
      return { status: 'no-session' };
    }
    if (signal?.aborted) return { status: 'failed' };

    // A posição só interessa depois do onboarding (o servidor marca ao salvar o estilo de
    // vida). Antes disso, nem pedimos permissão nem lemos o GPS.
    if (!onboardingCompleted) {
      try {
        const { user } = await api<OnboardingStatusResponse>('/v1/me/onboarding', { signal });
        if (currentGeneration !== generation) return { status: 'no-session' };
        if (user.onboarding_completed !== true) return { status: 'onboarding-incomplete' };
        onboardingCompleted = true;
      } catch {
        return { status: 'failed' };
      }
    }

    const permission = await checkPermission(prompt);
    if (currentGeneration !== generation) return { status: 'no-session' };
    if (permission !== 'granted') return { status: permission };
    if (signal?.aborted) return { status: 'failed' };

    const coordinates = await readRoundedCoordinates();
    if (currentGeneration !== generation) return { status: 'no-session' };
    if (signal?.aborted) return { status: 'failed' };

    if (
      !force &&
      lastSent &&
      coordinates.latitude === lastSent.latitude &&
      coordinates.longitude === lastSent.longitude &&
      Date.now() - lastSent.sentAt < SYNC_INTERVAL_MS
    ) {
      return { status: 'unchanged' };
    }

    try {
      if (LOCATION_API_ENABLED) {
        await api<unknown>('/v1/me/location', {
          method: 'PUT',
          body: coordinates,
          signal,
        });
      }
      if (currentGeneration !== generation) return { status: 'no-session' };
      if (signal?.aborted) return { status: 'failed' };

      lastSent = { ...coordinates, sentAt: Date.now() };
      return { status: 'sent', ...coordinates };
    } catch {
      return { status: 'failed' };
    }
  } catch {
    return { status: signal?.aborted ? 'failed' : 'unavailable' };
  }
}

/**
 * Lê a posição atual e envia ao back-end. Nunca lança erro; chamadas simultâneas se juntam.
 * Um pedido com `prompt` não herda o resultado de um envio silencioso em andamento (que nunca
 * mostra o diálogo): espera ele terminar e roda o seu.
 */
export function syncLocation(options: LocationSyncOptions): Promise<LocationSyncResult> {
  if (inFlight && (inFlightPrompts || !options.prompt)) return inFlight;

  const currentGeneration = generation;
  const operation = (inFlight ?? Promise.resolve())
    .then(() => performSync(options, currentGeneration))
    .finally(() => {
      // Uma operação invalidada não pode apagar a promessa de uma sessão nova.
      if (inFlight === operation) inFlight = null;
    });
  inFlight = operation;
  inFlightPrompts = options.prompt;
  return operation;
}
