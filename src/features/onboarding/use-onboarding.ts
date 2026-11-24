import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
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
      const user = await updateProfile(profile);
      const preferences = user.preferences;
      if (preferences.relationship_intention !== null) {
        const currentGenders = preferences.target_genders;
        const interestChanged =
          currentGenders?.length !== target_genders.length ||
          target_genders.some((gender) => !currentGenders?.includes(gender));
        if (!interestChanged) return user;

        const { minimum_age, maximum_age, maximum_distance_km, target_child_situation } =
          preferences;
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
    },
    onSuccess: (user) => {
      queryClient.setQueryData<OnboardingUser>(onboardingQueryKey, user);
    },
  });
}

export function useSavePreferences(): UseMutationResult<OnboardingUser, Error, PreferencesInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (user) => {
      queryClient.setQueryData<OnboardingUser>(onboardingQueryKey, user);
    },
  });
}

export function useSaveLifestyle(): UseMutationResult<OnboardingUser, Error, LifestyleInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLifestyle,
    onSuccess: (user) => {
      queryClient.setQueryData<OnboardingUser>(onboardingQueryKey, user);
    },
  });
}
