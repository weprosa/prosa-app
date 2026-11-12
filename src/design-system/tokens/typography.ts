import type { TextStyle } from 'react-native';

/**
 * Famílias carregadas em `src/app/_layout.tsx`. Cada peso/estilo é um arquivo de
 * fonte próprio: nunca use `fontWeight` ou `fontStyle` com estas famílias, porque o
 * Android sintetiza um negrito/itálico falso em vez de usar o arquivo certo.
 */
export const fontFamily = {
  serif: 'PlayfairDisplay_400Regular',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  sans: 'Inter_400Regular',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

/** Playfair para voz e títulos; Inter para tudo que se lê ou se toca. */
export const typography = {
  display: { fontFamily: fontFamily.serif, fontSize: 44, lineHeight: 52, letterSpacing: -0.5 },
  displayItalic: {
    fontFamily: fontFamily.serifItalic,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 42, letterSpacing: -0.25 },
  wordmark: { fontFamily: fontFamily.serifSemiBold, fontSize: 30, lineHeight: 36 },
  body: { fontFamily: fontFamily.sans, fontSize: 17, lineHeight: 26 },
  bodySmall: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, lineHeight: 20 },
  link: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, lineHeight: 22 },
  button: { fontFamily: fontFamily.sansBold, fontSize: 17, lineHeight: 22 },
  buttonSecondary: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, lineHeight: 22 },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof typography;

/** Teto do Dynamic Type / escala de fonte do Android, para o layout não quebrar. */
export const MAX_FONT_SCALE = 1.4;
