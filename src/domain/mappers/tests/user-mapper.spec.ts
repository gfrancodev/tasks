import { describe, it, expect, beforeEach } from 'vitest';
import { UserMapper } from '../user-mapper';
import { UserEntity } from '../../entities/user-entity';
import { RoleEnum } from '../../enums/role-enum';
import {
  binaryUUIDToString,
  stringToBinaryUUID,
} from '@/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';

describe('UserMapper', () => {
  let validUUID: string;

  beforeEach(() => {
    validUUID = crypto.randomUUID();
  });

  describe('toDomain', () => {
    it('should correctly map raw data to UserEntity', () => {
      const rawUser = {
        id: 1,
        uuid: validUUID,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        companyId: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const userEntity = UserMapper.toDomain(rawUser);

      expect(userEntity.id).toBe(1);
      expect(userEntity.uuid).toBe(validUUID);
      expect(userEntity.email).toBe('test@example.com');
      expect(userEntity.password).toBe('hashedPassword');
      expect(userEntity.role).toBe(RoleEnum.USER);
      expect(userEntity.companyId).toBe(1);
      expect(userEntity.createdAt).toEqual(new Date('2023-01-01'));
      expect(userEntity.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });

  describe('toPersistence', () => {
    it('should correctly map UserEntity to persistence format', () => {
      const userEntity: Partial<UserEntity> = {
        uuid: validUUID,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: RoleEnum.USER,
        companyId: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const persistenceUser = UserMapper.toPersistence(userEntity);

      expect(persistenceUser.uuid).toBeInstanceOf(Buffer);
      expect(binaryUUIDToString(persistenceUser.uuid)).toBe(validUUID);
      expect(persistenceUser.email).toBe('test@example.com');
      expect(persistenceUser.password).toBe('hashedPassword');
      expect(persistenceUser.role).toBe('USER');
      expect(persistenceUser.companyId).toBe(1);
      expect(persistenceUser.createdAt).toEqual(new Date('2023-01-01'));
      expect(persistenceUser.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });

  describe('toResponse', () => {
    it('should correctly map UserEntity to response format', () => {
      const userEntity: Partial<UserEntity> = {
        uuid: validUUID,
        email: 'test@example.com',
        password: 'password-hashed',
        role: RoleEnum.USER,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const responseUser = UserMapper.toResponse(userEntity) as any;

      expect(responseUser.id).toBe(validUUID);
      expect(responseUser.email).toBe('test@example.com');
      expect(responseUser.role).toBe('USER');
      expect(responseUser.createdAt).toEqual(new Date('2023-01-01'));
      expect(responseUser.updatedAt).toEqual(new Date('2023-01-02'));
      expect(responseUser.password).toBeUndefined();
    });

    it('should map user to response format with company and tasks', () => {
      const mockUser = {
        id: 1,
        uuid: stringToBinaryUUID('550e8400-e29b-41d4-a716-446655440000'),
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: RoleEnum.USER,
        company: {
          id: 1,
          uuid: stringToBinaryUUID('660e8400-e29b-41d4-a716-446655440000'),
          name: 'Test Company',
        },
        tasks: [
          {
            id: 1,
            uuid: stringToBinaryUUID('770e8400-e29b-41d4-a716-446655440000'),
            title: 'Test Task',
          },
        ],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const result = UserMapper.toResponse(mockUser);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: RoleEnum.USER,
        company: {
          id: '660e8400-e29b-41d4-a716-446655440000',
          name: 'Test Company',
        },
        tasks: [
          {
            id: '770e8400-e29b-41d4-a716-446655440000',
            title: 'Test Task',
          },
        ],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      });
    });

    it('should map user to response format without company and tasks', () => {
      const mockUser = {
        id: 1,
        uuid: stringToBinaryUUID('550e8400-e29b-41d4-a716-446655440000'),
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: RoleEnum.USER,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const result = UserMapper.toResponse(mockUser);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: RoleEnum.USER,
        company: undefined,
        tasks: [],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      });
    });
  });
});
