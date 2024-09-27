import { describe, it, expect, beforeEach } from 'vitest';
import { ListCompanyUseCase } from '../list-company-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CompanyMapper } from '@/domain/mappers';

describe('ListCompanyUseCase', () => {
  let listCompanyUseCase: ListCompanyUseCase;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    listCompanyUseCase = new ListCompanyUseCase(companyRepositoryMock);
  });

  describe('execute', () => {
    it('should list companies with default pagination', async () => {
      const mockCompanies: CompanyEntity[] = [
        { id: 1, uuid: 'uuid1', name: 'Company 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, uuid: 'uuid2', name: 'Company 2', createdAt: new Date(), updatedAt: new Date() },
      ] as any;
      companyRepositoryMock.findWithPagination.mockResolvedValue({
        companies: mockCompanies,
        total: 2,
      });

      const result = await listCompanyUseCase.execute();

      expect(result).toEqual(
        CompanyMapper.toResponseWithPagination({
          total: 2,
          current_page: 1,
          per_page: 10,
          in_page: 2,
          data: mockCompanies,
        }),
      );
      expect(companyRepositoryMock.findWithPagination).toHaveBeenCalledWith(1, 10);
    });

    it('should list companies with custom pagination', async () => {
      const mockCompanies: CompanyEntity[] = [
        { id: 1, uuid: 'uuid1', name: 'Company 1', createdAt: new Date(), updatedAt: new Date() },
      ] as any;
      companyRepositoryMock.findWithPagination.mockResolvedValue({
        companies: mockCompanies,
        total: 1,
      });

      const result = await listCompanyUseCase.execute(2, 5);

      expect(result).toEqual(
        CompanyMapper.toResponseWithPagination({
          total: 1,
          current_page: 2,
          per_page: 5,
          in_page: 1,
          data: mockCompanies,
        }),
      );
      expect(companyRepositoryMock.findWithPagination).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('findCompanys', () => {
    it('should call companyRepository.findWithPagination with correct parameters', async () => {
      companyRepositoryMock.findWithPagination.mockResolvedValue({ companies: [], total: 0 });

      await (listCompanyUseCase as any).findCompanys(2, 5);

      expect(companyRepositoryMock.findWithPagination).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('countCompanysReturned', () => {
    it('should return the correct count of companies', () => {
      const mockCompanies: CompanyEntity[] = [
        { id: 1, uuid: 'uuid1', name: 'Company 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, uuid: 'uuid2', name: 'Company 2', createdAt: new Date(), updatedAt: new Date() },
      ] as any;

      const result = (listCompanyUseCase as any).countCompanysReturned(mockCompanies);

      expect(result).toBe(2);
    });
  });

  describe('validatePage', () => {
    it('should return the provided page number when valid', () => {
      const result = (listCompanyUseCase as any).validatePage(5);
      expect(result).toBe(5);
    });

    it('should return the default page number when input is invalid', () => {
      expect((listCompanyUseCase as any).validatePage(0)).toBe(1);
      expect((listCompanyUseCase as any).validatePage(-1)).toBe(1);
      expect((listCompanyUseCase as any).validatePage(undefined)).toBe(1);
    });
  });

  describe('validatePageSize', () => {
    it('should return the provided page size when valid', () => {
      const result = (listCompanyUseCase as any).validatePageSize(20);
      expect(result).toBe(20);
    });

    it('should return the default page size when input is invalid', () => {
      expect((listCompanyUseCase as any).validatePageSize(0)).toBe(10);
      expect((listCompanyUseCase as any).validatePageSize(-1)).toBe(10);
      expect((listCompanyUseCase as any).validatePageSize(undefined)).toBe(10);
    });
  });
});
