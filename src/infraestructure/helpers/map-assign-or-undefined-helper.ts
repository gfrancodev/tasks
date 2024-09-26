export function mapAssignedToOrUndefined<T, U>(
  input: T | undefined | null,
  mapper: (item: T) => U,
): U | undefined {
  return input ? mapper(input) : undefined;
}
