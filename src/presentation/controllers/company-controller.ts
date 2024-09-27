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
import { CreateCompanyUseCase } from '@/application/usecases/company/create-company-usecase';
import { GetCompanyUseCase } from '@/application/usecases/company/get-company-usecase';
import { UpdateCompanyUseCase } from '@/application/usecases/company/update-company-usecase';
import { DeleteCompanyUseCase } from '@/application/usecases/company/delete-company-usecase';
import { ListCompanyUseCase } from '@/application/usecases/company/list-company-usecase';
import { CreateCompanyDto } from '@/application/dtos/create-company-dto';
import { UpdateCompanyDto } from '@/application/dtos/update-company-dto';
import { canAccessAdminOwnData } from '@/infraestructure/rules/user-rules';
import { ConditionalAccess } from '@/infraestructure/decorators/conditional-access-decorator';

@ApiBearerAuth()
@ApiTags('Empresas')
@Controller('v1/company')
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly listCompanyUseCase: ListCompanyUseCase,
  ) {}

  @HttpCode(201)
  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar uma nova empresa' })
  @ApiBody({ type: CreateCompanyDto, description: 'Dados para criação da empresa' })
  @ApiResponse({
    status: 201,
    description: 'Empresa criada com sucesso',
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
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.createCompanyUseCase.execute(createCompanyDto);
  }

  @Get(':id')
  @HttpCode(200)
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Obter uma empresa específica' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async getCompany(@Param('id') id: string) {
    return await this.getCompanyUseCase.execute(id);
  }

  @HttpCode(200)
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ConditionalAccess(canAccessAdminOwnData())
  @ApiOperation({ summary: 'Atualizar uma empresa' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiBody({ type: UpdateCompanyDto, description: 'Dados para atualização da empresa' })
  @ApiResponse({
    status: 200,
    description: 'Empresa atualizada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return await this.updateCompanyUseCase.execute(id, updateCompanyDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ConditionalAccess(canAccessAdminOwnData())
  @ApiOperation({ summary: 'Excluir uma empresa' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Empresa excluída com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async deleteCompany(@Param('id') id: string) {
    await this.deleteCompanyUseCase.execute(id);
  }

  @Get()
  @HttpCode(200)
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar empresas' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Quantidade de itens por página',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas obtida com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async listCompanies(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return await this.listCompanyUseCase.execute(page, pageSize);
  }
}
