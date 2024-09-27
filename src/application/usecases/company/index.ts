import { Global, Module } from '@nestjs/common';
import { CreateCompanyUseCase } from './create-company-usecase';
import { UpdateCompanyUseCase } from './update-company-usecase';
import { GetCompanyUseCase } from './get-company-usecase';
import { ListCompanyUseCase } from './list-company-usecase';
import { DeleteCompanyUseCase } from './delete-company-usecase';

@Global()
@Module({
  providers: [
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    GetCompanyUseCase,
    ListCompanyUseCase,
    DeleteCompanyUseCase,
  ],
  exports: [
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    GetCompanyUseCase,
    ListCompanyUseCase,
    DeleteCompanyUseCase,
  ],
})
export class Company {}
