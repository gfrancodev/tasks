import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompanyRepository } from '../company-repository';
import { PrismaClient } from '@prisma/client';
import { CompanyMapper } from 'src/domain/mappers/company-mapper';
import { stringToBinaryUUID } from 'src/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';
import { Exception } from '../../exceptions/builder/exception';

type MockPrismaClient = {
  [K in keyof PrismaClient]: jest.Mock;
} & {
  company: {
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findUnique: jest.Mock;
  };
};

describe('CompanyRepository', () => {
  let companyRepository: CompanyRepository;
  let prismaClientMock: MockPrismaClient;
  let validUUID: string;

  beforeEach(() => {
    prismaClientMock = {
      company: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
    } as unknown as MockPrismaClient;

    companyRepository = new CompanyRepository(prismaClientMock as unknown as PrismaClient);
    validUUID = crypto.randomUUID();
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockCompanies = [
        { id: 1, name: 'Company 1', uuid: stringToBinaryUUID(validUUID) },
        { id: 2, name: 'Company 2', uuid: stringToBinaryUUID(validUUID) },
      ] as any;
      prismaClientMock.company.findMany.mockResolvedValue(mockCompanies);

      const result = await companyRepository.findAll();

      expect(result).toHaveLength(2);
      expect(prismaClientMock.company.findMany).toHaveBeenCalled();
    });

    it('should return an empty list if no companies are found', async () => {
      prismaClientMock.company.findMany.mockResolvedValue([]);

      const result = await companyRepository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const mockCompany = { id: 1, name: 'New Company', uuid: validUUID } as any;
      prismaClientMock.company.create.mockResolvedValue(mockCompany);

      const result = await companyRepository.create({ name: 'New Company' });

      expect(result).toEqual(CompanyMapper.toDomain(mockCompany));
      expect(prismaClientMock.company.create).toHaveBeenCalled();
    });

    it('should throw an exception if creation fails', async () => {
      prismaClientMock.company.create.mockRejectedValue(new Error('Creation error'));

      await expect(companyRepository.create({ name: 'New Company' })).rejects.toThrow(Exception);
    });
  });

  describe('findById', () => {
    it('should find a company by id', async () => {
      const mockCompany = { id: 1, name: 'Company 1', uuid: stringToBinaryUUID(validUUID) } as any;
      prismaClientMock.company.findUnique.mockResolvedValue(mockCompany);

      const result = await companyRepository.findById(1);

      expect(result).toEqual(CompanyMapper.toDomain(mockCompany));
      expect(prismaClientMock.company.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          tasks: true,
          users: true,
        },
      });
    });

    it('should return null if company is not found', async () => {
      prismaClientMock.company.findUnique.mockResolvedValue(null);

      const result = await companyRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUUID', () => {
    it('should find a company by UUID', async () => {
      const mockCompany = { id: 1, name: 'Company 1', uuid: validUUID } as any;
      prismaClientMock.company.findFirst.mockResolvedValue(mockCompany);

      const result = await companyRepository.findByUUID(validUUID);

      expect(result.id).toBe(mockCompany.id);
      expect(result.name).toBe(mockCompany.name);
      expect(result.uuid).toBe(validUUID);
      expect(prismaClientMock.company.findFirst).toHaveBeenCalledWith({
        where: {
          uuid: stringToBinaryUUID(validUUID),
        },
        include: {
          tasks: true,
          users: true,
        },
      });
    });

    it('should return null if company is not found by UUID', async () => {
      prismaClientMock.company.findFirst.mockResolvedValue(null);

      const result = await companyRepository.findByUUID(validUUID);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const mockCompany = { id: 1, name: 'Updated Company', uuid: validUUID } as any;
      prismaClientMock.company.update.mockResolvedValue(mockCompany);

      const result = await companyRepository.update(1, { name: 'Updated Company' });

      expect(result).toEqual(CompanyMapper.toDomain(mockCompany));
      expect(prismaClientMock.company.update).toHaveBeenCalled();
    });

    it('should throw an exception if update fails', async () => {
      prismaClientMock.company.update.mockRejectedValue(new Error('Update error'));

      await expect(companyRepository.update(1, { name: 'Updated Company' })).rejects.toThrow(
        Exception,
      );
    });
  });

  describe('delete', () => {
    it('should delete a company', async () => {
      prismaClientMock.company.delete.mockResolvedValue({} as any);

      await companyRepository.delete(1);

      expect(prismaClientMock.company.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an exception if delete fails', async () => {
      prismaClientMock.company.delete.mockRejectedValue(new Error('Delete error'));

      await expect(companyRepository.delete(1)).rejects.toThrow(Exception);
    });
  });
});
