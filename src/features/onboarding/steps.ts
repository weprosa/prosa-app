import type { Href } from 'expo-router';

export const STORY_HREF = '/onboarding/story' as const satisfies Href;

/**
 * Ordem do onboarding. A barra de progresso e o "1 de 3" saem daqui: para incluir
 * uma etapa, crie a rota e acrescente-a nesta lista.
 */
export const ONBOARDING_STEPS = [
  { id: 'profile', href: '/onboarding/profile' },
  // TODO: etapas 2 e 3 ainda sem design.
  { id: 'step-2', href: null },
  { id: 'step-3', href: null },
] as const satisfies readonly { id: string; href: Href | null }[];

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

export function stepPosition(id: OnboardingStepId) {
  const index = ONBOARDING_STEPS.findIndex((step) => step.id === id);
  return { current: index + 1, total: ONBOARDING_STEPS.length, next: ONBOARDING_STEPS[index + 1] };
}
