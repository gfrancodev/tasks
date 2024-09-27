import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserEntity } from '@/domain/entities/user-entity';
import { UserFactory } from '@/domain/factories';
import { UserMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { CreateUserDto } from '@/application/dtos/create-user-dto';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER') private readonly userRepository: IUserRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, data: CreateUserDto) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const user = await this.getUserByEmail(data.email);
    this.checkIfUserAlreadyExists(user);

    const userData = this.createUserData(data);
    const createdUser = await this.createUser(company.id, userData);

    return UserMapper.toResponseWithoutRelations(createdUser);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  checkIfUserAlreadyExists(user: UserEntity) {
    if (user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  createUserData(data: CreateUserDto): Partial<UserEntity> {
    return UserFactory.create({
      email: data.email,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
    });
  }

  async createUser(companyId: number, userData: Partial<UserEntity>): Promise<UserEntity> {
    return await this.userRepository.create(companyId, userData);
  }
}
