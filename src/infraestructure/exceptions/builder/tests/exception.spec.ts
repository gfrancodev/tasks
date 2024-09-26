import { describe, it, expect } from 'vitest';
import { Exception } from '../exception';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('Exception', () => {
  const mockErrorCode = {
    code: 1000,
    identifier: 'TEST_ERROR',
    message: 'Erro de teste',
    httpStatus: HttpStatus.BAD_REQUEST,
  };

  it('should create an Exception instance with the correct', () => {
    const exception = new Exception(mockErrorCode);

    expect(exception).toBeInstanceOf(Exception);
    expect(exception.code).toBe(mockErrorCode.code);
    expect(exception.identifier).toBe(mockErrorCode.identifier);
    expect(exception.message).toBe(mockErrorCode.message);
    expect(exception.getStatus()).toBe(mockErrorCode.httpStatus);
  });

  it('should allow a custom message', () => {
    const customMessage = 'Mensagem personalizada';
    const exception = new Exception(mockErrorCode, customMessage);

    expect(exception.message).toBe(customMessage);
  });

  it('should use the default message if no custom message is provided', () => {
    const exception = new Exception(mockErrorCode);

    expect(exception.message).toBe(mockErrorCode.message);
  });

  it('should generate a correct response', () => {
    const exception = new Exception(mockErrorCode);
    const response = exception.getResponse();

    expect(response).toEqual({
      code: mockErrorCode.code,
      identifier: mockErrorCode.identifier,
      message: mockErrorCode.message,
    });
  });

  it('should handle partial ErrorCode objects', () => {
    const partialErrorCode = {
      code: 2000,
      httpStatus: HttpStatus.NOT_FOUND,
    };

    const exception = new Exception(partialErrorCode);

    expect(exception.code).toBe(partialErrorCode.code);
    expect(exception.identifier).toBeUndefined();
    expect(exception.message).toBeUndefined();
    expect(exception.getStatus()).toBe(partialErrorCode.httpStatus);
  });

  it('should correctly inherit from HttpException', () => {
    const exception = new Exception(mockErrorCode);

    expect(exception).toBeInstanceOf(HttpException);
  });
});
