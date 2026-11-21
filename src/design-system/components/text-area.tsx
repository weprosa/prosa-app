import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, MAX_FONT_SCALE, radii, sizes, spacing, typography } from '../tokens';
import { Text } from './text';
import type { TextFieldRef } from './text-field';

export type TextAreaProps = Omit<TextInputProps, 'style' | 'placeholderTextColor' | 'multiline'> & {
  /** Obrigatório, mesmo quando o título da tela faz o papel de rótulo visível. */
  accessibilityLabel: string;
  label?: string;
  hint?: string;
  /** Mensagem de erro do campo. Substitui o texto de apoio. */
  error?: string;
  /** Ocupa a altura livre no contêiner. */
  fill?: boolean;
  ref?: Ref<TextFieldRef>;
};

/** Campo para respostas com várias linhas, com rótulo visível opcional. */
export function TextArea({
  label,
  hint,
  error,
  fill = false,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextAreaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, fill && styles.fill]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        ref={ref}
        accessibilityHint={error || hint}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        {...rest}
        multiline
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
          fill && styles.fill,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      />
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="bodySmall" color="textSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  fill: { flex: 1 },
  input: {
    minHeight: sizes.textArea,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    textAlignVertical: 'top',
  },
  inputFocused: { borderColor: colors.borderFocused },
  inputError: { borderColor: colors.danger },
});
