import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { cepDigits } from '@/lib/viacep';

import {
  ADDRESS_API_ENABLED,
  fetchOnboarding,
  updateLifestyle,
  updatePreferences,
  updateProfile,
  type GenderIdentity,
  type LifestyleInput,
  type OnboardingUser,
  type PreferencesInput,
  type ProfileInput,
} from '@/features/onboarding/onboarding-service';

export const onboardingQueryKey = ['me', 'onboarding'] as const;
export type SaveProfileInput = ProfileInput & { target_genders: GenderIdentity[] };

export function useOnboarding(): UseQueryResult<OnboardingUser> {
  return useQuery({
    queryKey: onboardingQueryKey,
    queryFn: ({ signal }) => fetchOnboarding(signal),
    // Preserva o interesse em memória entre as etapas, até salvar as preferências.
    staleTime: Infinity,
  });
}

export function useSaveProfile(): UseMutationResult<OnboardingUser, Error, SaveProfileInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ target_genders, ...profile }) => {
      const user = await saveProfileAndInterest(profile, target_genders);
      return ADDRESS_API_ENABLED ? user : keepAddressDraft(user, profile);
    },
    onSuccess: (user) => {
      queryClient.setQueryData<OnboardingUser>(onboardingQueryKey, user);
    },
  });
}

async function saveProfileAndInterest(
  profile: ProfileInput,
  target_genders: GenderIdentity[],
): Promise<OnboardingUser> {
  const user = await updateProfile(profile);
  const preferences = user.preferences;
  if (preferences.relationship_intention !== null) {
    const currentGenders = preferences.target_genders;
    const interestChanged =
      currentGenders?.length !== target_genders.length ||
      target_genders.some((gender) => !currentGenders?.includes(gender));
    if (!interestChanged) return user;

    const { minimum_age, maximum_age, maximum_distance_km, target_child_situation } = preferences;
    if (
      minimum_age === null ||
      maximum_age === null ||
      maximum_distance_km === null ||
      target_child_situation === null
    ) {
      throw new Error('As preferências salvas estão incompletas.');
    }
    return updatePreferences({
      minimum_age,
      maximum_age,
      maximum_distance_km,
      relationship_intention: preferences.relationship_intention,
      target_child_situation,
      target_genders,
    });
  }

  // Antes da etapa 2, o interesse continua apenas como rascunho em memória.
  return {
    ...user,
    preferences: { ...user.preferences, target_genders: [...target_genders] },
  };
}

/**
 * Enquanto a API não guarda o endereço (docs/adr/0013), CEP, logradouro e estado ficam
 * só como rascunho em memória, para voltar à etapa 1 na mesma sessão sem perdê-los.
 */
function keepAddressDraft(user: OnboardingUser, profile: ProfileInput): OnboardingUser {
  const { postal_code, street, state } = profile;
  return {
    ...user,
    postal_code: postal_code !== undefined ? cepDigits(postal_code) : user.postal_code,
    street: street ?? user.street,
    state: state ?? user.state,
  };
}

/** As etapas 2 e 3 recebem o usuário do servidor, sem endereço: mantém o rascunho da etapa 1. */
function withAddressDraft(previous: OnboardingUser | undefined, user: OnboardingUser) {
  if (ADDRESS_API_ENABLED || !previous) return user;
  const { postal_code, street, state } = previous;
  return { ...user, postal_code, street, state };
}

export function useSavePreferences(): UseMutationResult<OnboardingUser, Error, PreferencesInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (user) => {
      queryClient.setQueryData<OnboardingUser>(onboardingQueryKey, (previous) =>
        withAddressDraft(previous, user),
      );
    },
  });
}

export function useSaveLifestyle(): UseMutationResult<OnboardingUser, Error, LifestyleInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLifestyle,
    onSuccess: (user) => {
      queryClient.setQueryData<OnboardingUser>(onboardingQueryKey, (previous) =>
        withAddressDraft(previous, user),
      );
    },
  });
}
