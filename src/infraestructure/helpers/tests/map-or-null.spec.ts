import { describe, it, expect } from 'vitest';
import { mapOrNull } from '../map-or-null-helper';

describe('mapOrNull', () => {
  it('should return null when input is null', () => {
    const result = mapOrNull(null, (item) => item);
    expect(result).toBeNull();
  });

  it('should return null when input is undefined', () => {
    const result = mapOrNull(undefined, (item) => item);
    expect(result).toBeNull();
  });

  it('should return the result of the mapper function if input is defined', () => {
    const input = { id: 1, name: 'Test Company' };
    const result = mapOrNull(input, (company) => company.name);
    expect(result).toBe('Test Company');
  });

  it('should handle complex objects', () => {
    const input = { id: 1, name: 'Test Company', location: 'NY' };
    const result = mapOrNull(input, (company) => ({
      ...company,
      country: 'USA',
    }));
    expect(result).toEqual({
      id: 1,
      name: 'Test Company',
      location: 'NY',
      country: 'USA',
    });
  });
});
