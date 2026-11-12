/** Cada validador devolve a mensagem de erro, ou `undefined` quando o valor é válido. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export function validateName(name: string) {
  if (name.trim().length < 2) return 'Diga como você quer ser chamado.';
}

export function validateEmail(email: string) {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Confira o e-mail. Exemplo: voce@email.com';
}

export function validatePassword(password: string) {
  if (!password) return 'Informe sua senha.';
}

export function validateNewPassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (confirmation !== password) return 'As senhas não são iguais.';
}

/** Remove chaves sem erro, para `Object.keys(errors).length` dizer se o formulário é válido. */
export function compactErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as Partial<
    Record<keyof T, string>
  >;
}
