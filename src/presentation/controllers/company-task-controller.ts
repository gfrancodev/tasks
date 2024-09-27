import { Roles } from './../../infraestructure/decorators/roles-decorator';
import { ConditionalAccess } from './../../infraestructure/decorators/conditional-access-decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateTaskUseCase } from '@/application/usecases/company/task/create-task-usecase';
import { UpdateTaskUseCase } from '@/application/usecases/company/task/update-task-usecase';
import { DeleteTaskUseCase } from '@/application/usecases/company/task/delete-task-usecase';
import { CreateTaskDto } from '@/application/dtos/create-task-dto';
import { UpdateTaskDto } from '@/application/dtos/update-task-dto';
import { GetTaskUseCase } from '@/application/usecases/company/task/get-task-details-usecase';
import { ListTasksUseCase } from '@/application/usecases/company/task/list-tasks-in-company-usecase';
import { canAccessAdminOwnData, canAccessUserOwnData } from '@/infraestructure/rules/user-rules';
import { AssociateTaskUserDto } from '@/application/dtos/associate-task-dto';
import { AssociateTaskUserUseCase } from '@/application/usecases/company/task/associate-task-usecase';
import { CurrentUser } from '@/infraestructure/decorators/current-user-decorator';
import { UpdateTaskStatusDto } from '@/application/dtos/update-task-status-dto';
import { UpdateTaskStatusUseCase } from '@/application/usecases/company/task/update-task-status-usecase';
import { TaskEntity } from '@/domain/entities';

@ApiBearerAuth()
@ApiTags('Tarefas')
@Controller('v1/company/:company_id/task')
export class CompanyTaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly associateTaskUserUseCase: AssociateTaskUserUseCase,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
  ) {}

  @HttpCode(201)
  @Post()
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiBody({ type: CreateTaskDto, description: 'Dados para criação da tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: TaskEntity,
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
  async createTask(
    @Param('company_id') companyId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.createTaskUseCase.execute(companyId, createTaskDto);
  }

  @HttpCode(200)
  @Get(':id')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter uma tarefa pelo ID' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tarefa encontrada',
    type: TaskEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async getTask(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
  ) {
    return await this.getTaskUseCase.execute(companyId, id);
  }

  @HttpCode(200)
  @Get()
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar tarefas' })
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
    description: 'Lista de tarefas obtida com sucesso',
    type: [TaskEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async listTasks(
    @Param('company_id') companyId: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    return await this.listTasksUseCase.execute(companyId, page, pageSize);
  }

  @HttpCode(200)
  @Put(':id')
  @ConditionalAccess(canAccessUserOwnData())
  @ConditionalAccess(canAccessAdminOwnData())
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar uma tarefa existente' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    type: String,
  })
  @ApiBody({ type: UpdateTaskDto, description: 'Dados para atualização da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso',
    type: TaskEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async updateTask(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    return await this.updateTaskUseCase.execute({
      companyId,
      taskId: id,
      data: updateTaskDto,
      currentUser,
    });
  }

  @HttpCode(200)
  @Patch(':id/assign')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ConditionalAccess(canAccessAdminOwnData())
  @ApiOperation({ summary: 'Associar uma tarefa a um usuário' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    type: String,
  })
  @ApiBody({ type: AssociateTaskUserDto, description: 'Dados para associação da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa associada com sucesso',
    type: TaskEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa ou usuário não encontrado',
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
  async associateTaskUser(
    @Param('company_id') companyId: string,
    @Param('id') taskId: string,
    @Body() associateTaskUserDto: AssociateTaskUserDto,
    @CurrentUser() user: Auth.CurrentUser,
  ) {
    return await this.associateTaskUserUseCase.execute({
      companyId,
      taskId,
      userId: associateTaskUserDto.user_id,
      currentUser: user,
    });
  }

  @HttpCode(200)
  @Patch(':id/status')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar o status de uma tarefa' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    type: String,
  })
  @ApiBody({ type: UpdateTaskStatusDto, description: 'Dados para atualização do status' })
  @ApiResponse({
    status: 200,
    description: 'Status da tarefa atualizado com sucesso',
    type: TaskEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async updateTaskStatus(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    return await this.updateTaskStatusUseCase.execute({
      companyId,
      taskId: id,
      status: updateTaskStatusDto.status,
      currentUser,
    });
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Excluir uma tarefa' })
  @ApiParam({
    name: 'company_id',
    description: 'ID da empresa',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Tarefa excluída com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido',
  })
  async deleteTask(
    @Param('company_id') companyId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ): Promise<void> {
    await this.deleteTaskUseCase.execute({
      companyId,
      taskId: id,
      currentUser,
    });
  }
}
