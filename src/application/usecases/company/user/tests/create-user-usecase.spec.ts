import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from '../create-user-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CreateUserDto } from '@/application/dtos/create-user-dto';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { UserMapper } from '@/domain/mappers';
import { RoleEnum } from '@/domain/enums/role-enum';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    createUserUseCase = new CreateUserUseCase(userRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should create a user successfully', async () => {
      const companyId = 'company-uuid';
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'Password123!',
        role: RoleEnum.USER,
      };
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const createdUser: UserEntity = {
        id: 1,
        uuid: 'user-uuid',
        email: createUserDto.email,
        fullName: createUserDto.full_name,
        role: createUserDto.role,
        companyId: company.id,
      } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.create.mockResolvedValue(createdUser);

      const result = await createUserUseCase.execute(companyId, createUserDto);

      expect(result).toEqual(UserMapper.toResponseWithoutRelations(createdUser));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(userRepositoryMock.create).toHaveBeenCalledWith(company.id, expect.any(Object));
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'Password123!',
        role: RoleEnum.USER,
      };

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(createUserUseCase.execute(companyId, createUserDto)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });

    it('should throw an exception if user already exists', async () => {
      const companyId = 'company-uuid';
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        full_name: 'Existing User',
        password: 'Password123!',
        role: RoleEnum.USER,
      };
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const existingUser: UserEntity = { id: 1, email: createUserDto.email } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByEmail.mockResolvedValue(existingUser);

      await expect(createUserUseCase.execute(companyId, createUserDto)).rejects.toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await createUserUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await createUserUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception when company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => createUserUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception when company is not found', () => {
      expect(() => createUserUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when found', async () => {
      const email = 'test@example.com';
      const user: UserEntity = { id: 1, email } as UserEntity;

      userRepositoryMock.findByEmail.mockResolvedValue(user);

      const result = await createUserUseCase.getUserByEmail(email);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when user is not found', async () => {
      const email = 'non-existent@example.com';

      userRepositoryMock.findByEmail.mockResolvedValue(null);

      const result = await createUserUseCase.getUserByEmail(email);

      expect(result).toBeNull();
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('checkIfUserAlreadyExists', () => {
    it('should throw an exception when user already exists', () => {
      const user: UserEntity = { id: 1, email: 'existing@example.com' } as UserEntity;

      expect(() => createUserUseCase.checkIfUserAlreadyExists(user)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });

    it('should not throw an exception when user does not exist', () => {
      expect(() => createUserUseCase.checkIfUserAlreadyExists(null)).not.toThrow();
    });
  });

  describe('createUserData', () => {
    it('should create user data using UserFactory', () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'Password123!',
        role: RoleEnum.USER,
      };

      const result = createUserUseCase.createUserData(createUserDto);

      expect(result).toEqual(
        expect.objectContaining({
          email: createUserDto.email,
          fullName: createUserDto.full_name,
          password: createUserDto.password,
          role: createUserDto.role,
        }),
      );
    });
  });

  describe('createUser', () => {
    it('should call userRepository.create with correct data', async () => {
      const companyId = 1;
      const userData: Partial<UserEntity> = {
        email: 'test@example.com',
        fullName: 'Test User',
        role: RoleEnum.USER,
      };
      const createdUser: UserEntity = { id: 1, ...userData } as UserEntity;

      userRepositoryMock.create.mockResolvedValue(createdUser);

      const result = await createUserUseCase.createUser(companyId, userData);

      expect(result).toEqual(createdUser);
      expect(userRepositoryMock.create).toHaveBeenCalledWith(companyId, userData);
    });

    it('should throw an exception if user creation fails', async () => {
      const companyId = 1;
      const userData: Partial<UserEntity> = {
        email: 'test@example.com',
        fullName: 'Test User',
        role: RoleEnum.USER,
        companyId: 1,
      };

      userRepositoryMock.create.mockRejectedValue(new Error('Database error'));

      await expect(createUserUseCase.createUser(companyId, userData)).rejects.toThrow(Error);
    });
  });
});
