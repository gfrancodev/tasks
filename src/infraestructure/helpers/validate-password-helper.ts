export function validatePassword(password: string): boolean {
  const hasMinimumLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasMinimumLength && hasUppercase && hasLowercase && hasNumber && hasSpecialCharacter;
}
