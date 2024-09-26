import { describe, it, expect } from 'vitest';
import { mapOrEmpty } from '../map-or-empity-helper'; // Ajuste o caminho para sua função

describe('mapOrEmpty', () => {
  it('should return an empty array when input is null', () => {
    const result = mapOrEmpty(null, (item) => item);
    expect(result).toEqual([]);
  });

  it('should return an empty array when input is undefined', () => {
    const result = mapOrEmpty(undefined, (item) => item);
    expect(result).toEqual([]);
  });

  it('should return an empty array when input is an empty array', () => {
    const result = mapOrEmpty([], (item) => item);
    expect(result).toEqual([]);
  });

  it('should apply the mapper function to each item in the array', () => {
    const input = [1, 2, 3];
    const result = mapOrEmpty(input, (item) => item * 2);
    expect(result).toEqual([2, 4, 6]);
  });

  it('should handle arrays with complex objects', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = mapOrEmpty(input, (item) => ({ ...item, name: `Task ${item.id}` }));
    expect(result).toEqual([
      { id: 1, name: 'Task 1' },
      { id: 2, name: 'Task 2' },
      { id: 3, name: 'Task 3' },
    ]);
  });

  it('should return the result of the mapper function for non-empty arrays', () => {
    const input = ['a', 'b', 'c'];
    const result = mapOrEmpty(input, (item) => item.toUpperCase());
    expect(result).toEqual(['A', 'B', 'C']);
  });
});
