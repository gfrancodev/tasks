export function mapOrEmpty<T, U>(input: T[] | undefined | null, mapper: (item: T) => U): U[] {
  return Array.isArray(input) ? input.map(mapper) : [];
}
