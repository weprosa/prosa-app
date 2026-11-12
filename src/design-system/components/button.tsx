import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, radii, sizes, spacing } from '../tokens';
import { Text } from './text';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** `primary`: a ação principal da tela (uma por tela). `secondary`: alternativas. */
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  ...rest
}: ButtonProps) {
  const inactive = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.textOnPrimary : colors.text} />
      ) : (
        <Text
          variant={isPrimary ? 'button' : 'buttonSecondary'}
          color={isPrimary ? 'textOnPrimary' : 'text'}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.button,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryPressed: { backgroundColor: colors.backgroundPressed },
  disabled: { opacity: 0.45 },
});
