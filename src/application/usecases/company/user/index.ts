import { Global, Module } from '@nestjs/common';
import { CreateUserUseCase } from './create-user-usecase';
import { UpdateUserUseCase } from './update-user-usecase';
import { DeleteUserUseCase } from './delete-user-usecase';
import { ListUsersUseCase } from './list-users-usecase';
import { GetUserUseCase } from './get-user-details-usecase';

@Global()
@Module({
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
  ],
})
export class CompanyUser {}
