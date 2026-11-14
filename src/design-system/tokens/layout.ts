/** Escala de espaçamento em múltiplos de 4. Não use números soltos em telas. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Margem lateral padrão de toda tela. */
  screen: 28,
} as const;

export const radii = {
  field: 14,
  pill: 999,
  sheet: 24,
} as const;

export const sizes = {
  /** Altura mínima de botões. */
  button: 56,
  /** Altura mínima de campos de texto. */
  field: 52,
  /** Alvo de toque mínimo (HIG 44pt / Material 48dp). */
  touchTarget: 48,
  /** Largura máxima do conteúdo em telas largas (tablets, preview web). */
  contentMaxWidth: 480,
} as const;
