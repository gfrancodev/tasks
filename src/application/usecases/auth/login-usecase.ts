import { Injectable, Inject } from '@nestjs/common';
import { LoginDto } from '../../dtos/login-dto';
import { UserEntity } from '../../../domain/entities/user-entity';
import { Exception } from '../../../infraestructure/exceptions/builder/exception';
import { AuthErrors } from '../../../infraestructure/exceptions/errors/auth-error';
import { UserErrors } from '../../../infraestructure/exceptions/errors/user-error';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { IJwtManagerService } from '@/domain/interfaces/services/ijwtmanager-service';
import { compareHashedValue } from '@/infraestructure/helpers/secure-hash-helpers';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('USER')
    private readonly userRepository: IUserRepository,
    @Inject('JWT') private readonly jwtManagerService: IJwtManagerService,
  ) {}

  async execute(data: LoginDto) {
    const user = await this.getUserByEmail(data.email);
    this.checkIfUserFound(user);

    const isPasswordValid = await this.checkIsValidPassword(user.password, data.password);
    this.ifPasswordIsNotValid(isPasswordValid);

    const payload = this.createPayload(user);
    const accessToken = this.createAuthToken(payload);

    return {
      access_token: accessToken,
      company_id: user.company.uuid,
    };
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  checkIfUserFound(user: UserEntity) {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  async checkIsValidPassword(userPassword: UserEntity['password'], inputPassword: string) {
    return await compareHashedValue<UserEntity['password']>(inputPassword, userPassword);
  }

  ifPasswordIsNotValid(isPasswordValid: boolean) {
    if (!isPasswordValid) {
      throw new Exception(AuthErrors.AUTHENTICATION_FAILED);
    }
  }

  createPayload(user: UserEntity) {
    return {
      id: user.uuid,
      company_id: user.company.uuid,
      name: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  createAuthToken(payload: any) {
    return this.jwtManagerService.encode(payload);
  }
}
