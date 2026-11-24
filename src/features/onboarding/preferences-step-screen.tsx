import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChipGroup, RangeSlider, Slider, spacing } from '@/design-system';
import { OnboardingDataGate } from '@/features/onboarding/components/onboarding-data-gate';
import { OnboardingStep } from '@/features/onboarding/components/onboarding-step';
import { showOnboardingError } from '@/features/onboarding/onboarding-errors';
import {
  ageRangeFromApi,
  ageRangeToApi,
  CHILD_SITUATION_OPTIONS,
  DEFAULT_DISTANCE_KM,
  MAX_DISTANCE_KM,
  MAX_SLIDER_AGE,
  MIN_AGE,
  MIN_DISTANCE_KM,
  RELATIONSHIP_INTENTION_OPTIONS,
} from '@/features/onboarding/onboarding-options';
import type {
  ChildSituation,
  GenderIdentity,
  OnboardingPreferences,
  OnboardingUser,
  RelationshipIntention,
} from '@/features/onboarding/onboarding-service';
import { LIFESTYLE_HREF, PROFILE_HREF } from '@/features/onboarding/steps';
import { useSavePreferences } from '@/features/onboarding/use-onboarding';

const TITLE = 'O que você busca';
const SUBTITLE = 'Essas informações funcionam como filtro.';

type Errors = Partial<Record<'relationshipIntention' | 'childSituation', string>>;

export function PreferencesStepScreen() {
  return (
    <OnboardingDataGate step="preferences" title={TITLE} subtitle={SUBTITLE}>
      {(user) => <PreferencesData user={user} />}
    </OnboardingDataGate>
  );
}

function PreferencesData({ user }: { user: OnboardingUser }) {
  const targetGenders = user.preferences.target_genders;

  useEffect(() => {
    if (!targetGenders?.length) router.replace(PROFILE_HREF);
  }, [targetGenders]);

  if (!targetGenders?.length) return null;

  return <PreferencesForm preferences={user.preferences} targetGenders={targetGenders} />;
}

function PreferencesForm({
  preferences,
  targetGenders,
}: {
  preferences: OnboardingPreferences;
  targetGenders: GenderIdentity[];
}) {
  // O formulário só monta com os dados carregados; atualizações do cache preservam o rascunho.
  const [relationshipIntention, setRelationshipIntention] = useState<RelationshipIntention | null>(
    preferences.relationship_intention,
  );
  const [childSituation, setChildSituation] = useState<ChildSituation | null>(
    preferences.target_child_situation,
  );
  const [range, setRange] = useState(() =>
    ageRangeFromApi(preferences.minimum_age, preferences.maximum_age),
  );
  const [distance, setDistance] = useState(() =>
    Math.min(preferences.maximum_distance_km ?? DEFAULT_DISTANCE_KM, MAX_DISTANCE_KM),
  );
  const [errors, setErrors] = useState<Errors>({});
  const savePreferences = useSavePreferences();
  const submitting = useRef(false);

  function submit() {
    if (submitting.current || savePreferences.isPending) return;
    const next: Errors = {};
    if (relationshipIntention === null) next.relationshipIntention = 'Escolha uma opção.';
    if (childSituation === null) next.childSituation = 'Escolha uma opção.';
    setErrors(next);
    if (relationshipIntention === null || childSituation === null) return;

    submitting.current = true;
    savePreferences.mutate(
      {
        ...ageRangeToApi(range),
        maximum_distance_km: distance,
        target_genders: targetGenders,
        relationship_intention: relationshipIntention,
        target_child_situation: childSituation,
      },
      {
        onSuccess: () => router.push(LIFESTYLE_HREF),
        onError: showOnboardingError,
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  }

  return (
    <OnboardingStep
      step="preferences"
      title={TITLE}
      subtitle={SUBTITLE}
      onContinue={submit}
      loading={savePreferences.isPending}
    >
      <View style={styles.fields}>
        <ChipGroup
          label="O que você busca?"
          options={RELATIONSHIP_INTENTION_OPTIONS}
          value={relationshipIntention}
          onChange={(value) => {
            setRelationshipIntention(value);
            setErrors((current) => ({ ...current, relationshipIntention: undefined }));
          }}
          error={errors.relationshipIntention}
        />
        <ChipGroup
          label="Filhos"
          options={CHILD_SITUATION_OPTIONS}
          value={childSituation}
          onChange={(value) => {
            setChildSituation(value);
            setErrors((current) => ({ ...current, childSituation: undefined }));
          }}
          error={errors.childSituation}
        />
        <RangeSlider
          label="Idade de quem você quer conhecer"
          min={MIN_AGE}
          max={MAX_SLIDER_AGE}
          value={range}
          onChange={setRange}
          valueText={`${range[0]} – ${range[1] === MAX_SLIDER_AGE ? '50+' : range[1]}`}
          minLabel="18"
          maxLabel="50+"
        />
        <Slider
          label="Distância máxima"
          min={MIN_DISTANCE_KM}
          max={MAX_DISTANCE_KM}
          value={distance}
          onChange={setDistance}
          valueText={`até ${distance} km`}
          minLabel="1 km"
          maxLabel="100 km"
        />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
});
