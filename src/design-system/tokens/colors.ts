/**
 * Cores do Prosa. Tema claro apenas (docs/adr/0005).
 *
 * `palette` são os valores brutos e não sai deste arquivo. Telas e componentes
 * usam só os papéis de `colors`, para que um ajuste de marca seja uma troca aqui.
 */
const palette = {
  white: '#FFFFFF',
  ink900: '#1A1A1A',
  ink600: '#5C5C5C',
  ink500: '#737373',
  ink200: '#D6D6D6',
  ink100: '#E6E6E6',
  ink50: '#F5F5F5',
  sand100: '#F4F1EC',
  coral500: '#D64A4E',
  coral600: '#C2363C',
  red700: '#B3261E',
  green700: '#1E6B3A',
  green50: '#EDF7F0',
  red50: '#FCEEEE',
} as const;

export const colors = {
  background: palette.white,
  backgroundPressed: palette.ink50,
  /** Fundo suave de avisos e controles segmentados. */
  surface: palette.sand100,

  text: palette.ink900,
  textSecondary: palette.ink600,
  // 4.7:1 sobre branco. Não clarear: placeholder também precisa de 4.5:1.
  textPlaceholder: palette.ink500,
  textOnPrimary: palette.white,

  primary: palette.coral500,
  primaryPressed: palette.coral600,
  // Texto coral sobre branco usa o tom mais escuro (5.4:1); coral500 fica em 4.2:1.
  link: palette.coral600,

  border: palette.ink200,
  borderFocused: palette.ink900,
  divider: palette.ink100,

  danger: palette.red700,
  dangerBackground: palette.red50,
  // 6.4:1 sobre green50.
  success: palette.green700,
  successBackground: palette.green50,
  /** Trilho de barras de progresso e sliders. */
  track: palette.ink100,
  /** Fundo atrás de folhas e modais. */
  overlay: 'rgba(26, 26, 26, 0.4)',
} as const;

export type ColorToken = keyof typeof colors;
