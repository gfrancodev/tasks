import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth-guard';
import { Reflector } from '@nestjs/core';
import { JwtManagerService } from '../../../infraestructure/services/jwt-manager-service';
import { ExecutionContext, Logger } from '@nestjs/common';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Exception } from '../../exceptions/builder/exception';

vi.mock('@nestjs/core', () => ({
  Reflector: vi.fn(() => ({
    getAllAndOverride: vi.fn(),
  })),
}));

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let reflector: Reflector;
  let jwtManagerServiceMock: MockProxy<JwtManagerService>;
  let executionContextMock: MockProxy<ExecutionContext>;
  let loggerMock: MockProxy<Logger>;

  beforeEach(async () => {
    reflector = new Reflector();
    jwtManagerServiceMock = mockDeep<JwtManagerService>();
    executionContextMock = mockDeep<ExecutionContext>();
    loggerMock = mockDeep<Logger>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: reflector },
        { provide: 'JWT', useValue: jwtManagerServiceMock },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
  });

  const createMockExecutionContext = (overrides = {}) => {
    const defaultContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          user: {},
          params: {},
          query: {},
          body: {},
          ...overrides,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };
    return { ...defaultContext, ...overrides };
  };

  describe('canActivate', () => {
    it('should throw an exception for non-public routes without authorization header', async () => {
      reflector.getAllAndOverride = vi.fn().mockReturnValue(false);
      const context = createMockExecutionContext();
      await expect(authGuard.canActivate(context as ExecutionContext)).rejects.toThrow(Exception);
    });

    it('should throw an exception for invalid token', async () => {
      reflector.getAllAndOverride = vi.fn().mockReturnValue(false);
      const context = createMockExecutionContext({
        headers: { authorization: 'Bearer invalidToken' },
      });
      jwtManagerServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      await expect(authGuard.canActivate(context as ExecutionContext)).rejects.toThrow(Exception);
    });

    it('should throw an exception for non-matching role', async () => {
      reflector.getAllAndOverride = vi
        .fn()
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(['ADMIN']); // roles
      const context = createMockExecutionContext({
        headers: { authorization: 'Bearer validToken' },
      });
      jwtManagerServiceMock.verify.mockReturnValue({ role: 'USER' });
      await expect(authGuard.canActivate(context as ExecutionContext)).rejects.toThrow(Exception);
    });

    it('should throw an exception when conditional access fails', async () => {
      reflector.getAllAndOverride = vi
        .fn()
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(['USER']) // roles
        .mockReturnValueOnce({ condition: () => false, message: 'Access denied' }); // conditionalAccess
      const context = createMockExecutionContext({
        headers: { authorization: 'Bearer validToken' },
      });
      jwtManagerServiceMock.verify.mockReturnValue({ role: 'USER' });
      await expect(authGuard.canActivate(context as ExecutionContext)).rejects.toThrow(Exception);
    });
  });

  describe('isPublicRoute', () => {
    it('should return false for non-public routes', () => {
      reflector.getAllAndOverride = vi.fn().mockReturnValueOnce(false);
      const result = (authGuard as any).isPublicRoute(executionContextMock);
      expect(result).toBe(false);
    });
  });

  describe('authenticateAndExtractUser', () => {
    it('should extract and verify token successfully', () => {
      const request = { headers: { authorization: 'Bearer validToken' } };
      jwtManagerServiceMock.verify.mockReturnValue({ id: '1', role: 'USER' });
      const result = (authGuard as any).authenticateAndExtractUser(request);
      expect(result).toEqual({ id: '1', role: 'USER' });
    });

    it('should throw an exception for missing token', () => {
      const request = { headers: {} };
      expect(() => (authGuard as any).authenticateAndExtractUser(request)).toThrow(Exception);
    });

    it('should throw an exception for invalid token', () => {
      const request = { headers: { authorization: 'Bearer invalidToken' } };
      jwtManagerServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      expect(() => (authGuard as any).authenticateAndExtractUser(request)).toThrow(Exception);
    });
  });

  describe('checkUserRole', () => {
    it('should throw for non-matching role', () => {
      reflector.getAllAndOverride = vi.fn().mockReturnValueOnce(['ADMIN']);
      expect(() => (authGuard as any).checkUserRole(executionContextMock, 'USER')).toThrow(
        Exception,
      );
    });
  });

  describe('checkConditionalAccess', () => {
    it('should not throw when condition is true', () => {
      const mockConfig = {
        condition: () => true,
        message: 'Access granted',
      };
      reflector.getAllAndOverride = vi.fn().mockReturnValueOnce(mockConfig);
      const mockRequest = createMockExecutionContext().switchToHttp().getRequest();
      expect(() =>
        (authGuard as any).checkConditionalAccess(executionContextMock, mockRequest),
      ).not.toThrow();
    });
  });
});
