import { Global, Module } from '@nestjs/common';
import { Auth } from './usecases/auth';
import { Company } from './usecases/company';
import { CompanyUser } from './usecases/company/user';
import { CompanyTask } from './usecases/company/task';

@Global()
@Module({
  imports: [Auth, Company, CompanyUser, CompanyTask],
})
export class Application {}
