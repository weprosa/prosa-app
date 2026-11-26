import type { Href } from 'expo-router';

import type { OnboardingUser } from '@/features/onboarding/onboarding-service';

export const PROFILE_HREF = '/onboarding/profile' as const satisfies Href;
export const PREFERENCES_HREF = '/onboarding/preferences' as const satisfies Href;
export const LIFESTYLE_HREF = '/onboarding/lifestyle' as const satisfies Href;
export const STORY_HREF = '/onboarding/story' as const satisfies Href;

/**
 * Ordem do onboarding. A barra de progresso e o "1 de 3" saem daqui: para incluir
 * uma etapa, crie a rota e acrescente-a nesta lista.
 */
export const ONBOARDING_STEPS = [
  { id: 'profile', href: PROFILE_HREF },
  { id: 'preferences', href: PREFERENCES_HREF },
  { id: 'lifestyle', href: LIFESTYLE_HREF },
] as const satisfies readonly { id: string; href: Href }[];

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

export function stepPosition(id: OnboardingStepId) {
  const index = ONBOARDING_STEPS.findIndex((step) => step.id === id);
  return {
    current: index + 1,
    total: ONBOARDING_STEPS.length,
    next: ONBOARDING_STEPS[index + 1],
    previous: ONBOARDING_STEPS[index - 1],
  };
}

export function nextOnboardingHref(user: OnboardingUser) {
  // A conclusão da etapa 3 vale mesmo quando todo o estilo de vida ficou vazio.
  if (user.onboarding_completed) return STORY_HREF;

  const { preferences } = user;
  const profileIncomplete =
    !user.nickname?.trim() ||
    !user.birth_date?.trim() ||
    !user.gender_identity?.trim() ||
    !user.city?.trim() ||
    !user.postal_code?.trim() ||
    !user.street?.trim() ||
    !user.state?.trim();

  // O interesse da etapa 1 só é persistido ao salvar as preferências na etapa 2.
  if (profileIncomplete || preferences.relationship_intention === null) return PROFILE_HREF;

  return LIFESTYLE_HREF;
}
