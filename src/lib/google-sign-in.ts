import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { env } from '@/lib/env';

let configured = false;

export class GoogleSignInError extends Error {
  constructor(
    readonly reason: 'unavailable' | 'play_services' | 'not_configured' | 'failed',
    options?: ErrorOptions,
  ) {
    super('Não foi possível entrar com Google.', options);
    this.name = 'GoogleSignInError';
  }
}

/** Obtém a credencial do Google; cancelar não é erro nem abre uma sessão do Prosa. */
export async function getGoogleIdToken(): Promise<string | null> {
  if (
    Platform.OS === 'web' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ) {
    throw new GoogleSignInError('unavailable');
  }

  const webClientId = env.googleWebClientId?.trim();
  if (!webClientId) throw new GoogleSignInError('not_configured');

  // O módulo nativo só pode ser carregado depois das verificações de ambiente.
  const { GoogleSignin, statusCodes } =
    await import('@react-native-google-signin/google-signin').catch((cause: unknown) => {
      throw new GoogleSignInError('failed', { cause });
    });

  try {
    if (!configured) {
      GoogleSignin.configure({ webClientId });
      configured = true;
    }

    const available = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    if (!available) throw new GoogleSignInError('play_services');

    // Limpa a conta anterior antes de entrar para sempre mostrar o seletor de contas.
    await GoogleSignin.signOut();
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') return null;
    if (!response.data.idToken) throw new GoogleSignInError('failed');
    return response.data.idToken;
  } catch (cause) {
    if (cause instanceof GoogleSignInError) throw cause;
    if (typeof cause === 'object' && cause !== null && 'code' in cause) {
      switch (cause.code) {
        case statusCodes.SIGN_IN_CANCELLED:
        case statusCodes.IN_PROGRESS:
          return null;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new GoogleSignInError('play_services', { cause });
        // DEVELOPER_ERROR no Android é o código 10, sem constante em statusCodes.
        case '10':
        case 10:
          if (__DEV__) {
            console.warn(
              'Login com Google: confira o package com.weprosa.app, o SHA-1 da assinatura ' +
                'do build e o client Android no mesmo projeto do client Web no Google Cloud.',
            );
          }
          throw new GoogleSignInError('not_configured', { cause });
      }
    }
    throw new GoogleSignInError('failed', { cause });
  }
}
