import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  ChipGroup,
  DateField,
  MAX_FONT_SCALE,
  Notice,
  SelectField,
  showToast,
  sizes,
  spacing,
  TextButton,
  TextField,
  type TextFieldRef,
} from '@/design-system';
import { getCurrentLocation, type CurrentLocationResult } from '@/lib/location';
import { cepDigits, formatCep, isCompleteCep, lookupCep } from '@/lib/viacep';

import { OnboardingDataGate } from './components/onboarding-data-gate';
import { OnboardingStep } from './components/onboarding-step';
import { showOnboardingError } from './onboarding-errors';
import {
  GENDER_OPTIONS,
  INTEREST_OPTIONS,
  interestToTargetGenders,
  isBrazilianState,
  maximumBirthDate,
  minimumBirthDate,
  STATE_OPTIONS,
  targetGendersToInterest,
  type BrazilianState,
  type Interest,
} from './onboarding-options';
import type { GenderIdentity, OnboardingUser } from './onboarding-service';
import { PREFERENCES_HREF } from './steps';
import { useSaveProfile } from './use-onboarding';

const TITLE = 'Seus dados';
const SUBTITLE =
  'Isso ajuda a gente a te mostrar pessoas compatíveis e quem está por perto. Seu endereço nunca aparece para outras pessoas.';
const CEP_INCOMPLETE = 'Digite os 8 números do CEP.';

type Coordinates = { latitude: number; longitude: number };
type ProfileFields = {
  name: string;
  birthDate: string | null;
  postalCode: string;
  street: string;
  city: string;
  state: BrazilianState | null;
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
  const streetRef = useRef<TextFieldRef>(null);
  const cityRef = useRef<TextFieldRef>(null);
  const { fontScale } = useWindowDimensions();
  const fieldLayout = { flexBasis: sizes.fieldMinWidth * Math.min(fontScale, MAX_FONT_SCALE) };
  const [fields, setFields] = useState<ProfileFields>(() => ({
    name: user.nickname ?? '',
    birthDate: user.birth_date,
    postalCode: formatCep(user.postal_code ?? ''),
    street: user.street ?? '',
    city: user.city ?? '',
    state: user.state !== null && isBrazilianState(user.state) ? user.state : null,
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
  const [searchingCep, setSearchingCep] = useState(false);
  // Busca de CEP em andamento. Uma busca nova, a edição do CEP ou sair da tela a cancelam.
  const cepLookup = useRef<AbortController | null>(null);
  const { name, birthDate, postalCode, street, city, state, gender, interest } = fields;

  useEffect(() => {
    return () => {
      cepLookup.current?.abort();
      cepLookup.current = null;
    };
  }, []);

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

  function cancelCepLookup() {
    cepLookup.current?.abort();
    cepLookup.current = null;
    setSearchingCep(false);
  }

  function changePostalCode(value: string) {
    // O resultado de uma busca para outro CEP não vale mais.
    if (cepDigits(value) !== cepDigits(postalCode)) cancelCepLookup();
    changeField('postalCode', formatCep(value));
  }

  async function searchCep() {
    // A localização também mexe na cidade: as duas não correm juntas (o teclado não respeita o botão).
    if (submitting.current || locating) return;
    if (!isCompleteCep(postalCode)) {
      setErrors((current) => ({ ...current, postalCode: CEP_INCOMPLETE }));
      return;
    }

    cepLookup.current?.abort();
    const controller = new AbortController();
    cepLookup.current = controller;
    setSearchingCep(true);
    try {
      const result = await lookupCep(postalCode, { signal: controller.signal });
      if (controller.signal.aborted) return;

      if (result.status === 'found') {
        const { address } = result;
        const foundState = isBrazilianState(address.state) ? address.state : null;
        setFields((current) => {
          const nextState = foundState ?? current.state;
          // Cidade e UF juntas: há cidades com o mesmo nome em estados diferentes.
          const sameLocality =
            current.city.trim() === address.city.trim() && current.state === nextState;
          return {
            ...current,
            postalCode: address.cep,
            // CEP de cidade pequena vem sem rua: só mantém a digitada se o lugar for o mesmo.
            street: address.street || (sameLocality ? current.street : ''),
            city: address.city,
            state: nextState,
            // Mesma regra da edição manual: lugar novo invalida as coordenadas antigas.
            coordinates: sameLocality ? current.coordinates : null,
          };
        });
        setErrors((current) => ({
          ...current,
          postalCode: undefined,
          city: undefined,
          ...(address.street ? { street: undefined } : {}),
          ...(foundState ? { state: undefined } : {}),
        }));
        if (!address.street) streetRef.current?.focus();
      } else if (result.status === 'not_found') {
        setErrors((current) => ({
          ...current,
          postalCode: 'Não encontramos esse CEP. Confira os números ou preencha o endereço.',
        }));
      } else if (result.status === 'invalid') {
        setErrors((current) => ({ ...current, postalCode: CEP_INCOMPLETE }));
      } else {
        showToast({
          tone: 'error',
          title:
            'Não foi possível buscar o CEP agora. Confira sua internet ou preencha o endereço.',
        });
      }
    } finally {
      if (cepLookup.current === controller) {
        cepLookup.current = null;
        setSearchingCep(false);
      }
    }
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
    if (submitting.current || locating || searchingCep || saveProfile.isPending) return;
    const next: Errors = {};
    const nickname = name.trim();
    const postalDigits = cepDigits(postalCode);
    const trimmedStreet = street.trim();
    const trimmedCity = city.trim();
    if (!nickname) next.name = 'Diga como você quer ser chamado.';
    else if (nickname.length < 2 || nickname.length > 100) {
      next.name = 'Use de 2 a 100 caracteres.';
    }
    if (!isValidBirthDate(birthDate)) {
      next.birthDate = 'Informe uma data válida. Você precisa ter 18 anos ou mais.';
    }
    if (postalDigits.length !== 8) next.postalCode = CEP_INCOMPLETE;
    if (!trimmedStreet) next.street = 'Informe sua rua ou avenida.';
    else if (trimmedStreet.length < 2 || trimmedStreet.length > 150) {
      next.street = 'Use de 2 a 150 caracteres.';
    }
    if (!trimmedCity) next.city = 'Informe sua cidade.';
    else if (trimmedCity.length < 2 || trimmedCity.length > 100) {
      next.city = 'Use de 2 a 100 caracteres.';
    }
    if (!state) next.state = 'Escolha seu estado.';
    if (!gender) next.gender = 'Escolha uma opção.';
    if (!interest) next.interest = 'Escolha uma opção.';
    setErrors(next);
    if (Object.keys(next).length > 0 || !birthDate || !state || !gender || !interest) return;

    submitting.current = true;
    let position = fields.coordinates;
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
        postal_code: postalDigits,
        street: trimmedStreet,
        city: trimmedCity,
        state,
        ...(position ?? {}),
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
      loading={locating || searchingCep || saveProfile.isPending}
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
      <DateField
        label="Nascimento"
        placeholder="dd/mm/aaaa"
        value={birthDate}
        onChange={(value) => changeField('birthDate', value)}
        minimumDate={minimumBirthDate()}
        maximumDate={maximumBirthDate()}
        error={errors.birthDate}
      />
      <TextField
        label="CEP"
        placeholder="00000-000"
        value={postalCode}
        onChangeText={changePostalCode}
        onSubmitEditing={() => void searchCep()}
        error={errors.postalCode}
        action={{
          icon: 'search-outline',
          accessibilityLabel: 'Buscar endereço pelo CEP',
          onPress: () => void searchCep(),
          busy: searchingCep,
          disabled: locating || saveProfile.isPending,
        }}
        keyboardType="number-pad"
        maxLength={9}
        autoComplete="postal-code"
        textContentType="postalCode"
        returnKeyType="search"
      />
      <TextField
        ref={streetRef}
        label="Logradouro"
        placeholder="Rua ou avenida, sem o número"
        value={street}
        onChangeText={(value) => changeField('street', value)}
        onSubmitEditing={() => cityRef.current?.focus()}
        error={errors.street}
        autoCapitalize="words"
        keyboardType="default"
        returnKeyType="next"
        maxLength={150}
      />
      <View style={styles.row}>
        <View style={[styles.field, fieldLayout]}>
          <TextField
            ref={cityRef}
            label="Cidade"
            placeholder="Sua cidade"
            icon="location-outline"
            iconAction={{
              accessibilityLabel: 'Usar minha localização para preencher a cidade',
              onPress: () => void locate(),
              busy: locating,
              disabled: searchingCep || saveProfile.isPending,
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
        <View style={[styles.field, fieldLayout]}>
          <SelectField
            label="Estado"
            placeholder="Escolha"
            options={STATE_OPTIONS}
            value={state}
            onChange={(value) => changeField('state', value)}
            error={errors.state}
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
