import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { UserEntity } from '@/domain/entities/user-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { CompanyEntity } from '@/domain/entities';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('USER') private readonly userRepository: IUserRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, userId: string, currentUser: Auth.CurrentUser): Promise<void> {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const user = await this.getUserById(company.id, userId);
    this.checkIfUserFound(user);
    this.checkAdminPermission(user, currentUser);

    await this.deleteUser(company.id, user.id);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  private checkAdminPermission(userToDelete: UserEntity, currentUser: Auth.CurrentUser) {
    if (
      currentUser.role === 'ADMIN' &&
      userToDelete.role === 'ADMIN' &&
      currentUser.id !== userToDelete.uuid
    ) {
      throw new Exception(UserErrors.INSUFFICIENT_PERMISSIONS);
    }
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async getUserById(companyId: number, userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  checkIfUserFound(user: UserEntity | null) {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  async deleteUser(companyId: number, userId: number): Promise<void> {
    await this.userRepository.delete(companyId, userId);
  }
}
