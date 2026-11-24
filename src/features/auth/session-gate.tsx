import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api/client';
import { clearSession, getSession, isExpired } from '@/lib/session';

import type { User } from './auth-service';
import { WelcomeScreen } from './welcome-screen';

type SessionStatus = 'checking' | 'welcome' | 'authenticated';
type UserResponse = { user: User };

export function SessionGate() {
  const [status, setStatus] = useState<SessionStatus>('checking');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function checkSession() {
      try {
        const session = await getSession();
        if (!active) return;

        if (!session) {
          setStatus('welcome');
          return;
        }

        if (isExpired(session)) {
          await clearSession();
          if (active) setStatus('welcome');
          return;
        }

        await api<UserResponse>('/v1/auth/user', { signal: controller.signal });
        if (active) setStatus('authenticated');
      } catch {
        // Falhas de rede preservam a sessão; a API cuida da limpeza em um 401.
        if (active) setStatus('welcome');
      }
    }

    void checkSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (status === 'welcome') void SplashScreen.hideAsync();
    // No sucesso, o layout esconde o splash quando a rota de destino montar.
    if (status === 'authenticated') router.replace('/onboarding');
  }, [status]);

  return status === 'welcome' ? <WelcomeScreen /> : null;
}
