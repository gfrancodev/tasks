import * as bcrypt from 'bcrypt';

export type HashedValue<T> = {
  value: string;
  original: T;
};

export async function createHashedValue<T>(
  value: T,
  saltRounds: number = 10,
): Promise<HashedValue<T>> {
  const hashedValue = await bcrypt.hash(String(value), saltRounds);
  return { value: hashedValue, original: value };
}

export async function compareHashedValue<T>(
  plainValue: T,
  hashedValue: HashedValue<T>,
): Promise<boolean> {
  return bcrypt.compare(String(plainValue), hashedValue.value);
}

export function hashedValueToString<T>(hashedValue: HashedValue<T>): string {
  return hashedValue.value;
}
