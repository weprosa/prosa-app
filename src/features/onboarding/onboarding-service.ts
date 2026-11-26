import { api } from '@/lib/api/client';
import { cepDigits } from '@/lib/viacep';

// Contrato da OpenAPI do prosa-api em main, commit 235b623 (2026-11-26).
export type GenderIdentity = 'woman' | 'man' | 'non_binary';
export type RelationshipIntention = 'serious_relationship' | 'casual' | 'open_to_exploring';
export type ChildSituation =
  'has_children' | 'wants_children' | 'does_not_want_children' | 'open_to_children';
export type LifestyleFrequency = 'never' | 'social' | 'frequent';
export type MatchImportance = 'low' | 'medium' | 'high';

export type OnboardingPreferences = {
  target_genders: GenderIdentity[] | null;
  relationship_intention: RelationshipIntention | null;
  target_child_situation: ChildSituation | null;
  minimum_age: number | null;
  maximum_age: number | null;
  maximum_distance_km: number | null;
  alcohol_frequency: LifestyleFrequency | null;
  smoking_frequency: LifestyleFrequency | null;
  religion: { id: number; name: string } | null;
  religion_importance: MatchImportance | null;
};

export type OnboardingUser = {
  id: number;
  nickname: string | null;
  birth_date: string | null;
  gender_identity: GenderIdentity | null;
  postal_code: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  onboarding_completed: boolean;
  preferences: OnboardingPreferences;
};

type AddressKey = 'postal_code' | 'street' | 'neighborhood' | 'city' | 'state';

/**
 * A API devolve `preferences: null` enquanto a pessoa não salvou nenhuma preferência.
 * Versões anteriores podem omitir campos de endereço e a conclusão do onboarding.
 */
type OnboardingResponse = {
  user: Omit<OnboardingUser, 'preferences' | AddressKey | 'onboarding_completed'> & {
    preferences: OnboardingPreferences | null;
    postal_code?: string | null;
    street?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    onboarding_completed?: boolean;
  };
};

const EMPTY_PREFERENCES: OnboardingPreferences = {
  target_genders: null,
  relationship_intention: null,
  target_child_situation: null,
  minimum_age: null,
  maximum_age: null,
  maximum_distance_km: null,
  alcohol_frequency: null,
  smoking_frequency: null,
  religion: null,
  religion_importance: null,
};

export type ProfileInput = {
  nickname: string;
  birth_date: string;
  gender_identity: GenderIdentity;
  postal_code: string;
  street: string;
  neighborhood?: string | null;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type PreferencesInput = {
  minimum_age: number;
  maximum_age: number;
  maximum_distance_km: number;
  target_genders: GenderIdentity[];
  relationship_intention: RelationshipIntention;
  target_child_situation: ChildSituation;
};

export type LifestyleInput = {
  alcohol_frequency?: LifestyleFrequency | null;
  smoking_frequency?: LifestyleFrequency | null;
  religion_id?: number | null;
  religion_importance?: MatchImportance | null;
};

async function request(
  path: string,
  options: { method?: 'PUT'; body?: unknown; signal?: AbortSignal } = {},
): Promise<OnboardingUser> {
  const { user } = await api<OnboardingResponse>(`/v1/me/onboarding${path}`, options);
  return {
    ...user,
    preferences: user.preferences ?? EMPTY_PREFERENCES,
    postal_code: user.postal_code ?? null,
    street: user.street ?? null,
    neighborhood: user.neighborhood ?? null,
    city: user.city ?? null,
    state: user.state ?? null,
    onboarding_completed: user.onboarding_completed ?? false,
  };
}

export function fetchOnboarding(signal?: AbortSignal): Promise<OnboardingUser> {
  return request('', { signal });
}

export function updateProfile(input: ProfileInput): Promise<OnboardingUser> {
  const { postal_code, neighborhood, latitude, longitude, ...profile } = input;
  const body = {
    ...profile,
    postal_code: cepDigits(postal_code),
    neighborhood: neighborhood?.trim() || null,
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
  };
  return request('/profile', { method: 'PUT', body });
}

export function updatePreferences(input: PreferencesInput): Promise<OnboardingUser> {
  return request('/preferences', { method: 'PUT', body: input });
}

export function updateLifestyle(input: LifestyleInput): Promise<OnboardingUser> {
  return request('/lifestyle', { method: 'PUT', body: input });
}
