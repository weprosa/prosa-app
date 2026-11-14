import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ComponentProps, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { colors, MAX_FONT_SCALE, radii, sizes, spacing, typography } from '../tokens';
import { Text } from './text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  /** Mensagem de erro do campo. Diz o problema e como resolver. */
  error?: string;
  ref?: Ref<TextFieldRef>;
  /** Ícone decorativo à esquerda do texto. */
  icon?: ComponentProps<typeof Ionicons>['name'];
};

/** Tipo do `ref` de um TextField (para `.focus()` no campo seguinte). */
export type TextFieldRef = TextInputInstance;

export function TextField({
  label,
  error,
  icon,
  secureTextEntry,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  // Campo de senha ganha o botão de mostrar/ocultar à direita.
  const isPassword = !!secureTextEntry;
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon} size={20} color={colors.text} style={styles.icon} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          placeholderTextColor={colors.textPlaceholder}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          {...rest}
          secureTextEntry={isPassword && !revealed}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            !!icon && styles.inputWithIcon,
            isPassword && styles.inputWithToggle,
            focused && styles.inputFocused,
            !!error && styles.inputError,
          ]}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setRevealed((value) => !value)}
            hitSlop={spacing.xxs}
            style={styles.toggle}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    minHeight: sizes.field,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  inputWrap: { justifyContent: 'center' },
  icon: { position: 'absolute', left: spacing.md, zIndex: 1 },
  // Ícone (20) + respiro (8) depois da margem interna.
  inputWithIcon: { paddingLeft: spacing.md + 28 },
  // Botão com alvo de toque de 48, encostado na borda direita do campo.
  toggle: {
    position: 'absolute',
    right: 0,
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWithToggle: { paddingRight: sizes.touchTarget },
  inputFocused: { borderColor: colors.borderFocused },
  inputError: { borderColor: colors.danger },
});
