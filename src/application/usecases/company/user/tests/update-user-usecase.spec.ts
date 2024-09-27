import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateUserUseCase } from '../update-user-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { UpdateUserDto } from '@/application/dtos/update-user-dto';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { UserMapper } from '@/domain/mappers';
import { RoleEnum } from '@/domain/enums/role-enum';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    updateUserUseCase = new UpdateUserUseCase(userRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should update a user successfully', async () => {
      const companyId = 'company-uuid';
      const userId = 'user-uuid';
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Name' };
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: userId, role: RoleEnum.USER } as UserEntity;
      const updatedUser: UserEntity = { ...user, full_name: 'Updated Name' } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      userRepositoryMock.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute(companyId, userId, updateUserDto, currentUser);

      expect(result).toEqual(UserMapper.toResponseWithoutRelations(updatedUser));
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-company';
      const userId = 'user-uuid';
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Name' };
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateUserUseCase.execute(companyId, userId, updateUserDto, currentUser),
      ).rejects.toThrow(new Exception(CompanyErrors.COMPANY_NOT_FOUND));
    });

    it('should throw an exception if user is not found', async () => {
      const companyId = 'company-uuid';
      const userId = 'non-existent-user';
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Name' };
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateUserUseCase.execute(companyId, userId, updateUserDto, currentUser),
      ).rejects.toThrow(new Exception(UserErrors.USER_NOT_FOUND));
    });

    it('should throw an exception if admin tries to update another admin', async () => {
      const companyId = 'company-uuid';
      const userId = 'admin-user-uuid';
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Name' };
      const currentUser: Auth.CurrentUser = {
        id: 'another-admin-uuid',
        role: RoleEnum.ADMIN,
      } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: userId, role: RoleEnum.ADMIN } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);

      await expect(
        updateUserUseCase.execute(companyId, userId, updateUserDto, currentUser),
      ).rejects.toThrow(new Exception(UserErrors.INSUFFICIENT_PERMISSIONS));
    });

    it('should allow admin to update their own data', async () => {
      const companyId = 'company-uuid';
      const userId = 'admin-uuid';
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Admin Name' };
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: userId, role: RoleEnum.ADMIN } as UserEntity;
      const updatedUser: UserEntity = { ...user, full_name: 'Updated Admin Name' } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      userRepositoryMock.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute(companyId, userId, updateUserDto, currentUser);

      expect(result).toEqual(UserMapper.toResponseWithoutRelations(updatedUser));
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await updateUserUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-company';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await updateUserUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => updateUserUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => updateUserUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('checkAdminPermission', () => {
    it('should not throw an exception when user is not an admin', () => {
      const userToUpdate: UserEntity = { uuid: 'user-uuid', role: RoleEnum.USER } as UserEntity;
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      expect(() =>
        updateUserUseCase['checkAdminPermission'](userToUpdate, currentUser),
      ).not.toThrow();
    });

    it('should not throw an exception when admin updates their own data', () => {
      const userToUpdate: UserEntity = { uuid: 'admin-uuid', role: RoleEnum.ADMIN } as UserEntity;
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      expect(() =>
        updateUserUseCase['checkAdminPermission'](userToUpdate, currentUser),
      ).not.toThrow();
    });

    it('should throw an exception when admin tries to update another admin', () => {
      const userToUpdate: UserEntity = {
        uuid: 'other-admin-uuid',
        role: RoleEnum.ADMIN,
      } as UserEntity;
      const currentUser: Auth.CurrentUser = { id: 'admin-uuid', role: RoleEnum.ADMIN } as any;

      expect(() => updateUserUseCase['checkAdminPermission'](userToUpdate, currentUser)).toThrow(
        new Exception(UserErrors.INSUFFICIENT_PERMISSIONS),
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await updateUserUseCase.getCurrentUser(companyId, userId);

      expect(result).toEqual(user);
    });

    it('should return null when current user is not found', async () => {
      const companyId = 1;
      const userId = 'non-existent-user';

      userRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await updateUserUseCase.getCurrentUser(companyId, userId);

      expect(result).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return a user when found', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await updateUserUseCase.getUser(companyId, userId);

      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      const companyId = 1;
      const userId = 'non-existent-user';

      userRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await updateUserUseCase.getUser(companyId, userId);

      expect(result).toBeNull();
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception when user is found', () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid' } as UserEntity;

      expect(() => updateUserUseCase.checkIfUserFound(user)).not.toThrow();
    });

    it('should throw an exception when user is not found', () => {
      expect(() => updateUserUseCase.checkIfUserFound(null)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid', companyId: 1 } as UserEntity;
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Name' };
      const updatedUser: UserEntity = { ...user, full_name: 'Updated Name' } as UserEntity;

      userRepositoryMock.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.updateUser(user, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(
        user.companyId,
        user.id,
        expect.any(Object),
      );
    });

    it('should handle update failure', async () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid', companyId: 1 } as UserEntity;
      const updateUserDto: UpdateUserDto = { full_name: 'Updated Name' };

      userRepositoryMock.update.mockRejectedValue(new Error('Update failed'));

      await expect(updateUserUseCase.updateUser(user, updateUserDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });
});
