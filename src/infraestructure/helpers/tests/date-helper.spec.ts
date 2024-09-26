import { describe, it, expect } from 'vitest';
import { dateToISO, isoToDate } from '../date-helper';

describe('dateToISO', () => {
  it('should convert a Date object to an ISO string', () => {
    const date = new Date('2024-09-25T10:00:00Z');
    const isoString = dateToISO(date);

    expect(isoString).toBe('2024-09-25T10:00:00.000Z');
  });

  it('should handle a date without time part correctly', () => {
    const date = new Date('2024-09-25');
    const isoString = dateToISO(date);

    expect(isoString).toBe('2024-09-25T00:00:00.000Z');
  });
});

describe('isoToDate', () => {
  it('should convert an ISO string to a Date object', () => {
    const isoString = '2024-09-25T10:00:00.000Z';
    const date = isoToDate(isoString);

    expect(date.toISOString()).toBe(isoString);
    expect(date instanceof Date).toBe(true);
  });

  it('should handle ISO strings without time part correctly', () => {
    const isoString = '2024-09-25T00:00:00.000Z';
    const date = isoToDate(isoString);

    expect(date.toISOString()).toBe(isoString);
    expect(date instanceof Date).toBe(true);
  });

  it('should return an Invalid Date if the string is not a valid ISO format', () => {
    const invalidISOString = 'invalid-date';
    const date = isoToDate(invalidISOString);

    expect(isNaN(date.getTime())).toBe(true);
  });
});
