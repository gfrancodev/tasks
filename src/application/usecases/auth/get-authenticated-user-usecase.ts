import { Inject, Injectable } from '@nestjs/common';
import { Exception } from '../../../infraestructure/exceptions/builder/exception';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { CompanyEntity } from '@/domain/entities';
import { UserMapper } from '@/domain/mappers';

@Injectable()
export class GetAuthenticatedUserUseCase {
  constructor(
    @Inject('USER')
    private readonly userRepository: IUserRepository,
    @Inject('COMPANY')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(currentUser: Auth.CurrentUser) {
    const company = await this.getCompanyById(currentUser.company_id);
    this.checkICompanyFound(company);
    const user = await this.getUserById(company.id, currentUser.id);
    this.checkIfUserFound(user);
    return UserMapper.toResponse(user);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  async getUserById(companyId: number, userId: string) {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  checkIfUserFound(user: UserEntity) {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  checkICompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }
}
