import { Inject, Injectable } from '@nestjs/common';
import { Exception } from '../../../infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { CompanyMapper } from '@/domain/mappers';

@Injectable()
export class GetCompanyUseCase {
  constructor(@Inject('COMPANY') private readonly companyRepository: ICompanyRepository) {}

  async execute(companyId: string) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);
    return CompanyMapper.toResponseWithoutRelations(company);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }
}
