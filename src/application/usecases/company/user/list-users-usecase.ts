import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { UserMapper } from '@/domain/mappers';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { Exception } from '@/infraestructure/exceptions/builder/exception';

@Injectable()
export class ListUsersUseCase {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;

  constructor(
    @Inject('USER') private readonly userRepository: IUserRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, page?: number, pageSize?: number) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const validatedPage = this.validatePage(page);
    const validatedPageSize = this.validatePageSize(pageSize);

    const result = await this.findUsers(company.id, validatedPage, validatedPageSize);
    const dataInPage = this.countUsersReturned(result.users);

    return UserMapper.toResponseWithPagination({
      total: result.total,
      current_page: validatedPage,
      per_page: validatedPageSize,
      in_page: dataInPage,
      data: result.users,
    });
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  private async findUsers(companyId: number, page: number, pageSize: number) {
    return await this.userRepository.findByCompanyWithPagination(companyId, page, pageSize);
  }

  private countUsersReturned(users: UserEntity[]) {
    return users.length;
  }

  private validatePage(page?: number): number {
    return Number(page && page > 0 ? page : this.DEFAULT_PAGE);
  }

  private validatePageSize(pageSize?: number): number {
    return Number(pageSize && pageSize > 0 ? pageSize : this.DEFAULT_PAGE_SIZE);
  }
}
