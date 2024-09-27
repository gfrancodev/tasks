import { describe, it, expect, beforeEach } from 'vitest';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { GetAuthenticatedUserUseCase } from '../get-authenticated-user-usecase';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { UserMapper } from '@/domain/mappers';

describe('GetAuthenticatedUserUseCase', () => {
  let getAuthenticatedUserUseCase: GetAuthenticatedUserUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    getAuthenticatedUserUseCase = new GetAuthenticatedUserUseCase(
      userRepositoryMock,
      companyRepositoryMock,
    );
  });

  describe('execute', () => {
    const mockCurrentUser: Auth.CurrentUser = {
      id: 'user-uuid',
      company_id: 'company-uuid',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    it('should return user data when user and company are found', async () => {
      const mockCompany: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;
      const mockUser: UserEntity = {
        uuid: 'user-uuid',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
        company: mockCompany,
      } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(mockCompany);
      userRepositoryMock.findByUUID.mockResolvedValue(mockUser);

      const result = await getAuthenticatedUserUseCase.execute(mockCurrentUser);

      expect(result).toEqual(UserMapper.toResponse(mockUser));
    });

    it('should throw an exception when company is not found', async () => {
      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(getAuthenticatedUserUseCase.execute(mockCurrentUser)).rejects.toThrow(
        'Company not found.',
      );
    });

    it('should throw an exception when user is not found', async () => {
      const mockCompany: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;
      companyRepositoryMock.findByUUID.mockResolvedValue(mockCompany);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(getAuthenticatedUserUseCase.execute(mockCurrentUser)).rejects.toThrow(
        'User not found.',
      );
    });
  });

  describe('getCompanyById', () => {
    it('should call companyRepository.findByUUID with correct parameter', async () => {
      const companyId = 'company-uuid';
      await getAuthenticatedUserUseCase.getCompanyById(companyId);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('getUserById', () => {
    it('should call userRepository.findByUUID with correct parameters', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      await getAuthenticatedUserUseCase.getUserById(companyId, userId);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception when user is found', () => {
      const mockUser: UserEntity = {} as UserEntity;
      expect(() => getAuthenticatedUserUseCase.checkIfUserFound(mockUser)).not.toThrow();
    });

    it('should throw an exception when user is not found', () => {
      expect(() => getAuthenticatedUserUseCase.checkIfUserFound(null)).toThrow('User not found.');
    });
  });

  describe('checkICompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const mockCompany: CompanyEntity = {} as CompanyEntity;
      expect(() => getAuthenticatedUserUseCase.checkICompanyFound(mockCompany)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => getAuthenticatedUserUseCase.checkICompanyFound(null)).toThrow(
        'Company not found.',
      );
    });
  });
});
