import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, sizes, spacing } from '../tokens';
import { Text } from './text';

export type ToastTone = 'success' | 'error';
export type ToastInput = { title: string; message?: string; tone?: ToastTone };
type ToastItem = ToastInput & { id: number };

const DURATION_MS = 4000;
// No preview web a animação de entrada do Reanimated deixa o toast invisível; só nativo anima.
const animated = Platform.OS !== 'web';
// Store em módulo: guarda o toast atual, então um aviso disparado antes de o
// ToastHost montar (ex.: no primeiro efeito de uma tela) não se perde.
const listeners = new Set<() => void>();
let current: ToastItem | null = null;
let nextId = 0;

function setCurrent(toast: ToastItem | null) {
  current = toast;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Mostra um aviso passageiro no topo da tela. Precisa de `<ToastHost />` na raiz. */
export function showToast(toast: ToastInput) {
  setCurrent({ ...toast, id: ++nextId });
}

const TONES = {
  success: { icon: 'checkmark-circle', color: 'success', background: colors.successBackground },
  error: { icon: 'alert-circle', color: 'danger', background: colors.dangerBackground },
} as const;

/** Monte uma vez, na raiz do app, depois das telas. */
export function ToastHost() {
  const toast = useSyncExternalStore(subscribe, () => current);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setCurrent(null), DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;
  const tone = TONES[toast.tone ?? 'success'];

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + spacing.xs }]}>
      <Animated.View
        key={toast.id}
        entering={animated ? SlideInUp : undefined}
        exiting={animated ? FadeOutUp : undefined}
        style={styles.wrap}
      >
        <Pressable
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityHint="Toque para fechar"
          onPress={() => setCurrent(null)}
          style={[styles.toast, { backgroundColor: tone.background }]}
        >
          <Ionicons name={tone.icon} size={22} color={colors[tone.color]} />
          <View style={styles.texts}>
            <Text variant="label" color={tone.color}>
              {toast.title}
            </Text>
            {toast.message ? (
              <Text variant="bodySmall" color={tone.color}>
                {toast.message}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Acima das telas do Stack (web e Android desenham por ordem e elevação).
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  wrap: { width: '100%', maxWidth: sizes.contentMaxWidth, paddingHorizontal: spacing.md },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.field,
    boxShadow: '0 6px 20px rgba(26, 26, 26, 0.12)',
  },
  texts: { flex: 1, gap: spacing.xxs },
});
