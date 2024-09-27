import { Global, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth-controller';
import { CompanyController } from './controllers/company-controller';
import { CompanyUserController } from './controllers/company-user-controller';
import { CompanyTaskController } from './controllers/company-task-controller';

@Global()
@Module({
  controllers: [AuthController, CompanyController, CompanyUserController, CompanyTaskController],
})
export class Presentation {}
