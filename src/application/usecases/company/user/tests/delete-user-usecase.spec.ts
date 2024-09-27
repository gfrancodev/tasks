import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteUserUseCase } from '../delete-user-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    deleteUserUseCase = new DeleteUserUseCase(userRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should delete a user successfully', async () => {
      const companyId = 'company-uuid';
      const userId = 'user-uuid';
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: 'ADMIN' } as any;
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: userId, role: 'USER' } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      userRepositoryMock.delete.mockResolvedValue();

      await expect(
        deleteUserUseCase.execute(companyId, userId, currentUser),
      ).resolves.not.toThrow();

      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, userId);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(company.id, user.id);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-company';
      const userId = 'user-uuid';
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: 'ADMIN' } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(deleteUserUseCase.execute(companyId, userId, currentUser)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });

    it('should throw an exception if user is not found', async () => {
      const companyId = 'company-uuid';
      const userId = 'non-existent-user';
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: 'ADMIN' } as any;
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(deleteUserUseCase.execute(companyId, userId, currentUser)).rejects.toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });

    it('should throw an exception if admin tries to delete another admin', async () => {
      const companyId = 'company-uuid';
      const userId = 'admin-to-delete-uuid';
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: 'ADMIN' } as any;
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const userToDelete: UserEntity = { id: 1, uuid: userId, role: 'ADMIN' } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(userToDelete);

      await expect(deleteUserUseCase.execute(companyId, userId, currentUser)).rejects.toThrow(
        new Exception(UserErrors.INSUFFICIENT_PERMISSIONS),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await deleteUserUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-company';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await deleteUserUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => deleteUserUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => deleteUserUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await deleteUserUseCase.getUserById(companyId, userId);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });

    it('should return null when user is not found', async () => {
      const companyId = 1;
      const userId = 'non-existent-user';

      userRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await deleteUserUseCase.getUserById(companyId, userId);

      expect(result).toBeNull();
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception when user is found', () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid' } as UserEntity;

      expect(() => deleteUserUseCase.checkIfUserFound(user)).not.toThrow();
    });

    it('should throw an exception when user is not found', () => {
      expect(() => deleteUserUseCase.checkIfUserFound(null)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('deleteUser', () => {
    it('should call userRepository.delete with correct parameters', async () => {
      const companyId = 1;
      const userId = 1;

      await deleteUserUseCase.deleteUser(companyId, userId);

      expect(userRepositoryMock.delete).toHaveBeenCalledWith(companyId, userId);
    });
  });
});
