import { Inject, Injectable } from '@nestjs/common';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities/company-entity';
import { CompanyMapper } from '@/domain/mappers';

@Injectable()
export class ListCompanyUseCase {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;

  constructor(@Inject('COMPANY') private readonly companyRepository: ICompanyRepository) {}

  async execute(page?: number, pageSize?: number) {
    const validatedPage = this.validatePage(page);
    const validatedPageSize = this.validatePageSize(pageSize);
    const result = await this.findCompanys(validatedPage, validatedPageSize);
    const dataInPage = this.countCompanysReturned(result.companies);

    return CompanyMapper.toResponseWithPagination({
      total: result.total,
      current_page: validatedPage,
      per_page: validatedPageSize,
      in_page: dataInPage,
      data: result.companies,
    });
  }

  private async findCompanys(page: number, pageSize: number) {
    return await this.companyRepository.findWithPagination(page, pageSize);
  }

  private countCompanysReturned(companies: CompanyEntity[]) {
    return companies.length;
  }

  private validatePage(page?: number): number {
    return Number(page && page > 0 ? page : this.DEFAULT_PAGE);
  }

  private validatePageSize(pageSize?: number): number {
    return Number(pageSize && pageSize > 0 ? pageSize : this.DEFAULT_PAGE_SIZE);
  }
}
