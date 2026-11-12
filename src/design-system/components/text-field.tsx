import { useState, type Ref } from 'react';
import {
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
};

/** Tipo do `ref` de um TextField (para `.focus()` no campo seguinte). */
export type TextFieldRef = TextInputInstance;

export function TextField({ label, error, onFocus, onBlur, ref, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        {...rest}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError]}
      />
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
  inputFocused: { borderColor: colors.borderFocused },
  inputError: { borderColor: colors.danger },
});
