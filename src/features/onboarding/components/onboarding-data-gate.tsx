import type { ReactNode } from 'react';

import { Notice, Text } from '@/design-system';
import type { OnboardingUser } from '@/features/onboarding/onboarding-service';
import type { OnboardingStepId } from '@/features/onboarding/steps';
import { useOnboarding } from '@/features/onboarding/use-onboarding';

import { OnboardingStep } from './onboarding-step';

type OnboardingDataGateProps = {
  step: OnboardingStepId;
  title: string;
  subtitle?: string;
  children: (user: OnboardingUser) => ReactNode;
};

/** Monta o formulário só depois de carregar os dados da pessoa. */
export function OnboardingDataGate({ children, ...step }: OnboardingDataGateProps) {
  const { data: user, isError, isFetching, refetch } = useOnboarding();

  if (user) return children(user);

  return (
    <OnboardingStep
      {...step}
      actionLabel={isError ? 'Tentar de novo' : undefined}
      loading={!isError || isFetching}
      onContinue={() => void refetch()}
    >
      {isError ? (
        <Notice message="Não foi possível carregar seus dados. Confira sua internet e tente de novo." />
      ) : (
        <Text color="textSecondary" accessibilityLiveRegion="polite">
          Carregando seus dados…
        </Text>
      )}
    </OnboardingStep>
  );
}
