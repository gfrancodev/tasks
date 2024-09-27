import { ConditionalAccess } from './../../infraestructure/decorators/conditional-access-decorator';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
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

  @HttpCode(201)
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiBody({ type: CreateUserDto, description: 'Dados para criação do usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async createUser(
    @Param('company_id') companyId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.createUserUseCase.execute(companyId, createUserDto);
  }

  @HttpCode(200)
  @Get(':id')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter um usuário específico' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async getUser(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
  ) {
    return await this.getUserUseCase.execute(companyId, id);
  }

  @HttpCode(200)
  @Put(':id')
  @ConditionalAccess(canAccessUserOwnData())
  @ConditionalAccess(canAccessAdminOwnData())
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
  })
  @ApiBody({ type: UpdateUserDto, description: 'Dados para atualização do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async updateUser(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    return await this.updateUserUseCase.execute(companyId, id, updateUserDto, currentUser);
  }

  @HttpCode(204)
  @Delete(':id')
  @ConditionalAccess(canAccessUserOwnData())
  @ConditionalAccess(canAccessAdminOwnData())
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Excluir um usuário' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Usuário excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async deleteUser(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    await this.deleteUserUseCase.execute(companyId, id, currentUser);
  }

  @HttpCode(200)
  @Get()
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: 'Quantidade de itens por página',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários obtida com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async listUsers(
    @Param('company_id') companyId: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    return await this.listUsersUseCase.execute(companyId, page, pageSize);
  }
}
