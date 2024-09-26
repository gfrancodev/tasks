import { HttpException } from '@nestjs/common';

interface ErrorCode {
  code: number;
  identifier: string;
  message: string;
  httpStatus: number;
}

export class Exception extends HttpException {
  public readonly code: number;
  public readonly identifier: string;
  public readonly message: string;

  constructor(error: Partial<ErrorCode>, customMessage?: string) {
    super(
      {
        code: error.code,
        identifier: error.identifier,
        message: customMessage || error.message,
      },
      error.httpStatus,
    );
    this.code = error.code;
    this.identifier = error.identifier;
    this.message = customMessage || error.message;
  }
}
