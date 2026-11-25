import { api } from '@/lib/api/client';
import { cepDigits } from '@/lib/viacep';

// Contrato confirmado pela OpenAPI Prosa API 0.0.1 de 2026-11-21 (ADR 0008).
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

/** Desligado até o back-end publicar os campos de endereço (docs/adr/0013). Com false, eles não vão à rede. */
export const ADDRESS_API_ENABLED = false;

export type OnboardingUser = {
  id: number;
  nickname: string | null;
  birth_date: string | null;
  gender_identity: GenderIdentity | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  preferences: OnboardingPreferences;
  // Endereço: contrato proposto, ainda não publicado pelo back-end (docs/adr/0013).
  /** Proposta: 8 dígitos, sem hífen. */
  postal_code: string | null;
  /** Proposta: logradouro sem número, até 150 caracteres. */
  street: string | null;
  /** Proposta: UF de 2 letras, por exemplo `SP`. */
  state: string | null;
};

type AddressKey = 'postal_code' | 'street' | 'state';

/**
 * A API devolve `preferences: null` enquanto a pessoa não salvou nenhuma preferência.
 * Os campos de endereço são proposta: hoje a API não os manda.
 */
type OnboardingResponse = {
  user: Omit<OnboardingUser, 'preferences' | AddressKey> & {
    preferences: OnboardingPreferences | null;
    postal_code?: string | null;
    street?: string | null;
    state?: string | null;
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
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  /** Proposta (docs/adr/0013). Aceita com ou sem hífen; vai à rede só com dígitos. */
  postal_code?: string;
  /** Proposta (docs/adr/0013). */
  street?: string;
  /** Proposta (docs/adr/0013): UF de 2 letras. */
  state?: string;
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
    state: user.state ?? null,
  };
}

export function fetchOnboarding(signal?: AbortSignal): Promise<OnboardingUser> {
  return request('', { signal });
}

export function updateProfile(input: ProfileInput): Promise<OnboardingUser> {
  const { postal_code, street, state, ...profile } = input;
  // Com a chave desligada, o corpo é o mesmo do contrato confirmado (ADR 0008).
  const body = ADDRESS_API_ENABLED
    ? {
        ...profile,
        ...(postal_code !== undefined ? { postal_code: cepDigits(postal_code) } : {}),
        ...(street !== undefined ? { street } : {}),
        ...(state !== undefined ? { state } : {}),
      }
    : profile;
  return request('/profile', { method: 'PUT', body });
}

export function updatePreferences(input: PreferencesInput): Promise<OnboardingUser> {
  return request('/preferences', { method: 'PUT', body: input });
}

export function updateLifestyle(input: LifestyleInput): Promise<OnboardingUser> {
  return request('/lifestyle', { method: 'PUT', body: input });
}
