export function mapOrUndefined<T, U>(
  input: T | undefined | null,
  mapper: (item: T) => U,
): U | null {
  return input ? mapper(input) : undefined;
}
