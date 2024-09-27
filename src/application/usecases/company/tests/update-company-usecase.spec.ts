import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateCompanyUseCase } from '../update-company-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { UpdateCompanyDto } from '../../../dtos/update-company-dto';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { CompanyMapper } from '@/domain/mappers';

describe('UpdateCompanyUseCase', () => {
  let updateCompanyUseCase: UpdateCompanyUseCase;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    updateCompanyUseCase = new UpdateCompanyUseCase(companyRepositoryMock);
  });

  describe('execute', () => {
    it('should update a company successfully', async () => {
      const companyId = 'test-uuid';
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };
      const existingCompany: CompanyEntity = {
        id: 1,
        uuid: companyId,
        name: 'Original Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      const updatedCompany: CompanyEntity = { ...existingCompany, name: 'Updated Company' };

      companyRepositoryMock.findByUUID.mockResolvedValue(existingCompany);
      companyRepositoryMock.findByName.mockResolvedValue(null);
      companyRepositoryMock.update.mockResolvedValue(updatedCompany);

      const result = await updateCompanyUseCase.execute(companyId, updateCompanyDto);

      expect(result).toEqual(CompanyMapper.toResponseWithoutRelations(updatedCompany));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(companyRepositoryMock.findByName).toHaveBeenCalledWith(updateCompanyDto.name);
      expect(companyRepositoryMock.update).toHaveBeenCalledWith(
        existingCompany.id,
        expect.any(Object),
      );
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(updateCompanyUseCase.execute(companyId, updateCompanyDto)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });

    it('should throw an exception if company name already exists', async () => {
      const companyId = 'test-uuid';
      const updateCompanyDto: UpdateCompanyDto = { name: 'Existing Company' };
      const existingCompany: CompanyEntity = {
        id: 1,
        uuid: companyId,
        name: 'Original Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      const duplicateCompany: CompanyEntity = {
        id: 2,
        uuid: 'another-uuid',
        name: 'Existing Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(existingCompany);
      companyRepositoryMock.findByName.mockResolvedValue(duplicateCompany);

      await expect(updateCompanyUseCase.execute(companyId, updateCompanyDto)).rejects.toThrow(
        new Exception(CompanyErrors.DUPLICATE_ENTRY),
      );
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

      expect(() => updateCompanyUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => updateCompanyUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getCompanyByName', () => {
    it('should return a company when found by name', async () => {
      const companyName = 'Test Company';
      const company: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: companyName,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByName.mockResolvedValue(company);

      const result = await updateCompanyUseCase.getCompanyByName(companyName);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByName).toHaveBeenCalledWith(companyName);
    });

    it('should return null when company is not found by name', async () => {
      const companyName = 'Non-existent Company';

      companyRepositoryMock.findByName.mockResolvedValue(null);

      const result = await updateCompanyUseCase.getCompanyByName(companyName);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByName).toHaveBeenCalledWith(companyName);
    });
  });

  describe('checkIfCompanyNameIfUpdateName', () => {
    it('should return company when name is provided in update data', async () => {
      const updateCompanyDto: UpdateCompanyDto = { name: 'New Company Name' };
      const company: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'New Company Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.findByName.mockResolvedValue(company);

      const result = await updateCompanyUseCase.checkIfCompanyNameIfUpdateName(updateCompanyDto);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByName).toHaveBeenCalledWith(updateCompanyDto.name);
    });

    it('should return null when name is not provided in update data', async () => {
      const updateCompanyDto: UpdateCompanyDto = {};

      const result = await updateCompanyUseCase.checkIfCompanyNameIfUpdateName(updateCompanyDto);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByName).not.toHaveBeenCalled();
    });
  });

  describe('checkIfCompanyAlreadyExist', () => {
    it('should not throw an exception when company does not exist', () => {
      expect(() => updateCompanyUseCase.checkIfCompanyAlreadyExist(null)).not.toThrow();
    });

    it('should throw an exception when company already exists', () => {
      const company: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Existing Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      expect(() => updateCompanyUseCase.checkIfCompanyAlreadyExist(company)).toThrow(
        new Exception(CompanyErrors.DUPLICATE_ENTRY),
      );
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully', async () => {
      const existingCompany: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Original Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };
      const updatedCompany: CompanyEntity = { ...existingCompany, name: 'Updated Company' };

      companyRepositoryMock.update.mockResolvedValue(updatedCompany);

      const result = await updateCompanyUseCase.updateCompany(existingCompany, updateCompanyDto);

      expect(result).toEqual(updatedCompany);
      expect(companyRepositoryMock.update).toHaveBeenCalledWith(
        existingCompany.id,
        expect.any(Object),
      );
    });

    it('should throw an exception if update fails', async () => {
      const existingCompany: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Original Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };

      companyRepositoryMock.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        updateCompanyUseCase.updateCompany(existingCompany, updateCompanyDto),
      ).rejects.toThrow(Error);
    });
  });
});
