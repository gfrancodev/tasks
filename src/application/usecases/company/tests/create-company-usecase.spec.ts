import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCompanyUseCase } from '../create-company-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CreateCompanyDto } from '../../../dtos/create-company-dto';
import { CompanyFactory } from '@/domain/factories';
import { CompanyMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

describe('CreateCompanyUseCase', () => {
  let createCompanyUseCase: CreateCompanyUseCase;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    createCompanyUseCase = new CreateCompanyUseCase(companyRepositoryMock);
  });

  describe('execute', () => {
    it('should create a company successfully', async () => {
      const createCompanyDto: CreateCompanyDto = { name: 'Test Company' };
      const createdCompany: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.create.mockResolvedValue(createdCompany);

      const result = await createCompanyUseCase.execute(createCompanyDto);

      expect(result).toEqual(CompanyMapper.toResponseWithoutRelations(createdCompany));
      expect(companyRepositoryMock.create).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw an exception if company creation fails', async () => {
      const createCompanyDto: CreateCompanyDto = { name: 'Test Company' };

      companyRepositoryMock.create.mockRejectedValue(new Error('Database error'));

      await expect(createCompanyUseCase.execute(createCompanyDto)).rejects.toThrow(Error);
    });
  });

  describe('checkIfCompanyAlreadyExists', () => {
    it('should throw an exception if company already exists', () => {
      const existingCompany: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Existing Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      expect(() => createCompanyUseCase.checkIfCompanyAlreadyExists(existingCompany)).toThrow(
        new Exception(CompanyErrors.DUPLICATE_ENTRY),
      );
    });

    it('should not throw an exception if company does not exist', () => {
      expect(() => createCompanyUseCase.checkIfCompanyAlreadyExists(null)).not.toThrow();
    });
  });

  describe('createCompanyData', () => {
    it('should create company data using CompanyFactory', () => {
      const createCompanyDto: CreateCompanyDto = { name: 'Test Company' };
      const result = createCompanyUseCase.createCompanyData(createCompanyDto);
      const companyFactory = CompanyFactory.create(createCompanyDto);
      expect(result).toEqual(
        expect.objectContaining({
          name: companyFactory.name,
        }),
      );
    });
  });

  describe('createCompany', () => {
    it('should call companyRepository.create with correct data', async () => {
      const companyData: Partial<CompanyEntity> = { name: 'Test Company' };
      const createdCompany: CompanyEntity = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      companyRepositoryMock.create.mockResolvedValue(createdCompany);

      const result = await createCompanyUseCase.createCompany(companyData);

      expect(result).toEqual(createdCompany);
      expect(companyRepositoryMock.create).toHaveBeenCalledWith(companyData);
    });

    it('should throw an exception if company creation fails', async () => {
      const companyData: Partial<CompanyEntity> = { name: 'Test Company' };

      companyRepositoryMock.create.mockRejectedValue(new Error('Database error'));

      await expect(createCompanyUseCase.createCompany(companyData)).rejects.toThrow(Error);
    });
  });
});
