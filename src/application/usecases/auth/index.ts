import { Global, Module } from '@nestjs/common';
import { GetAuthenticatedUserUseCase } from './get-authenticated-user-usecase';
import { LoginUseCase } from './login-usecase';

@Global()
@Module({
  providers: [GetAuthenticatedUserUseCase, LoginUseCase],
  exports: [GetAuthenticatedUserUseCase, LoginUseCase],
})
export class Auth {}
