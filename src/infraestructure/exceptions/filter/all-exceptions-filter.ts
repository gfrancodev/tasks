import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Exception } from '../builder/exception';
import { AbstractHttpAdapter } from '@nestjs/core/adapters';
import { HttpAdapterHost } from '@nestjs/core';
import * as crypto from 'crypto';
import { GeneralErrors } from '../errors/general-error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  protected logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private get httpAdapter(): AbstractHttpAdapter {
    const { httpAdapter } = this.httpAdapterHost || {};
    if (!httpAdapter) {
      throw new Error('HttpAdapter is not available');
    }
    return httpAdapter;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorMetadata = this.extractErrorMetadata(request);

    const errorResponse = this.generateErrorResponse(exception, errorMetadata);
    const status = this.getHttpStatus(exception);

    try {
      this.httpAdapter.reply(response, errorResponse, status);
    } catch (error) {
      this.logger.error('Error while sending response:', error);
      response.status(status)?.json(errorResponse);
    }
  }

  private isGeneralError(exception: Exception): boolean {
    const response = exception.getResponse() as any;
    return Object.values(GeneralErrors).some((error) => error.code === response.code);
  }

  private extractErrorMetadata(request: Request) {
    return {
      errorId: this.generateErrorId(),
      timestamp: this.getCurrentTimestamp(),
      path: this.getRequestPath(request),
    };
  }

  private generateErrorResponse(
    exception: unknown,
    { errorId, timestamp, path }: { errorId: string; timestamp: string; path: string },
  ) {
    if (this.isCustomException(exception)) {
      return this.handleCustomException(exception as Exception, errorId, timestamp, path);
    }

    if (this.isHttpException(exception)) {
      return this.handleHttpException(exception as HttpException, errorId, timestamp, path);
    }

    return this.handleUnknownException(exception, errorId, timestamp, path);
  }

  private getHttpStatus(exception: unknown): number {
    if (this.isHttpException(exception)) {
      return (exception as HttpException).getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private generateErrorId(): string {
    return crypto.randomUUID();
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private getRequestPath(request: Request): string {
    return request.url;
  }

  private isCustomException(exception: unknown): boolean {
    return exception instanceof Exception;
  }

  private isHttpException(exception: unknown): boolean {
    return exception instanceof HttpException;
  }

  private handleCustomException(
    exception: Exception,
    errorId: string,
    timestamp: string,
    path: string,
  ) {
    const status = exception.getStatus();
    const response = exception.getResponse() as any;
    const description = this.getErrorDescription(exception, response);

    return this.buildErrorResponse({
      errorId,
      status,
      name: this.getStatusName(status),
      timestamp,
      path,
      code: response.code,
      description,
    });
  }

  private getErrorDescription(exception: Exception, response: any): string {
    if (this.isGeneralError(exception)) {
      return this.getGeneralErrorDescription(response.code);
    }
    return response.message;
  }

  private getGeneralErrorDescription(errorCode: number): string {
    const generalError = this.findGeneralErrorByCode(errorCode);
    return generalError ? generalError.message : 'An error occurred';
  }

  private findGeneralErrorByCode(errorCode: number) {
    return Object.values(GeneralErrors).find((error) => error.code === errorCode);
  }

  private handleHttpException(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const code = status;
    let description = (exceptionResponse as any)?.message || exception.message;

    if (Array.isArray(description)) {
      description = this.flattenDescription(description);
    }

    return this.buildErrorResponse({
      errorId,
      status,
      name: this.getStatusName(status),
      timestamp,
      path,
      code,
      description,
    });
  }

  private handleUnknownException(
    exception: unknown,
    errorId: string,
    timestamp: string,
    path: string,
  ) {
    this.logException(exception);

    return this.buildErrorResponse({
      errorId,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      name: this.getStatusName(HttpStatus.INTERNAL_SERVER_ERROR),
      timestamp,
      path,
      code: 500,
      description: 'Server internal error.',
    });
  }

  private buildErrorResponse({
    errorId,
    status,
    name,
    timestamp,
    path,
    code,
    description,
  }: {
    errorId: string;
    status: number;
    name: string;
    timestamp: string;
    path: string;
    code: number;
    description: string;
  }) {
    return {
      success: false,
      error: {
        id: errorId,
        status,
        name,
        details: {
          timestamp,
          path,
          code,
          description,
        },
      },
    };
  }

  private getStatusName(statusCode: number): string {
    const statusEntries = Object.entries(HttpStatus);
    const statusEntry = statusEntries.find(([, code]) => code === statusCode);
    return statusEntry ? statusEntry[0] : 'Unknown Status';
  }

  private flattenDescription(description: any[]): string {
    return description.join(', ');
  }

  private logException(exception: unknown) {
    this.logger.error(exception);
  }
}
