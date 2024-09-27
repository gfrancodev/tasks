import { ConditionalAccess } from './../../infraestructure/decorators/conditional-access-decorator';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/infraestructure/decorators/roles-decorator';
import { CreateUserUseCase } from '@/application/usecases/company/user/create-user-usecase';
import { GetUserUseCase } from '@/application/usecases/company/user/get-user-details-usecase';
import { UpdateUserUseCase } from '@/application/usecases/company/user/update-user-usecase';
import { DeleteUserUseCase } from '@/application/usecases/company/user/delete-user-usecase';
import { ListUsersUseCase } from '@/application/usecases/company/user/list-users-usecase';
import { CreateUserDto } from '@/application/dtos/create-user-dto';
import { UpdateUserDto } from '@/application/dtos/update-user-dto';
import { canAccessAdminOwnData, canAccessUserOwnData } from '@/infraestructure/rules/user-rules';
import { CurrentUser } from '@/infraestructure/decorators/current-user-decorator';

@ApiBearerAuth()
@ApiTags('Usuários')
@Controller('v1/company/:company_id/user')
export class CompanyUserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  async createUser(@Param('company_id') companyId: string, @Body() createUserDto: CreateUserDto) {
    return await this.createUserUseCase.execute(companyId, createUserDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter um usuário específico' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUser(@Param('company_id') companyId: string, @Param('id') id: string) {
    return await this.getUserUseCase.execute(companyId, id);
  }

  @ConditionalAccess(canAccessUserOwnData())
  @ConditionalAccess(canAccessAdminOwnData())
  @Put(':id')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    return await this.updateUserUseCase.execute(companyId, id, updateUserDto, currentUser);
  }

  @HttpCode(204)
  @ConditionalAccess(canAccessUserOwnData())
  @ConditionalAccess(canAccessAdminOwnData())
  @Delete(':id')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Excluir um usuário' })
  @ApiResponse({ status: 204, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deleteUser(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    await this.deleteUserUseCase.execute(companyId, id, currentUser);
  }

  @Get()
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários obtida com sucesso' })
  async listUsers(
    @Param('company_id') companyId: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    return await this.listUsersUseCase.execute(companyId, page, pageSize);
  }
}
