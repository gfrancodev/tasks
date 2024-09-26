import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyMapper } from '../company-mapper';
import { CompanyEntity } from '../../entities/company-entity';
import { binaryUUIDToString } from 'src/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';

describe('CompanyMapper', () => {
  let validUUID: string;

  beforeEach(() => {
    validUUID = crypto.randomUUID();
  });

  describe('toDomain', () => {
    it('should correctly map raw data to CompanyEntity', () => {
      const rawCompany = {
        id: 1,
        uuid: validUUID,
        name: 'Test Company',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        users: [],
        tasks: [],
      };

      const companyEntity = CompanyMapper.toDomain(rawCompany);

      expect(companyEntity.id).toBe(1);
      expect(companyEntity.uuid).toBe(validUUID);
      expect(companyEntity.name).toBe('Test Company');
      expect(companyEntity.createdAt).toEqual(new Date('2023-01-01'));
      expect(companyEntity.updatedAt).toEqual(new Date('2023-01-02'));
      expect(companyEntity.users).toEqual([]);
      expect(companyEntity.tasks).toEqual([]);
    });
  });

  describe('toPersistence', () => {
    it('should correctly map CompanyEntity to persistence format', () => {
      const companyEntity: Partial<CompanyEntity> = {
        uuid: validUUID,
        name: 'Test Company',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const persistenceCompany = CompanyMapper.toPersistence(companyEntity);

      expect(persistenceCompany.uuid).toBeInstanceOf(Buffer);
      expect(binaryUUIDToString(persistenceCompany.uuid)).toBe(validUUID);
      expect(persistenceCompany.name).toBe('Test Company');
      expect(persistenceCompany.createdAt).toEqual(new Date('2023-01-01'));
      expect(persistenceCompany.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });

  describe('toResponse', () => {
    it('should correctly map CompanyEntity to response format', () => {
      const companyEntity: Partial<CompanyEntity> = {
        uuid: validUUID,
        name: 'Test Company',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        users: [{ uuid: 'user-uuid', email: 'user@example.com' } as any],
        tasks: [{ uuid: 'task-uuid', title: 'Task Title' } as any],
      };

      const responseCompany = CompanyMapper.toResponse(companyEntity as any);

      expect(responseCompany.uuid).toBe(validUUID);
      expect(responseCompany.name).toBe('Test Company');
      expect(responseCompany.createdAt).toEqual(new Date('2023-01-01'));
      expect(responseCompany.updatedAt).toEqual(new Date('2023-01-02'));
      expect(responseCompany.users).toEqual([{ uuid: 'user-uuid', email: 'user@example.com' }]);
      expect(responseCompany.tasks).toEqual([{ uuid: 'task-uuid', title: 'Task Title' }]);
    });
  });
});