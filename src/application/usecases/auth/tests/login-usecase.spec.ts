import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginUseCase } from '../login-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { IJwtManagerService } from '@/domain/interfaces/services/ijwtmanager-service';
import { UserEntity } from '@/domain/entities/user-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { LoginDto } from '@/application/dtos/login-dto';
import * as secureHashHelpers from '@/infraestructure/helpers/secure-hash-helpers';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let jwtManagerServiceMock: MockProxy<IJwtManagerService>;

  beforeEach(() => {
    userRepositoryMock = mockDeep<IUserRepository>();
    jwtManagerServiceMock = mockDeep<IJwtManagerService>();
    loginUseCase = new LoginUseCase(userRepositoryMock, jwtManagerServiceMock);
  });

  describe('execute', () => {
    const mockLoginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
    const mockUser: UserEntity = {
      uuid: 'user-uuid',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
      company: { uuid: 'company-uuid' },
    } as UserEntity;

    it('should successfully login and return access token', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      vi.spyOn(secureHashHelpers, 'compareHashedValue').mockResolvedValue(true);
      jwtManagerServiceMock.encode.mockReturnValue('mocked-jwt-token');

      const result = await loginUseCase.execute(mockLoginDto);

      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        company_id: 'company-uuid',
      });
    });

    it('should throw an exception if user is not found', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow('User not found.');
    });

    it('should throw an exception if password is invalid', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      vi.spyOn(secureHashHelpers, 'compareHashedValue').mockResolvedValue(false);

      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Invalid credentials. The provided email or password is incorrect.',
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should call userRepository.findByEmail with correct email', async () => {
      const email = 'test@example.com';
      await loginUseCase.getUserByEmail(email);
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception if user is found', () => {
      const user = {} as UserEntity;
      expect(() => loginUseCase.checkIfUserFound(user)).not.toThrow();
    });

    it('should throw an exception if user is not found', () => {
      expect(() => loginUseCase.checkIfUserFound(null)).toThrow('User not found');
    });
  });

  describe('checkIsValidPassword', () => {
    it('should call compareHashedValue with correct parameters', async () => {
      const compareSpy = vi.spyOn(secureHashHelpers, 'compareHashedValue');
      await loginUseCase.checkIsValidPassword('hashedPassword', 'inputPassword');
      expect(compareSpy).toHaveBeenCalledWith('inputPassword', 'hashedPassword');
    });
  });

  describe('ifPasswordIsNotValid', () => {
    it('should not throw an exception if password is valid', () => {
      expect(() => loginUseCase.ifPasswordIsNotValid(true)).not.toThrow();
    });

    it('should throw an exception if password is not valid', () => {
      expect(() => loginUseCase.ifPasswordIsNotValid(false)).toThrow(
        'Invalid credentials. The provided email or password is incorrect.',
      );
    });
  });

  describe('createPayload', () => {
    it('should create correct payload from user entity', () => {
      const user: UserEntity = {
        uuid: 'user-uuid',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        company: { uuid: 'company-uuid' },
      } as UserEntity;

      const payload = loginUseCase.createPayload(user);

      expect(payload).toEqual({
        id: 'user-uuid',
        company_id: 'company-uuid',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      });
    });
  });

  describe('createAuthToken', () => {
    it('should call jwtManagerService.encode with correct payload', () => {
      const payload = { id: 'user-id' };
      loginUseCase.createAuthToken(payload);
      expect(jwtManagerServiceMock.encode).toHaveBeenCalledWith(payload);
    });
  });
});
