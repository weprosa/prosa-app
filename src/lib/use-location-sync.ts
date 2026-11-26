import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncLocation } from '@/lib/location-sync';

/** Atualiza a localização ao abrir ou retomar o app, sem pedir permissão. */
export function useLocationSyncOnForeground(): void {
  useEffect(() => {
    // Só a volta do segundo plano conta: no iOS, o próprio diálogo de permissão e a
    // Central de Controle deixam o app `inactive` por um instante, sem sair dele.
    let wentToBackground = false;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') wentToBackground = true;
      if (nextState === 'active' && wentToBackground) {
        wentToBackground = false;
        void syncLocation({ prompt: false });
      }
    });

    void syncLocation({ prompt: false });
    return () => subscription.remove();
  }, []);
}
