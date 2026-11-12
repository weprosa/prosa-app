import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Screen,
  spacing,
  Text,
  TextField,
  TextLink,
  type TextFieldRef,
} from '@/design-system';

import { authErrorMessage, authFieldErrors, signIn } from './auth-service';
import { AuthFooter } from './components/auth-footer';
import { AuthHeader } from './components/auth-header';
import { SocialSignIn } from './components/social-sign-in';
import { compactErrors, validateEmail, validatePassword } from './validation';

type Errors = Partial<Record<'email' | 'password', string>>;

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const passwordRef = useRef<TextFieldRef>(null);

  const mutation = useMutation({
    mutationFn: signIn,
    onError: (error) => setErrors(authFieldErrors(error)),
    // TODO: navegar para o onboarding quando a rota existir.
  });

  const submit = () => {
    const nextErrors: Errors = compactErrors({
      email: validateEmail(email),
      password: validatePassword(password),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    mutation.mutate({ email: email.trim(), password });
  };

  // TODO: tela de recuperação de senha ainda não existe.
  const recoverPassword = () => {};

  return (
    <Screen scroll>
      <AuthHeader title="Entrar" subtitle="Que bom te ver de novo." />

      <View style={styles.fields}>
        <TextField
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
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>

      <View style={styles.forgot}>
        <TextLink
          label="Esqueci minha senha"
          variant="label"
          underline={false}
          onPress={recoverPassword}
        />
      </View>

      <View style={styles.actions}>
        {mutation.isError ? (
          <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
            {authErrorMessage(mutation.error)}
          </Text>
        ) : null}
        <Button label="Entrar" loading={mutation.isPending} onPress={submit} />
        <SocialSignIn />
      </View>

      <View style={styles.footer}>
        <AuthFooter
          prompt="Ainda não tem conta?"
          action="Criar conta"
          onPress={() => router.replace('/sign-up')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  forgot: { alignItems: 'flex-end', marginTop: spacing.md, marginBottom: spacing.lg },
  actions: { gap: spacing.sm },
  footer: { flex: 1, justifyContent: 'flex-end', paddingTop: spacing.xl },
});
