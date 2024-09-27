import { describe, it, expect } from 'vitest';
import { createHashedValue, compareHashedValue, hashedValueToString } from '../secure-hash-helpers';

describe('createHashedValue', () => {
  it('should create a hashed value', async () => {
    const password = 'Password123!';
    const hashedValue = await createHashedValue(password);

    expect(hashedValue.original).toBe(password);
    expect(hashedValue.value).not.toBe(password);
    expect(typeof hashedValue.value).toBe('string');
  });

  it('should return different hashes for the same value', async () => {
    const password = 'Password123!';
    const hashedValue1 = await createHashedValue(password);
    const hashedValue2 = await createHashedValue(password);

    expect(hashedValue1.value).not.toBe(hashedValue2.value);
  });
});

describe('compareHashedValue', () => {
  it('should return true when the plain value matches the hashed value', async () => {
    const password = 'Password123!';
    const hashedValue = await createHashedValue(password);

    const result = await compareHashedValue(password, hashedValue.value);
    expect(result).toBe(true);
  });

  it('should return false when the plain value does not match the hashed value', async () => {
    const password = 'Password123!';
    const wrongPassword = 'WrongPassword456!';
    const hashedValue = await createHashedValue(password);

    const result = await compareHashedValue(wrongPassword, hashedValue.value);
    expect(result).toBe(false);
  });
});

describe('hashedValueToString', () => {
  it('should return the hashed value as a string', async () => {
    const password = 'Password123!';
    const hashedValue = await createHashedValue(password);

    const hashedString = hashedValueToString(hashedValue);
    expect(hashedString).toBe(hashedValue.value);
  });
});
