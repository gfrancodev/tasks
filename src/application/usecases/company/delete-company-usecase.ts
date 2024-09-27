import { Inject, Injectable } from '@nestjs/common';
import { Exception } from '../../../infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { CompanyEntity } from '@/domain/entities/company-entity';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(@Inject('COMPANY') private readonly companyRepository: ICompanyRepository) {}

  async execute(companyId: string): Promise<void> {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);
    await this.deleteCompany(company.id);
  }

  async getCompanyById(companyId: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity | null) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async deleteCompany(companyId: number): Promise<void> {
    await this.companyRepository.delete(companyId);
  }
}
