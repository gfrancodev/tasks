import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export interface ConditionalAccessContext {
  user: Auth.CurrentUser;
  params: Request['params'];
  query: Request['query'];
  body: Request['body'];
  headers: Request['headers'];
}

export interface ConditionalAccessConfig {
  condition: (context: ConditionalAccessContext) => boolean;
  message: string;
}

export const ACCESS_CONTROL_KEY = 'CONDITIONAL_ACCESS';
export const ConditionalAccess = (options: ConditionalAccessConfig) =>
  SetMetadata(ACCESS_CONTROL_KEY, options);
