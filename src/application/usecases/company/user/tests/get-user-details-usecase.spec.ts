import { describe, it, expect, beforeEach } from 'vitest';
import { GetUserUseCase } from '../get-user-details-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { UserMapper } from '@/domain/mappers';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    getUserUseCase = new GetUserUseCase(userRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should get user details successfully', async () => {
      const companyId = 'company-uuid';
      const userId = 'user-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: userId, email: 'test@example.com' } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await getUserUseCase.execute(companyId, userId);

      expect(result).toEqual(UserMapper.toResponseWithoutRelations(user));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, userId);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-company';
      const userId = 'user-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(getUserUseCase.execute(companyId, userId)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });

    it('should throw an exception if user is not found', async () => {
      const companyId = 'company-uuid';
      const userId = 'non-existent-user';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(getUserUseCase.execute(companyId, userId)).rejects.toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await getUserUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-company';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await getUserUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => getUserUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => getUserUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId, email: 'test@example.com' } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await getUserUseCase.getUserById(companyId, userId);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });

    it('should return null when user is not found', async () => {
      const companyId = 1;
      const userId = 'non-existent-user';

      userRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await getUserUseCase.getUserById(companyId, userId);

      expect(result).toBeNull();
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception when user is found', () => {
      const user: UserEntity = {
        id: 1,
        uuid: 'user-uuid',
        email: 'test@example.com',
      } as UserEntity;

      expect(() => getUserUseCase.checkIfUserFound(user)).not.toThrow();
    });

    it('should throw an exception when user is not found', () => {
      expect(() => getUserUseCase.checkIfUserFound(null)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });
});
