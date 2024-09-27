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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

  @Post()
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  async createTask(@Param('company_id') companyId: string, @Body() createTaskDto: CreateTaskDto) {
    return await this.createTaskUseCase.execute(companyId, createTaskDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obter uma tarefa específica' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async getTask(@Param('company_id') companyId: string, @Param('id') id: string) {
    return await this.getTaskUseCase.execute(companyId, id);
  }

  @Get()
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar tarefas' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas obtida com sucesso' })
  async listTasks(
    @Param('company_id') companyId: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    return await this.listTasksUseCase.execute(companyId, page, pageSize);
  }

  @Put(':id')
  @ConditionalAccess(canAccessUserOwnData())
  @ConditionalAccess(canAccessAdminOwnData())
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
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

  @Patch(':id/assign')
  @Roles('ADMIN')
  @ConditionalAccess(canAccessAdminOwnData())
  @ApiOperation({ summary: 'Associar uma tarefa a um usuário' })
  @ApiResponse({ status: 200, description: 'Tarefa associada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa ou usuário não encontrado' })
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

  @Patch(':id/status')
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atualizar o status de uma tarefa' })
  @ApiResponse({ status: 200, description: 'Status da tarefa atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
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
  @Roles('ADMIN', 'USER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Excluir uma tarefa' })
  @ApiResponse({ status: 204, description: 'Tarefa excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async deleteTask(
    @Param('company_id')
    companyId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: Auth.CurrentUser,
  ) {
    await this.deleteTaskUseCase.execute({
      companyId,
      taskId: id,
      currentUser,
    });
  }
}
