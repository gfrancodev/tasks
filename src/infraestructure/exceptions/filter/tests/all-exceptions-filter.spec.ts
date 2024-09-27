import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from '../all-exceptions-filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Exception } from '../../builder/exception';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { Response, Request } from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';
import { AuthErrors } from '../../errors/auth-error';
import { TaskErrors } from '../../errors/task-error';
import { UserErrors } from '../../errors/user-error';
import { CompanyErrors } from '../../errors/company-error';

describe('AllExceptionsFilter (Advanced Tests)', () => {
  let filter: AllExceptionsFilter;
  let mockArgumentsHost: MockProxy<ArgumentsHost>;
  let mockResponse: MockProxy<Response>;
  let mockRequest: MockProxy<Request>;
  let mockHttpAdapter: MockProxy<AbstractHttpAdapter>;
  let mockHttpAdapterHost: HttpAdapterHost;

  beforeEach(async () => {
    mockArgumentsHost = mockDeep<ArgumentsHost>();
    mockResponse = mockDeep<Response>();
    mockRequest = mockDeep<Request>();
    mockHttpAdapter = mockDeep<AbstractHttpAdapter>();

    mockHttpAdapterHost = {
      httpAdapter: mockHttpAdapter,
    };

    mockArgumentsHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    } as any);

    mockRequest.url = faker.internet.url();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    Object.defineProperty(filter, 'httpAdapter', {
      get: () => mockHttpAdapter,
    });
  });

  describe('httpAdapter getter', () => {
    it('should throw an error if HttpAdapter is not available', () => {
      const filterWithoutAdapter = new AllExceptionsFilter({} as HttpAdapterHost);
      expect(() => (filterWithoutAdapter as any).httpAdapter).toThrow(
        'HttpAdapter is not available',
      );
    });

    it('should return the httpAdapter when it is available', () => {
      const mockHttpAdapter = mockDeep<AbstractHttpAdapter>();
      const httpAdapterHost = { httpAdapter: mockHttpAdapter };
      const filter = new AllExceptionsFilter(httpAdapterHost);

      expect((filter as any).httpAdapter).toBe(mockHttpAdapter);
    });

    it('should handle undefined httpAdapterHost', () => {
      const filterWithUndefinedHost = new AllExceptionsFilter(undefined as any);
      expect(() => (filterWithUndefinedHost as any).httpAdapter).toThrow(
        'HttpAdapter is not available',
      );
    });
  });

  describe('handleCustomException', () => {
    it('should correctly handle authentication Exception', () => {
      const customException = new Exception(AuthErrors.AUTHENTICATION_FAILED);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 401,
            name: 'UNAUTHORIZED',
            details: expect.objectContaining({
              code: 1000,
              description: AuthErrors.AUTHENTICATION_FAILED.message,
            }),
          }),
        }),
        401,
      );
    });

    it('should not treat an authentication Exception as a server error', () => {
      const customException = new Exception(AuthErrors.AUTHENTICATION_FAILED);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).not.toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          error: expect.objectContaining({
            status: 500,
          }),
        }),
        expect.any(Number),
      );
    });

    it('should correctly handle Task not found Exception', () => {
      const customException = new Exception(TaskErrors.TASK_NOT_FOUND);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 404,
            name: 'NOT_FOUND',
            details: expect.objectContaining({
              code: 1009,
              description: TaskErrors.TASK_NOT_FOUND.message,
            }),
          }),
        }),
        404,
      );
    });

    it('should correctly handle user not found Exception', () => {
      const customException = new Exception(UserErrors.USER_NOT_FOUND);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 404,
            name: 'NOT_FOUND',
            details: expect.objectContaining({
              code: 1008,
              description: UserErrors.USER_NOT_FOUND.message,
            }),
          }),
        }),
        404,
      );
    });

    it('should correctly handle Company not found Exception', () => {
      const customException = new Exception(CompanyErrors.COMPANY_NOT_FOUND);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 404,
            name: 'NOT_FOUND',
            details: expect.objectContaining({
              code: 1007,
              description: CompanyErrors.COMPANY_NOT_FOUND.message,
            }),
          }),
        }),
        404,
      );
    });
  });

  describe('catch', () => {
    it('should handle errors when sending response', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockHttpAdapter.reply.mockImplementation(() => {
        throw new Error('Error sending response');
      });

      const customException = new Exception(AuthErrors.AUTHENTICATION_FAILED);

      filter.catch(customException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when sending response and fall back to direct response', () => {
      const consoleErrorSpy = vi.spyOn(Logger, 'error').mockImplementation(() => {});
      mockHttpAdapter.reply.mockImplementation(() => {
        throw new Error('Error sending response');
      });
      mockResponse.status.mockReturnValue(mockResponse);
      mockResponse.json.mockReturnValue(mockResponse);

      const customException = new Exception(AuthErrors.AUTHENTICATION_FAILED);

      filter.catch(customException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleHttpException', () => {
    it('should correctly handle HttpException', () => {
      const httpException = new HttpException('Invalid request error', HttpStatus.BAD_REQUEST);

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 400,
            name: 'BAD_REQUEST',
            details: expect.objectContaining({
              code: 400,
              description: 'Invalid request error',
            }),
          }),
        }),
        400,
      );
    });

    it('should keep the original status code of the HttpException', () => {
      const httpException = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          error: expect.objectContaining({
            status: 401,
          }),
        }),
        401,
      );
    });

    it('should handle HttpException with array description', () => {
      const httpException = new HttpException(
        {
          message: ['Error 1', 'Error 2'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              description: 'Error 1, Error 2',
            }),
          }),
        }),
        400,
      );
    });

    it('should flatten array description', () => {
      const httpException = new HttpException(
        {
          message: ['Error 1', 'Error 2', 'Error 3'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              description: 'Error 1, Error 2, Error 3',
            }),
          }),
        }),
        400,
      );
    });

    it('should handle HttpException with non-array message', () => {
      const httpException = new HttpException('Single error message', HttpStatus.BAD_REQUEST);

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              description: 'Single error message',
            }),
          }),
        }),
        400,
      );
    });

    it('should handle HttpException with non-array description', () => {
      const httpException = new HttpException(
        { message: 'Test error message' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 400,
            name: 'BAD_REQUEST',
            details: expect.objectContaining({
              code: 400,
              description: 'Test error message',
            }),
          }),
        }),
        400,
      );
    });

    it('should handle HttpException with object response and no message property', () => {
      const httpException = new HttpException({ error: 'Test error' }, HttpStatus.BAD_REQUEST);

      filter.catch(httpException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 400,
            name: 'BAD_REQUEST',
            id: expect.any(String),
            details: expect.objectContaining({
              code: 400,
              description: expect.any(String),
              path: expect.any(String),
              timestamp: expect.any(String),
            }),
          }),
        }),
        400,
      );
    });
  });

  describe('handleUnknownException', () => {
    it('should correctly handle internal server error', () => {
      const unknownError = new Error('Unknown internal error');

      filter.catch(unknownError, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            status: 500,
            name: 'INTERNAL_SERVER_ERROR',
            details: expect.objectContaining({
              code: 500,
              description: 'Server internal error.',
            }),
          }),
        }),
        500,
      );
    });

    it('should not expose details of the internal error in the response', () => {
      const sensitiveError = new Error('Sensitive database details');

      filter.catch(sensitiveError, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.not.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              description: 'Sensitive database details',
            }),
          }),
        }),
        expect.any(Number),
      );
    });
  });

  describe('extractErrorMetadata', () => {
    it('should include the request path in the error', () => {
      const path = '/v1/users';
      mockRequest.url = path;
      const customException = new Exception(UserErrors.USER_NOT_FOUND);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              path: path,
            }),
          }),
        }),
        404,
      );
    });

    it('should include a valid timestamp in the error', () => {
      const customException = new Exception(UserErrors.USER_NOT_FOUND);

      filter.catch(customException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalled();
      const callArgs = mockHttpAdapter.reply.mock.calls[0][1];
      expect(callArgs).toBeDefined();
      expect(callArgs.error).toBeDefined();
      expect(callArgs.error.details).toBeDefined();

      const timestamp = callArgs.error.details.timestamp;

      expect(timestamp).toBeDefined();
      const date = new Date(timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).not.toBeNaN();

      const now = new Date();
      const fiveSecondsAgo = now.getTime() - 5000;
      expect(date.getTime()).toBeGreaterThanOrEqual(fiveSecondsAgo);
      expect(date.getTime()).toBeLessThanOrEqual(now.getTime());
    });
  });
});
