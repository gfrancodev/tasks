import { describe, it, expect } from 'vitest';
import { mapOrUndefined } from '../map-or-undefined-helper';

describe('mapOrUndefined', () => {
  it('should return undefined when input is undefined', () => {
    const result = mapOrUndefined(undefined, (item) => item);
    expect(result).toBeUndefined();
  });

  it('should return undefined when input is undefined', () => {
    const result = mapOrUndefined(undefined, (item) => item);
    expect(result).toBeUndefined();
  });

  it('should return the result of the mapper function if input is defined', () => {
    const input = { id: 1, name: 'Test Company' };
    const result = mapOrUndefined(input, (company) => company.name);
    expect(result).toBe('Test Company');
  });

  it('should handle complex objects', () => {
    const input = { id: 1, name: 'Test Company', location: 'NY' };
    const result = mapOrUndefined(input, (company) => ({
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
