import { describe, it, expect } from 'vitest';
import { binaryUUIDToString, normalizeUuid, stringToBinaryUUID } from '../binary-uuid-helper';
import { Buffer } from 'buffer';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('stringToBinaryUUID', () => {
  it('should convert string UUID to binary Buffer correctly', () => {
    const uuidBuffer = stringToBinaryUUID(validUUID);
    expect(uuidBuffer).toBeInstanceOf(Buffer);
    expect(uuidBuffer.length).toBe(16);
  });

  it('should throw an error when given an invalid UUID string', () => {
    const invalidUUID = 'invalid-uuid-string';
    expect(() => stringToBinaryUUID(invalidUUID)).toThrowError('Invalid UUID format');
  });

  it('should handle uppercase UUID strings', () => {
    const uppercaseUUID = validUUID.toUpperCase();
    const uuidBuffer = stringToBinaryUUID(uppercaseUUID);
    expect(uuidBuffer).toBeInstanceOf(Buffer);
    expect(uuidBuffer.length).toBe(16);
  });
});

describe('binaryUUIDToString', () => {
  it('should convert binary Buffer back to string UUID correctly', () => {
    const uuidBuffer = stringToBinaryUUID(validUUID);
    const uuidString = binaryUUIDToString(uuidBuffer);
    expect(uuidString).toBe(validUUID);
  });

  it('should throw an error when given a Buffer of incorrect length', () => {
    const invalidBuffer = Buffer.from([0x01, 0x02, 0x03]); // Buffer with length != 16
    expect(() => binaryUUIDToString(invalidBuffer)).toThrowError('Invalid Buffer length');
  });

  it('should handle multiple UUIDs correctly', () => {
    const uuidList = [
      '550e8400-e29b-41d4-a716-446655440000',
      '123e4567-e89b-12d3-a456-426614174000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ];

    uuidList.forEach((uuid) => {
      const uuidBuffer = stringToBinaryUUID(uuid);
      const uuidString = binaryUUIDToString(uuidBuffer);
      expect(uuidString).toBe(uuid.toLowerCase());
    });
  });

  it('should convert binary Buffer to string UUID correctly', () => {
    const uuidBuffer = Buffer.from('550e8400e29b41d4a716446655440000', 'hex');
    const result = binaryUUIDToString(uuidBuffer);
    expect(result).toBe(validUUID);
  });

  it('should throw an error when given an invalid Buffer', () => {
    expect(() => binaryUUIDToString('not a buffer' as any)).toThrowError('Invalid Buffer length');
  });

  it('should throw an error when given a Buffer of incorrect length', () => {
    const invalidBuffer = Buffer.from([0x01, 0x02, 0x03]);
    expect(() => binaryUUIDToString(invalidBuffer)).toThrowError('Invalid Buffer length');
  });
});

describe('normalizeUuid', () => {
  it('should return the UUID if it is already a string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const result = normalizeUuid(uuid);
    expect(result).toBe(uuid);
  });

  it('should convert a Buffer UUID to a string', () => {
    const uuidBuffer = Buffer.from('550e8400e29b41d4a716446655440000', 'hex');
    const expectedUuid = '550e8400-e29b-41d4-a716-446655440000';
    const result = normalizeUuid(uuidBuffer);
    expect(result).toBe(expectedUuid);
  });

  it('should throw an error if input is not a string or Buffer', () => {
    expect(() => normalizeUuid(123 as any)).toThrowError('Invalid UUID format');
  });

  it('should throw an error if the Buffer is not 16 bytes long', () => {
    const invalidBuffer = Buffer.from([0x01, 0x02, 0x03]); // Buffer com comprimento inválido
    expect(() => normalizeUuid(invalidBuffer)).toThrowError('Invalid Buffer length');
  });

  it('should handle a valid Buffer but return correct string', () => {
    const uuidBuffer = Buffer.from('f47ac10b58cc4372a5670e02b2c3d479', 'hex');
    const expectedUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const result = normalizeUuid(uuidBuffer);
    expect(result).toBe(expectedUuid);
  });

  it('should return the UUID if it is already a string', () => {
    const result = normalizeUuid(validUUID);
    expect(result).toBe(validUUID);
  });

  it('should convert a Buffer UUID to a string', () => {
    const uuidBuffer = Buffer.from('550e8400e29b41d4a716446655440000', 'hex');
    const result = normalizeUuid(uuidBuffer);
    expect(result).toBe(validUUID);
  });

  it('should throw an error if input is not a string or Buffer', () => {
    expect(() => normalizeUuid(123 as any)).toThrowError('Invalid UUID format');
  });

  it('should throw an error if the Buffer is not 16 bytes long', () => {
    const invalidBuffer = Buffer.from([0x01, 0x02, 0x03]);
    expect(() => normalizeUuid(invalidBuffer)).toThrowError('Invalid Buffer length');
  });
});
