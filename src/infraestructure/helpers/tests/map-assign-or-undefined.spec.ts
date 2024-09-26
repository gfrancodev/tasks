import { describe, it, expect, vi } from 'vitest';
import { mapAssignedToOrUndefined } from '../map-assign-or-undefined-helper';

describe('mapAssignedToOrUndefined', () => {
  it('should map the input if it is defined', () => {
    const input = { uuid: '1234', email: 'test@example.com' };

    const result = mapAssignedToOrUndefined(input, (assignedTo) => ({
      uuid: assignedTo.uuid,
      email: assignedTo.email,
    }));

    expect(result).toEqual({ uuid: '1234', email: 'test@example.com' });
  });

  it('should return undefined if input is null', () => {
    const result = mapAssignedToOrUndefined(null, (assignedTo) => ({
      uuid: assignedTo.uuid,
      email: assignedTo.email,
    }));

    expect(result).toBeUndefined();
  });

  it('should return undefined if input is undefined', () => {
    const result = mapAssignedToOrUndefined(undefined, (assignedTo) => ({
      uuid: assignedTo.uuid,
      email: assignedTo.email,
    }));

    expect(result).toBeUndefined();
  });

  it('should not call the mapper function if input is undefined', () => {
    const mapper = vi.fn();
    mapAssignedToOrUndefined(undefined, mapper);

    expect(mapper).not.toHaveBeenCalled();
  });

  it('should not call the mapper function if input is null', () => {
    const mapper = vi.fn();
    mapAssignedToOrUndefined(null, mapper);

    expect(mapper).not.toHaveBeenCalled();
  });

  it('should call the mapper function if input is defined', () => {
    const input = { uuid: '1234', email: 'test@example.com' };
    const mapper = vi.fn((assignedTo) => ({
      uuid: assignedTo.uuid,
      email: assignedTo.email,
    }));

    mapAssignedToOrUndefined(input, mapper);

    expect(mapper).toHaveBeenCalledWith(input);
  });
});
