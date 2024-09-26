import { describe, it, expect } from 'vitest';
import { validatePassword } from '../validate-password-helper';

describe('validatePassword', () => {
  it('should return true for valid passwords', () => {
    expect(validatePassword('StrongP@ssword123')).toBe(true);
    expect(validatePassword('Test123!Password')).toBe(true);
    expect(validatePassword('Abcdefg$1')).toBe(true);
  });

  it('should return false for passwords without minimum length', () => {
    expect(validatePassword('Short1!')).toBe(false);
    expect(validatePassword('P@ss1')).toBe(false);
  });

  it('should return false for passwords without uppercase letters', () => {
    expect(validatePassword('nouppercase1!')).toBe(false);
  });

  it('should return false for passwords without lowercase letters', () => {
    expect(validatePassword('NOLOWERCASE1!')).toBe(false);
  });

  it('should return false for passwords without numbers', () => {
    expect(validatePassword('NoNumbers!')).toBe(false);
  });

  it('should return false for passwords without special characters', () => {
    expect(validatePassword('NoSpecial123')).toBe(false);
  });
});
