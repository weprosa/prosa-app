import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, spacing, Text, TextField, type TextFieldRef } from '@/design-system';

import { authErrorMessage, authFieldErrors, signUp } from './auth-service';
import { AuthFooter } from './components/auth-footer';
import { AuthHeader } from './components/auth-header';
import { SocialSignIn } from './components/social-sign-in';
import {
  compactErrors,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateName,
  validateNewPassword,
  validatePasswordConfirmation,
} from './validation';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirmation', string>>;

export function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);
  const confirmationRef = useRef<TextFieldRef>(null);

  const mutation = useMutation({
    mutationFn: signUp,
    onError: (error) => setErrors(authFieldErrors(error)),
    // TODO: navegar para o onboarding quando a rota existir.
  });

  const submit = () => {
    const nextErrors: Errors = compactErrors({
      name: validateName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    mutation.mutate({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <Screen scroll>
      <AuthHeader title="Criar conta" />

      <View style={styles.fields}>
        <TextField
          label="Nome"
          placeholder="Como você quer ser chamado"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label="E-mail"
          placeholder="voce@email.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Senha"
          placeholder={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmationRef.current?.focus()}
        />
        <TextField
          ref={confirmationRef}
          label="Confirmar senha"
          placeholder="Digite a senha de novo"
          value={confirmation}
          onChangeText={setConfirmation}
          error={errors.confirmation}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>

      <View style={styles.actions}>
        {mutation.isError ? (
          <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
            {authErrorMessage(mutation.error)}
          </Text>
        ) : null}
        <Button label="Criar conta" loading={mutation.isPending} onPress={submit} />
        <SocialSignIn />
      </View>

      <View style={styles.footer}>
        <AuthFooter
          prompt="Já tem conta?"
          action="Entrar"
          onPress={() => router.replace('/sign-in')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  footer: { flex: 1, justifyContent: 'flex-end', paddingTop: spacing.lg },
});
