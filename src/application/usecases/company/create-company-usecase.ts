import { Inject, Injectable } from '@nestjs/common';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CreateCompanyDto } from '../../dtos/create-company-dto';
import { CompanyFactory } from '@/domain/factories';
import { CompanyMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class CreateCompanyUseCase {
  constructor(@Inject('COMPANY') private readonly companyRepository: ICompanyRepository) {}

  async execute(data: CreateCompanyDto) {
    const companyData = this.createCompanyData(data);
    const createdCompany = await this.createCompany(companyData);
    return CompanyMapper.toResponseWithoutRelations(createdCompany);
  }

  checkIfCompanyAlreadyExists(company: CompanyEntity) {
    if (company) {
      throw new Exception(CompanyErrors.DUPLICATE_ENTRY);
    }
  }

  createCompanyData(data: CreateCompanyDto): Partial<CompanyEntity> {
    return CompanyFactory.create(data);
  }

  async createCompany(companyData: Partial<CompanyEntity>): Promise<CompanyEntity> {
    return await this.companyRepository.create(companyData);
  }
}
