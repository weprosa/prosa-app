import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { sizes, spacing } from '../tokens';
import { Text } from './text';

export type TextButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** `muted`: ação discreta em texto de apoio. */
  tone?: 'default' | 'muted';
};

/** Botão de texto sem sublinhado, com alvo de toque mínimo de 48. */
export function TextButton({ label, tone = 'default', ...rest }: TextButtonProps) {
  const muted = tone === 'muted';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={spacing.xs}
      {...rest}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <Text variant={muted ? 'bodySmall' : 'label'} color={muted ? 'textSecondary' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  pressed: { opacity: 0.6 },
});
