import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { CompanyRepository } from '../company-repository';
import { PrismaClient } from '@prisma/client';
import { CompanyMapper } from '@/domain/mappers/company-mapper';
import { stringToBinaryUUID } from '@/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';
import { Exception } from '../../exceptions/builder/exception';

type MockPrismaClient = {
  [K in keyof PrismaClient]: Mock;
} & {
  company: {
    findMany: Mock;
    count: Mock;
    create: Mock;
    findFirst: Mock;
    update: Mock;
    delete: Mock;
    findUnique: Mock;
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

    it('should throw an exception if findAll fails', async () => {
      prismaClientMock.company.findMany.mockRejectedValue(new Error('Database error'));

      await expect(companyRepository.findAll()).rejects.toThrow(Exception);
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

    it('should return null if findById fails', async () => {
      prismaClientMock.company.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await companyRepository.findById(1);

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

    it('should return null if findByUUID fails', async () => {
      prismaClientMock.company.findFirst.mockRejectedValue(new Error('Database error'));

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

  describe('findByName', () => {
    it('should find a company by name', async () => {
      const mockCompany = { id: 1, name: 'Test Company', uuid: validUUID } as any;
      prismaClientMock.company.findUnique.mockResolvedValue(mockCompany);

      const result = await companyRepository.findByName('Test Company');

      expect(result).toEqual(CompanyMapper.toDomain(mockCompany));
      expect(prismaClientMock.company.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Company' },
        include: { users: true, tasks: true },
      });
    });

    it('should return null if company is not found by name', async () => {
      prismaClientMock.company.findUnique.mockResolvedValue(null);

      const result = await companyRepository.findByName('Non-existent Company');

      expect(result).toBeNull();
    });

    it('should return null if findByName fails', async () => {
      prismaClientMock.company.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await companyRepository.findByName('Test Company');

      expect(result).toBeNull();
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated companies and total count', async () => {
      const mockCompanies = [
        { id: 1, name: 'Company 1', uuid: validUUID },
        { id: 2, name: 'Company 2', uuid: validUUID },
      ] as any;
      prismaClientMock.company.findMany.mockResolvedValue(mockCompanies);
      prismaClientMock.company.count.mockResolvedValue(10);

      const result = await companyRepository.findWithPagination(1, 2);

      expect(result.companies).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(prismaClientMock.company.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
        include: { users: true, tasks: true },
      });
      expect(prismaClientMock.company.count).toHaveBeenCalled();
    });

    it('should throw an exception if findWithPagination fails', async () => {
      prismaClientMock.company.findMany.mockRejectedValue(new Error('Database error'));

      await expect(companyRepository.findWithPagination(1, 10)).rejects.toThrow(Exception);
    });
  });
});
