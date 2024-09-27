import { Inject, Injectable } from '@nestjs/common';
import { Exception } from '../../../infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UpdateCompanyDto } from '../../dtos/update-company-dto';
import { CompanyFactory } from '@/domain/factories';
import { CompanyMapper } from '@/domain/mappers';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(@Inject('COMPANY') private readonly companyRepository: ICompanyRepository) {}

  async execute(companyId: string, data: UpdateCompanyDto) {
    const company = await this.companyRepository.findByUUID(companyId);
    this.checkIfCompanyFound(company);

    const companyByName = await this.checkIfCompanyNameIfUpdateName(data);
    this.checkIfCompanyAlreadyExist(companyByName);

    const companyUpdated = await this.updateCompany(company, data);
    return CompanyMapper.toResponseWithoutRelations(companyUpdated);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async getCompanyByName(name: string) {
    return await this.companyRepository.findByName(name);
  }

  async checkIfCompanyNameIfUpdateName(data: UpdateCompanyDto) {
    if (data.name) {
      return await this.getCompanyByName(data.name);
    }
    return null;
  }

  checkIfCompanyAlreadyExist(company: CompanyEntity) {
    if (company) {
      throw new Exception(CompanyErrors.DUPLICATE_ENTRY);
    }
  }

  async updateCompany(company: CompanyEntity, data: UpdateCompanyDto) {
    const persistenseData = CompanyFactory.update({
      ...company,
      ...data,
    });
    return await this.companyRepository.update(company.id, persistenseData);
  }
}
