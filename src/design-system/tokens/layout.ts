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

export const borderWidths = {
  default: 1,
  emphasis: 2,
} as const;

export const sizes = {
  /** Altura mínima de botões. */
  button: 56,
  /** Altura mínima de campos de texto. */
  field: 52,
  /** Base a 1x para dois campos no celular; escale com a fonte para preservar a quebra. */
  fieldMinWidth: 140,
  /** Altura mínima de campos de texto com várias linhas. */
  textArea: 160,
  /** Diâmetro do botão de ditado por voz. */
  dictationButton: 72,
  /** Diâmetro do halo em repouso, antes da escala do nível de áudio. */
  dictationHalo: 80,
  /** Área reservada para o halo expandido, sem deslocar o conteúdo. */
  dictationControl: 112,
  /** Ícones de microfone e parada do botão de ditado. */
  dictationIcon: 28,
  /** Alvo de toque mínimo (HIG 44pt / Material 48dp). */
  touchTarget: 48,
  /** Trilho e polegar dos sliders; o alvo de toque continua com 48pt. */
  sliderTrack: 4,
  sliderThumb: 24,
  /** Ícone de calendário do campo de data. */
  fieldIcon: 20,
  /** Largura máxima do conteúdo em telas largas (tablets, preview web). */
  contentMaxWidth: 480,
} as const;
