import { describe, it, expect, beforeEach } from 'vitest';
import { GetCompanyUseCase } from '../get-company-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CompanyMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

describe('GetCompanyUseCase', () => {
  let getCompanyUseCase: GetCompanyUseCase;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    getCompanyUseCase = new GetCompanyUseCase(companyRepositoryMock);
  });

  describe('execute', () => {
    it('should get a company successfully', async () => {
      const companyId = 'test-uuid';
      const mockCompany: CompanyEntity = {
        id: 1,
        uuid: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(mockCompany);

      const result = await getCompanyUseCase.execute(companyId);

      expect(result).toEqual(CompanyMapper.toResponseWithoutRelations(mockCompany));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(getCompanyUseCase.execute(companyId)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should call companyRepository.findByUUID with correct id', async () => {
      const companyId = 'test-uuid';
      const mockCompany: CompanyEntity = {
        id: 1,
        uuid: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(mockCompany);

      const result = await getCompanyUseCase.getCompanyById(companyId);

      expect(result).toEqual(mockCompany);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null if company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await getCompanyUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception if company is found', () => {
      const mockCompany: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      expect(() => getCompanyUseCase.checkIfCompanyFound(mockCompany)).not.toThrow();
    });

    it('should throw an exception if company is not found', () => {
      expect(() => getCompanyUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });
});
