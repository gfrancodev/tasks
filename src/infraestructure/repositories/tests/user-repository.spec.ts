import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../user-repository';
import { PrismaClient } from '@prisma/client';
import { UserMapper } from 'src/domain/mappers/user-mapper';
import { RoleEnum } from 'src/domain/enums/role-enum';
import { stringToBinaryUUID } from 'src/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';
import { Exception } from '../../exceptions/builder/exception';

type MockPrismaClient = {
  [K in keyof PrismaClient]: jest.Mock;
} & {
  user: {
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findUnique: jest.Mock;
  };
};

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let prismaClientMock: MockPrismaClient;
  let validUUID: string;

  beforeEach(() => {
    prismaClientMock = {
      user: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
    } as unknown as MockPrismaClient;

    userRepository = new UserRepository(prismaClientMock as unknown as PrismaClient);
    validUUID = crypto.randomUUID();
  });

  describe('findByCompanyWithPagination', () => {
    it('should return paginated users and total count', async () => {
      const mockUsers = [
        { id: 1, fullName: 'User 1', uuid: validUUID },
        { id: 2, fullName: 'User 2', uuid: validUUID },
      ] as any;
      prismaClientMock.user.findMany.mockResolvedValue(mockUsers);
      prismaClientMock.user.count.mockResolvedValue(10);

      const result = await userRepository.findByCompanyWithPagination(1, 1, 2);

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(prismaClientMock.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
        include: { company: true },
      });
    });

    it('should return an empty list if there are no users', async () => {
      prismaClientMock.user.findMany.mockResolvedValue([]);
      prismaClientMock.user.count.mockResolvedValue(0);

      const result = await userRepository.findByCompanyWithPagination(1, 1, 10);

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw an exception if findByCompanyWithPagination fails', async () => {
      prismaClientMock.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByCompanyWithPagination(1, 1, 10)).rejects.toThrow(Exception);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, fullName: 'New User', role: RoleEnum.USER, uuid: validUUID } as any;
      prismaClientMock.user.create.mockResolvedValue(mockUser);

      const result = await userRepository.create(1, { fullName: 'New User' });

      expect(result).toEqual(UserMapper.toDomain(mockUser));
      expect(prismaClientMock.user.create).toHaveBeenCalled();
    });

    it('should throw an exception if creation fails', async () => {
      prismaClientMock.user.create.mockRejectedValue(new Error('Creation error'));

      await expect(userRepository.create(1, { fullName: 'New User' })).rejects.toThrow(Exception);
    });
  });

  describe('findAll', () => {
    it('should return all users of a company', async () => {
      const mockUsers = [
        { id: 1, fullName: 'User 1', companyId: 1, uuid: stringToBinaryUUID(validUUID) },
        { id: 2, fullName: 'User 2', companyId: 1, uuid: stringToBinaryUUID(validUUID) },
      ] as any;
      prismaClientMock.user.findMany.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll(1);

      expect(result).toHaveLength(2);
      expect(prismaClientMock.user.findMany).toHaveBeenCalledWith({
        where: { companyId: 1 },
        include: { company: true },
      });
    });

    it('should return an empty list if no users are found', async () => {
      prismaClientMock.user.findMany.mockResolvedValue([]);

      const result = await userRepository.findAll(1);

      expect(result).toHaveLength(0);
    });

    it('should throw an exception if findAll fails', async () => {
      prismaClientMock.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findAll(1)).rejects.toThrow(Exception);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = { id: 1, fullName: 'User 1', uuid: validUUID } as any;
      prismaClientMock.user.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findById(1, 1);

      expect(result).toEqual(UserMapper.toDomain(mockUser));
      expect(prismaClientMock.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1, companyId: 1 },
        include: { company: true },
      });
    });

    it('should return null if user is not found', async () => {
      prismaClientMock.user.findFirst.mockResolvedValue(null);

      const result = await userRepository.findById(1, 999);

      expect(result).toBeNull();
    });

    it('should throw an exception if findById fails', async () => {
      prismaClientMock.user.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findById(1, 1)).resolves.toBeNull();
    });
  });

  describe('findByUUID', () => {
    it('should find a user by UUID', async () => {
      const mockUser = { id: 1, fullName: 'User 1', uuid: validUUID } as any;
      prismaClientMock.user.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findByUUID(1, validUUID);

      expect(result).toEqual(UserMapper.toDomain(mockUser));
      expect(prismaClientMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          uuid: stringToBinaryUUID(validUUID),
          companyId: 1,
        },
        include: { company: true },
      });
    });

    it('should return null if user is not found by UUID', async () => {
      prismaClientMock.user.findFirst.mockResolvedValue(null);

      const result = await userRepository.findByUUID(1, validUUID);

      expect(result).toBeNull();
    });

    it('should return null if findByUUID fails', async () => {
      const errorMessage = 'Database error';
      prismaClientMock.user.findFirst.mockRejectedValue(new Error(errorMessage));

      const result = await userRepository.findByUUID(1, validUUID);

      expect(result).toBeNull();
      expect(prismaClientMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          uuid: stringToBinaryUUID(validUUID),
          companyId: 1,
        },
        include: { company: true },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockUser = { id: 1, fullName: 'Updated User', uuid: validUUID } as any;
      prismaClientMock.user.update.mockResolvedValue(mockUser);

      const result = await userRepository.update(1, 1, { fullName: 'Updated User' });

      expect(result).toEqual(UserMapper.toDomain(mockUser));
      expect(prismaClientMock.user.update).toHaveBeenCalled();
    });

    it('should throw an exception if update fails', async () => {
      prismaClientMock.user.update.mockRejectedValue(new Error('Update error'));

      await expect(userRepository.update(1, 1, { fullName: 'Updated User' })).rejects.toThrow(
        Exception,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      prismaClientMock.user.delete.mockResolvedValue({} as any);

      await userRepository.delete(1, 1);

      expect(prismaClientMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1, companyId: 1 },
      });
    });

    it('should throw an exception if delete fails', async () => {
      prismaClientMock.user.delete.mockRejectedValue(new Error('Delete error'));

      await expect(userRepository.delete(1, 1)).rejects.toThrow(Exception);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com', uuid: validUUID } as any;
      prismaClientMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(UserMapper.toDomain(mockUser));
      expect(prismaClientMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { company: true },
      });
    });

    it('should return null if user is not found by email', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should throw an exception if findByEmail fails', async () => {
      prismaClientMock.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByEmail('test@example.com')).resolves.toBeNull();
    });
  });

  describe('updateRole', () => {
    it("should update a user's role", async () => {
      const mockUser = { id: 1, role: RoleEnum.ADMIN, uuid: validUUID } as any;
      prismaClientMock.user.update.mockResolvedValue(mockUser);

      const result = await userRepository.updateRole(1, 1, RoleEnum.ADMIN);

      expect(result).toEqual(UserMapper.toDomain(mockUser));
      expect(prismaClientMock.user.update).toHaveBeenCalledWith({
        where: { id: 1, companyId: 1 },
        data: { role: RoleEnum.ADMIN },
        include: { company: true },
      });
    });

    it('should throw an exception if role update fails', async () => {
      prismaClientMock.user.update.mockRejectedValue(new Error('Role update error'));

      await expect(userRepository.updateRole(1, 1, RoleEnum.ADMIN)).rejects.toThrow(Exception);
    });
  });

  describe('findByCompanyAndRole', () => {
    it('should find users by company and role', async () => {
      const mockUsers = [
        { id: 1, role: RoleEnum.USER, uuid: validUUID },
        { id: 2, role: RoleEnum.USER, uuid: validUUID },
      ] as any;
      prismaClientMock.user.findMany.mockResolvedValue(mockUsers);

      const result = await userRepository.findByCompanyAndRole(1, RoleEnum.USER);

      expect(result).toHaveLength(2);
      expect(prismaClientMock.user.findMany).toHaveBeenCalledWith({
        where: { companyId: 1, role: RoleEnum.USER },
        include: { company: true },
      });
    });

    it('should return an empty list if no users with the specified role are found', async () => {
      prismaClientMock.user.findMany.mockResolvedValue([]);

      const result = await userRepository.findByCompanyAndRole(1, RoleEnum.ADMIN);

      expect(result).toHaveLength(0);
    });

    it('should throw an exception if findByCompanyAndRole fails', async () => {
      prismaClientMock.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByCompanyAndRole(1, RoleEnum.USER)).resolves.toHaveLength(0);
    });
  });
});
