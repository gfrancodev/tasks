import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { UserFactory } from '@/domain/factories';
import { UserMapper } from '@/domain/mappers';
import { UpdateUserDto } from '@/application/dtos/update-user-dto';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('USER') private readonly userRepository: IUserRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    companyId: string,
    userId: string,
    data: UpdateUserDto,
    currentUser: Auth.CurrentUser,
  ) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const user = await this.getUser(company.id, userId);
    this.checkIfUserFound(user);

    this.checkAdminPermission(user, currentUser);
    const updatedUser = await this.updateUser(user, data);

    return UserMapper.toResponseWithoutRelations(updatedUser);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  private checkAdminPermission(userToUpdate: UserEntity, currentUser: Auth.CurrentUser) {
    if (
      currentUser.role === 'ADMIN' &&
      userToUpdate.role === 'ADMIN' &&
      currentUser.id !== userToUpdate.uuid
    ) {
      throw new Exception(UserErrors.INSUFFICIENT_PERMISSIONS);
    }
  }

  async getCurrentUser(companyId: number, userId: string) {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  async getUser(companyId: number, userId: string) {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  checkIfUserFound(user: UserEntity) {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  async updateUser(user: UserEntity, data: UpdateUserDto) {
    const persistenceData = UserFactory.update({
      ...user,
      ...data,
    });
    return await this.userRepository.update(user.companyId, user.id, persistenceData);
  }
}
