import { describe, it, expect, beforeEach } from 'vitest';
import { ListUsersUseCase } from '../list-users-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserMapper } from '@/domain/mappers';

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    listUsersUseCase = new ListUsersUseCase(userRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should list users successfully with default pagination', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const users: UserEntity[] = [
        { id: 1, uuid: 'user-1-uuid', email: 'user1@example.com' } as UserEntity,
        { id: 2, uuid: 'user-2-uuid', email: 'user2@example.com' } as UserEntity,
      ];

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByCompanyWithPagination.mockResolvedValue({ users, total: 2 });

      const result = await listUsersUseCase.execute(companyId);

      expect(result).toEqual(
        UserMapper.toResponseWithPagination({
          total: 2,
          current_page: 1,
          per_page: 10,
          in_page: 2,
          data: users,
        }),
      );
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByCompanyWithPagination).toHaveBeenCalledWith(1, 1, 10);
    });

    it('should list users successfully with custom pagination', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const users: UserEntity[] = [
        { id: 1, uuid: 'user-1-uuid', email: 'user1@example.com' } as UserEntity,
      ];

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByCompanyWithPagination.mockResolvedValue({ users, total: 5 });

      const result = await listUsersUseCase.execute(companyId, 2, 1);

      expect(result).toEqual(
        UserMapper.toResponseWithPagination({
          total: 5,
          current_page: 2,
          per_page: 1,
          in_page: 1,
          data: users,
        }),
      );
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByCompanyWithPagination).toHaveBeenCalledWith(1, 2, 1);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(listUsersUseCase.execute(companyId)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await listUsersUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await listUsersUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => listUsersUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => listUsersUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('validatePage', () => {
    it('should return the provided page number when valid', () => {
      const result = listUsersUseCase['validatePage'](5);
      expect(result).toBe(5);
    });

    it('should return the default page number when input is invalid', () => {
      expect(listUsersUseCase['validatePage'](0)).toBe(1);
      expect(listUsersUseCase['validatePage'](-1)).toBe(1);
      expect(listUsersUseCase['validatePage'](undefined)).toBe(1);
    });
  });

  describe('validatePageSize', () => {
    it('should return the provided page size when valid', () => {
      const result = listUsersUseCase['validatePageSize'](20);
      expect(result).toBe(20);
    });

    it('should return the default page size when input is invalid', () => {
      expect(listUsersUseCase['validatePageSize'](0)).toBe(10);
      expect(listUsersUseCase['validatePageSize'](-1)).toBe(10);
      expect(listUsersUseCase['validatePageSize'](undefined)).toBe(10);
    });
  });
});
