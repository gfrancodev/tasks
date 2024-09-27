import { CanActivate, ExecutionContext, Injectable, Logger, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtManagerService } from '../../infraestructure/services/jwt-manager-service';
import {
  ACCESS_CONTROL_KEY,
  ConditionalAccessConfig,
  ConditionalAccessContext,
} from '../decorators/conditional-access-decorator';
import { IS_PUBLIC_KEY } from '../decorators/is-public-decorator';
import { ROLES_KEY } from '../decorators/roles-decorator';
import { Exception } from '../exceptions/builder/exception';
import { AuthErrors } from '../exceptions/errors/auth-error';

@Injectable()
export class AuthGuard implements CanActivate {
  protected logger = new Logger(AuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    @Inject('JWT') private readonly jwtManagerService: JwtManagerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = this.getRequest(context);
    
    try {
      const user = this.authenticateAndExtractUser(request);
      this.checkUserRole(context, user.role);
      this.checkConditionalAccess(context, request);

      return true;
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw error;
    }
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return (
      this.reflector?.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || false
    );
  }

  private getRequest(context: ExecutionContext): Auth.Request<Request> {
    return context.switchToHttp().getRequest<Auth.Request<Request>>();
  }

  private authenticateAndExtractUser(request: Auth.Request<Request>): Auth.TokenPayload {
    const token = this.getBearerTokenOrFail(request);
    const user = this.validateTokenOrFail(token);
    request.user = user;
    return user;
  }

  private getBearerTokenOrFail(request: Request): string {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new Exception(AuthErrors.AUTHENTICATION_REQUIRED);
    }

    const token = this.extractBearerToken(authorization);
    if (!token) {
      throw new Exception(AuthErrors.INVALID_CREDENTIALS_FORMAT);
    }

    return token;
  }

  private extractBearerToken(authorization: string): string | null {
    const parts = authorization.split(' ');
    return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  }

  private validateTokenOrFail(token: string): Auth.TokenPayload {
    try {
      return this.jwtManagerService?.verify<Auth.TokenPayload>(token);
    } catch (error) {
      this.logger.error(error);
      throw new Exception(AuthErrors.TOKEN_INVALID);
    }
  }

  private checkUserRole(context: ExecutionContext, userRole: string): void {
    const requiredRoles = this.getRequiredRoles(context);
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new Exception(AuthErrors.ACCESS_DENIED);
    }
  }

  private getRequiredRoles(context: ExecutionContext): string[] {
    return (
      this.reflector?.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || []
    );
  }

  private checkConditionalAccess(context: ExecutionContext, request: Auth.Request<Request>): void {
    const conditionalAccessConfig = this.getConditionalAccessConfig(context);
    if (conditionalAccessConfig) {
      this.checkAccessOrFail(conditionalAccessConfig, request);
    }
  }

  private getConditionalAccessConfig(context: ExecutionContext): ConditionalAccessConfig | null {
    return this.reflector?.getAllAndOverride<ConditionalAccessConfig>(ACCESS_CONTROL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private checkAccessOrFail(
    conditionalAccessConfig: ConditionalAccessConfig,
    request: Auth.Request<Request>,
  ): void {
    const accessContext: ConditionalAccessContext = {
      user: request.user,
      params: request.params,
      query: request.query,
      body: request.body,
      headers: request.headers,
    };

    if (!conditionalAccessConfig.condition(accessContext)) {
      throw new Exception(AuthErrors.ACCESS_DENIED);
    }
  }
}
