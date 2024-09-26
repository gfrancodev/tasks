import { Buffer } from 'buffer';
import { isUUID } from 'class-validator';

export function binaryUUIDToString(buffer: Buffer): string {
  if (!Buffer.isBuffer(buffer) || buffer.length !== 16) {
    throw new Error('Invalid Buffer length');
  }
  const hex = buffer.toString('hex');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ]
    .join('-')
    .toLowerCase();
}

export function stringToBinaryUUID(uuid: string): Buffer {
  if (!isUUID(uuid)) {
    throw new Error('Invalid UUID format');
  }
  const hex = uuid.replace(/-/g, '').toLowerCase();
  return Buffer.from(hex, 'hex');
}

export function normalizeUuid(uuid: any): string {
  if (typeof uuid === 'string') return uuid;

  if (Buffer.isBuffer(uuid)) return binaryUUIDToString(uuid);

  throw new Error('Invalid UUID format');
}
