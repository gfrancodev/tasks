import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteCompanyUseCase } from '../delete-company-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

describe('DeleteCompanyUseCase', () => {
  let deleteCompanyUseCase: DeleteCompanyUseCase;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepositoryMock);
  });

  describe('execute', () => {
    it('should delete a company successfully', async () => {
      const companyId = 'test-uuid';
      const company: CompanyEntity = {
        id: 1,
        uuid: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      companyRepositoryMock.delete.mockResolvedValue();

      await expect(deleteCompanyUseCase.execute(companyId)).resolves.not.toThrow();

      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(companyRepositoryMock.delete).toHaveBeenCalledWith(company.id);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(deleteCompanyUseCase.execute(companyId)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );

      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(companyRepositoryMock.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'test-uuid';
      const company: CompanyEntity = {
        id: 1,
        uuid: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await deleteCompanyUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await deleteCompanyUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const company: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      expect(() => deleteCompanyUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => deleteCompanyUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('deleteCompany', () => {
    it('should call companyRepository.delete with correct id', async () => {
      const companyId = 1;

      await deleteCompanyUseCase.deleteCompany(companyId);

      expect(companyRepositoryMock.delete).toHaveBeenCalledWith(companyId);
    });

    it('should throw an exception if deletion fails', async () => {
      const companyId = 1;

      companyRepositoryMock.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteCompanyUseCase.deleteCompany(companyId)).rejects.toThrow(Error);
    });
  });
});
