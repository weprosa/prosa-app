import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ComponentProps, type Ref } from 'react';
import {
  ActivityIndicator,
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
  /** Torna o ícone um botão; sem esta prop, ele continua decorativo. */
  iconAction?: {
    onPress: () => void;
    accessibilityLabel: string;
    disabled?: boolean;
    busy?: boolean;
  };
};

/** Tipo do `ref` de um TextField (para `.focus()` no campo seguinte). */
export type TextFieldRef = TextInputInstance;

export function TextField({
  label,
  error,
  icon,
  iconAction,
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
        {icon && !iconAction ? (
          <Ionicons
            name={icon}
            size={sizes.fieldIcon}
            color={colors.text}
            style={styles.icon}
            accessible={false}
            importantForAccessibility="no"
          />
        ) : null}
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
            !!icon && !!iconAction && styles.inputWithIconAction,
            isPassword && styles.inputWithToggle,
            focused && styles.inputFocused,
            !!error && styles.inputError,
          ]}
        />
        {icon && iconAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={iconAction.accessibilityLabel}
            accessibilityState={{
              disabled: !!iconAction.disabled || !!iconAction.busy,
              busy: !!iconAction.busy,
            }}
            disabled={iconAction.disabled || iconAction.busy}
            onPress={iconAction.onPress}
            style={({ pressed }) => [styles.iconAction, pressed && styles.iconActionPressed]}
          >
            {iconAction.busy ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Ionicons
                name={icon}
                size={sizes.fieldIcon}
                color={iconAction.disabled ? colors.textSecondary : colors.text}
                accessible={false}
                importantForAccessibility="no"
              />
            )}
          </Pressable>
        ) : null}
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
  inputWithIconAction: { paddingLeft: sizes.touchTarget },
  iconAction: {
    position: 'absolute',
    left: 0,
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radii.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionPressed: { backgroundColor: colors.backgroundPressed },
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
