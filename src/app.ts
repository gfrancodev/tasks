import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { Infraestructure } from './infraestructure';
import { Application } from './application';
import { Presentation } from './presentation';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './infraestructure/exceptions/filter/all-exceptions-filter';
import { AuthGuard } from './infraestructure/guards/auth-guard';

@Module({
  imports: [Infraestructure, Application, Presentation],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class App {}
