import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  ChipGroup,
  DateField,
  MAX_FONT_SCALE,
  Notice,
  showToast,
  sizes,
  spacing,
  TextButton,
  TextField,
} from '@/design-system';
import { getCurrentLocation, type CurrentLocationResult } from '@/lib/location';

import { OnboardingDataGate } from './components/onboarding-data-gate';
import { OnboardingStep } from './components/onboarding-step';
import { showOnboardingError } from './onboarding-errors';
import {
  GENDER_OPTIONS,
  INTEREST_OPTIONS,
  interestToTargetGenders,
  maximumBirthDate,
  minimumBirthDate,
  targetGendersToInterest,
  type Interest,
} from './onboarding-options';
import type { GenderIdentity, OnboardingUser } from './onboarding-service';
import { PREFERENCES_HREF } from './steps';
import { useSaveProfile } from './use-onboarding';

const TITLE = 'Seus dados';
const SUBTITLE =
  'Isso ajuda a gente a te mostrar pessoas compatíveis e, com sua localização, quem está por perto.';

type Coordinates = { latitude: number; longitude: number };
type ProfileFields = {
  name: string;
  birthDate: string | null;
  city: string;
  gender: GenderIdentity | null;
  interest: Interest | null;
  coordinates: Coordinates | null;
};
type Errors = Partial<Record<Exclude<keyof ProfileFields, 'coordinates'>, string>>;

function isValidBirthDate(value: string | null): value is string {
  return !!value && value >= minimumBirthDate() && value <= maximumBirthDate();
}

export function ProfileStepScreen() {
  return (
    <OnboardingDataGate step="profile" title={TITLE} subtitle={SUBTITLE}>
      {(user) => <ProfileForm user={user} />}
    </OnboardingDataGate>
  );
}

function ProfileForm({ user }: { user: OnboardingUser }) {
  const saveProfile = useSaveProfile();
  const submitting = useRef(false);
  const { fontScale } = useWindowDimensions();
  const fieldLayout = { flexBasis: sizes.fieldMinWidth * Math.min(fontScale, MAX_FONT_SCALE) };
  const [fields, setFields] = useState<ProfileFields>(() => ({
    name: user.nickname ?? '',
    birthDate: user.birth_date,
    city: user.city ?? '',
    gender: user.gender_identity,
    interest: targetGendersToInterest(user.preferences.target_genders),
    coordinates:
      user.latitude !== null && user.longitude !== null
        ? { latitude: user.latitude, longitude: user.longitude }
        : null,
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [locating, setLocating] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const locationAsked = useRef(false);
  const { name, birthDate, city, gender, interest, coordinates } = fields;

  function changeField<K extends Exclude<keyof ProfileFields, 'coordinates'>>(
    key: K,
    value: ProfileFields[K],
  ) {
    setFields((current) => ({
      ...current,
      [key]: value,
      ...(key === 'city' ? { coordinates: null } : {}),
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function locate(suggestCity = true): Promise<CurrentLocationResult> {
    locationAsked.current = true;
    setLocating(true);
    try {
      const result = await getCurrentLocation(
        suggestCity ? undefined : { reverseGeocode: false, timeoutMs: 8_000 },
      );
      setLocationBlocked(result.status === 'blocked');
      if (result.status === 'granted') {
        setFields((current) => ({
          ...current,
          coordinates: { latitude: result.latitude, longitude: result.longitude },
          city: current.city.trim() ? current.city : (result.city ?? current.city),
        }));
        if (result.city) setErrors((current) => ({ ...current, city: undefined }));
      } else if (suggestCity && result.status !== 'blocked') {
        showToast({
          tone: 'error',
          title: 'Não foi possível usar sua localização. Você pode digitar sua cidade.',
        });
      }
      return result;
    } finally {
      setLocating(false);
    }
  }

  async function openLocationSettings() {
    try {
      await Linking.openSettings();
    } catch {
      showToast({
        tone: 'error',
        title: 'Abra as configurações do aparelho para permitir a localização.',
      });
    }
  }

  async function submit() {
    if (submitting.current || locating || saveProfile.isPending) return;
    const next: Errors = {};
    const nickname = name.trim();
    const trimmedCity = city.trim();
    if (!nickname) next.name = 'Diga como você quer ser chamado.';
    else if (nickname.length < 2 || nickname.length > 100) {
      next.name = 'Use de 2 a 100 caracteres.';
    }
    if (!isValidBirthDate(birthDate)) {
      next.birthDate = 'Informe uma data válida. Você precisa ter 18 anos ou mais.';
    }
    if (!trimmedCity) next.city = 'Informe sua cidade.';
    else if (trimmedCity.length < 2 || trimmedCity.length > 100) {
      next.city = 'Use de 2 a 100 caracteres.';
    }
    if (!gender) next.gender = 'Escolha uma opção.';
    if (!interest) next.interest = 'Escolha uma opção.';
    setErrors(next);
    if (Object.keys(next).length > 0 || !birthDate || !gender || !interest) return;

    submitting.current = true;
    let position = coordinates;
    if (!position && !locationAsked.current) {
      const result = await locate(false);
      if (result.status === 'granted') {
        position = { latitude: result.latitude, longitude: result.longitude };
      }
    }

    saveProfile.mutate(
      {
        nickname,
        birth_date: birthDate,
        gender_identity: gender,
        city: trimmedCity,
        // O PUT sem coordenadas apaga as salvas no servidor. Por isso sempre mandamos o par:
        // as já salvas (cidade intacta), as lidas agora, ou null quando a cidade mudou à mão.
        latitude: position?.latitude ?? null,
        longitude: position?.longitude ?? null,
        target_genders: interestToTargetGenders(interest),
      },
      {
        onSuccess: () => router.push(PREFERENCES_HREF),
        onError: showOnboardingError,
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  }

  return (
    <OnboardingStep
      step="profile"
      title={TITLE}
      subtitle={SUBTITLE}
      onContinue={() => void submit()}
      loading={locating || saveProfile.isPending}
    >
      <TextField
        label="Nome"
        placeholder="Como você quer ser chamado"
        value={name}
        onChangeText={(value) => changeField('name', value)}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        keyboardType="default"
        returnKeyType="next"
      />
      <View style={styles.row}>
        <View style={[styles.field, fieldLayout]}>
          <DateField
            label="Nascimento"
            placeholder="dd/mm/aaaa"
            value={birthDate}
            onChange={(value) => changeField('birthDate', value)}
            minimumDate={minimumBirthDate()}
            maximumDate={maximumBirthDate()}
            error={errors.birthDate}
          />
        </View>
        <View style={[styles.field, fieldLayout]}>
          <TextField
            label="Cidade"
            placeholder="Sua cidade"
            icon="location-outline"
            iconAction={{
              accessibilityLabel: 'Usar minha localização para preencher a cidade',
              onPress: () => void locate(),
              busy: locating,
              disabled: saveProfile.isPending,
            }}
            value={city}
            onChangeText={(value) => changeField('city', value)}
            error={errors.city}
            autoCapitalize="words"
            autoComplete="postal-address-locality"
            textContentType="addressCity"
            keyboardType="default"
            returnKeyType="done"
          />
        </View>
      </View>
      {locationBlocked ? (
        <View>
          <Notice
            icon="location-outline"
            message={
              Platform.OS === 'web'
                ? 'Localização bloqueada. Você pode liberar nas configurações do navegador ou digitar sua cidade.'
                : 'Localização bloqueada. Você pode liberar nas configurações ou digitar sua cidade.'
            }
          />
          {Platform.OS !== 'web' ? (
            <TextButton label="Abrir configurações" onPress={() => void openLocationSettings()} />
          ) : null}
        </View>
      ) : null}
      <ChipGroup
        label="Gênero"
        options={GENDER_OPTIONS}
        value={gender}
        onChange={(value) => changeField('gender', value)}
        error={errors.gender}
      />
      <ChipGroup
        label="Por quem você se interessa"
        options={INTEREST_OPTIONS}
        value={interest}
        onChange={(value) => changeField('interest', value)}
        error={errors.interest}
      />
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  field: { flexGrow: 1, flexShrink: 1 },
});
