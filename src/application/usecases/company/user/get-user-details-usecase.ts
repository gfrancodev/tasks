import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { UserMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('USER') private readonly userRepository: IUserRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, userId: string) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const user = await this.getUserById(company.id, userId);
    this.checkIfUserFound(user);

    return UserMapper.toResponseWithoutRelations(user);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async getUserById(companyId: number, userId: string) {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  checkIfUserFound(user: UserEntity) {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }
}
