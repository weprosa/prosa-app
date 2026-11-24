import type { ChipOption, SelectOption } from '@/design-system';

import type {
  ChildSituation,
  GenderIdentity,
  LifestyleFrequency,
  MatchImportance,
  RelationshipIntention,
} from '@/features/onboarding/onboarding-service';

export const GENDER_OPTIONS = [
  { value: 'man', label: 'Homem' },
  { value: 'woman', label: 'Mulher' },
  { value: 'non_binary', label: 'Não-binário' },
] as const satisfies readonly ChipOption<GenderIdentity>[];

export type Interest = 'men' | 'women' | 'everyone';

export const INTEREST_OPTIONS = [
  { value: 'men', label: 'Homens' },
  { value: 'women', label: 'Mulheres' },
  { value: 'everyone', label: 'Todos' },
] as const satisfies readonly ChipOption<Interest>[];

export function interestToTargetGenders(interest: Interest): GenderIdentity[] {
  if (interest === 'men') return ['man'];
  if (interest === 'women') return ['woman'];
  return ['woman', 'man', 'non_binary'];
}

export function targetGendersToInterest(
  genders: readonly GenderIdentity[] | null,
): Interest | null {
  if (!genders?.length) return null;
  if (genders.length === 1 && genders[0] === 'man') return 'men';
  if (genders.length === 1 && genders[0] === 'woman') return 'women';
  // A interface reúne as demais combinações válidas da API em "Todos".
  return 'everyone';
}

export const RELATIONSHIP_INTENTION_OPTIONS = [
  { value: 'serious_relationship', label: 'Relacionamento sério' },
  { value: 'casual', label: 'Ver no que dá' },
  { value: 'open_to_exploring', label: 'Ainda não sei' },
] as const satisfies readonly ChipOption<RelationshipIntention>[];

export const CHILD_SITUATION_OPTIONS = [
  { value: 'has_children', label: 'Tenho' },
  { value: 'wants_children', label: 'Quero ter' },
  { value: 'does_not_want_children', label: 'Não quero' },
  { value: 'open_to_children', label: 'Em aberto' },
] as const satisfies readonly ChipOption<ChildSituation>[];

export const FREQUENCY_OPTIONS = [
  { value: 'never', label: 'Nunca' },
  { value: 'social', label: 'Socialmente' },
  { value: 'frequent', label: 'Com frequência' },
] as const satisfies readonly ChipOption<LifestyleFrequency>[];

export const IMPORTANCE_OPTIONS = [
  { value: 'low', label: 'Pouco' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Muito' },
] as const satisfies readonly ChipOption<MatchImportance>[];

// Lista provisória: espelha o ReligionSeeder do back até existir um GET de catálogo.
export const RELIGION_OPTIONS = [
  { value: 1, label: 'Católica' },
  { value: 2, label: 'Evangélica' },
  { value: 3, label: 'Espírita' },
  { value: 4, label: 'Judaica' },
  { value: 5, label: 'Islâmica' },
  { value: 6, label: 'Budista' },
  { value: 7, label: 'Hinduísta' },
  { value: 8, label: 'Umbanda' },
  { value: 9, label: 'Candomblé' },
  { value: 10, label: 'Sem religião' },
  { value: 11, label: 'Outra' },
] as const satisfies readonly SelectOption<number>[];

export const MIN_AGE = 18;
export const MAX_SLIDER_AGE = 50;
export const MAX_API_AGE = 100;
export type AgeRange = readonly [number, number];
export const DEFAULT_AGE_RANGE = [25, 35] as const satisfies AgeRange;
export const MIN_DISTANCE_KM = 1;
export const MAX_DISTANCE_KM = 100;
export const DEFAULT_DISTANCE_KM = 30;

export function ageRangeToApi([minimum, maximum]: AgeRange): {
  minimum_age: number;
  maximum_age: number;
} {
  return {
    minimum_age: minimum,
    maximum_age: maximum >= MAX_SLIDER_AGE ? MAX_API_AGE : maximum,
  };
}

export function ageRangeFromApi(minimum: number | null, maximum: number | null): AgeRange {
  return [
    Math.min(minimum ?? DEFAULT_AGE_RANGE[0], MAX_SLIDER_AGE),
    Math.min(maximum ?? DEFAULT_AGE_RANGE[1], MAX_SLIDER_AGE),
  ];
}

function birthDateYearsAgo(today: Date, years: number): string {
  const year = today.getFullYear() - years;
  const month = today.getMonth();
  // Mantém 29/02 no último dia de fevereiro quando o ano de destino não é bissexto.
  const day = Math.min(today.getDate(), new Date(year, month + 1, 0).getDate());
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Limite inferior do seletor de nascimento: 100 anos antes da data local. */
export function minimumBirthDate(today: Date = new Date()): string {
  return birthDateYearsAgo(today, MAX_API_AGE);
}

/** Data de nascimento mais recente para quem já completou 18 anos, sem conversão UTC. */
export function maximumBirthDate(today: Date = new Date()): string {
  return birthDateYearsAgo(today, MIN_AGE);
}
