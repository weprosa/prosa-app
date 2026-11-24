import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChipGroup, SelectField, spacing } from '@/design-system';
import { OnboardingDataGate } from '@/features/onboarding/components/onboarding-data-gate';
import { OnboardingStep } from '@/features/onboarding/components/onboarding-step';
import { showOnboardingError } from '@/features/onboarding/onboarding-errors';
import {
  FREQUENCY_OPTIONS,
  IMPORTANCE_OPTIONS,
  RELIGION_OPTIONS,
} from '@/features/onboarding/onboarding-options';
import type {
  LifestyleFrequency,
  MatchImportance,
  OnboardingPreferences,
} from '@/features/onboarding/onboarding-service';
import { STORY_HREF } from '@/features/onboarding/steps';
import { useSaveLifestyle } from '@/features/onboarding/use-onboarding';

const TITLE = 'Mais um pouco sobre você';
const SUBTITLE = 'Esses campos são opcionais, mas ajudam no match.';

export function LifestyleStepScreen() {
  return (
    <OnboardingDataGate step="lifestyle" title={TITLE} subtitle={SUBTITLE}>
      {(user) => <LifestyleForm preferences={user.preferences} />}
    </OnboardingDataGate>
  );
}

function LifestyleForm({ preferences }: { preferences: OnboardingPreferences }) {
  const [alcoholFrequency, setAlcoholFrequency] = useState<LifestyleFrequency | null>(
    preferences.alcohol_frequency,
  );
  const [smokingFrequency, setSmokingFrequency] = useState<LifestyleFrequency | null>(
    preferences.smoking_frequency,
  );
  const [religionId, setReligionId] = useState<number | null>(preferences.religion?.id ?? null);
  const [religionImportance, setReligionImportance] = useState<MatchImportance | null>(
    preferences.religion_importance,
  );
  const saveLifestyle = useSaveLifestyle();
  const submitting = useRef(false);

  function submit() {
    if (submitting.current || saveLifestyle.isPending) return;
    submitting.current = true;
    saveLifestyle.mutate(
      {
        // A atualização é parcial: null explícito limpa o campo no servidor.
        alcohol_frequency: alcoholFrequency,
        smoking_frequency: smokingFrequency,
        religion_id: religionId,
        religion_importance: religionImportance,
      },
      {
        onSuccess: () => router.push(STORY_HREF),
        onError: showOnboardingError,
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  }

  return (
    <OnboardingStep
      step="lifestyle"
      title={TITLE}
      subtitle={SUBTITLE}
      onContinue={submit}
      loading={saveLifestyle.isPending}
    >
      <View style={styles.fields}>
        <ChipGroup
          allowDeselect
          label="Bebida"
          options={FREQUENCY_OPTIONS}
          value={alcoholFrequency}
          onChange={setAlcoholFrequency}
        />
        <ChipGroup
          allowDeselect
          label="Cigarro"
          options={FREQUENCY_OPTIONS}
          value={smokingFrequency}
          onChange={setSmokingFrequency}
        />
        <SelectField
          clearLabel="Prefiro não informar"
          label="Religião (opcional)"
          placeholder="Selecione"
          options={RELIGION_OPTIONS}
          value={religionId}
          onChange={setReligionId}
        />
        <ChipGroup
          allowDeselect
          label="Quanto isso importa pra você?"
          options={IMPORTANCE_OPTIONS}
          value={religionImportance}
          onChange={setReligionImportance}
        />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
});
