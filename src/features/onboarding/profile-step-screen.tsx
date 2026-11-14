import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChipGroup, SelectField, spacing, TextField, type ChipOption } from '@/design-system';

import { OnboardingStep } from './components/onboarding-step';
import { stepPosition } from './steps';

const GENDERS = [
  { value: 'man', label: 'Homem' },
  { value: 'woman', label: 'Mulher' },
  { value: 'non_binary', label: 'Não-binário' },
  { value: 'undisclosed', label: 'Prefiro não dizer' },
] as const satisfies readonly ChipOption<string>[];

const INTERESTS = [
  { value: 'men', label: 'Homens' },
  { value: 'women', label: 'Mulheres' },
  { value: 'everyone', label: 'Todos' },
] as const satisfies readonly ChipOption<string>[];

type Gender = (typeof GENDERS)[number]['value'];
type Interest = (typeof INTERESTS)[number]['value'];

const MIN_AGE = 18;
const MAX_AGE = 99;
const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => ({
  value: MIN_AGE + i,
  label: String(MIN_AGE + i),
}));

type Errors = Partial<Record<'name' | 'age' | 'city' | 'gender' | 'interest', string>>;

export function ProfileStepScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [interest, setInterest] = useState<Interest | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Diga como você quer ser chamado.';
    if (age === null) next.age = 'Escolha sua idade.';
    if (city.trim().length < 2) next.city = 'Informe sua cidade.';
    if (!gender) next.gender = 'Escolha uma opção.';
    if (!interest) next.interest = 'Escolha uma opção.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // TODO: o back-end ainda não tem rota de perfil (docs/adr/0008). Enviar os dados
    // quando existir; por enquanto segue para a próxima etapa, se ela já existir.
    const { next: nextStep } = stepPosition('profile');
    if (nextStep?.href) {
      router.push(nextStep.href);
    }
  };

  return (
    <OnboardingStep
      step="profile"
      title="Seus dados"
      subtitle="Isso ajuda a gente a te mostrar pessoas compatíveis."
      onContinue={submit}
    >
      <TextField
        label="Nome"
        placeholder="Como você quer ser chamado"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
      />
      <View style={styles.row}>
        <View style={styles.age}>
          <SelectField
            label="Idade"
            placeholder="Idade"
            options={AGES}
            value={age}
            onChange={setAge}
            error={errors.age}
          />
        </View>
        <View style={styles.city}>
          <TextField
            label="Cidade"
            placeholder="Sua cidade"
            icon="location-outline"
            value={city}
            onChangeText={setCity}
            error={errors.city}
            autoCapitalize="words"
            textContentType="addressCity"
          />
        </View>
      </View>
      <ChipGroup
        label="Gênero"
        options={GENDERS}
        value={gender}
        onChange={setGender}
        error={errors.gender}
      />
      <ChipGroup
        label="Por quem você se interessa"
        options={INTERESTS}
        value={interest}
        onChange={setInterest}
        error={errors.interest}
      />
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  age: { flex: 2 },
  city: { flex: 3 },
});
