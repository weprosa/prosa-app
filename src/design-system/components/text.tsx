import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, MAX_FONT_SCALE, typography, type ColorToken, type TextVariant } from '../tokens';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

/** Único ponto de entrada de texto do app. Não importe `Text` de `react-native` em telas. */
export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, style]}
    />
  );
}
