import { Global, Module } from '@nestjs/common';
import { CreateTaskUseCase } from './create-task-usecase';
import { UpdateTaskUseCase } from './update-task-usecase';
import { DeleteTaskUseCase } from './delete-task-usecase';
import { ListTasksUseCase } from './list-tasks-in-company-usecase';
import { GetTaskUseCase } from './get-task-details-usecase';
import { AssociateTaskUserUseCase } from './associate-task-usecase';
import { UpdateTaskStatusUseCase } from './update-task-status-usecase';

@Global()
@Module({
  providers: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    GetTaskUseCase,
    AssociateTaskUserUseCase,
    UpdateTaskStatusUseCase,
  ],
  exports: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    GetTaskUseCase,
    AssociateTaskUserUseCase,
    UpdateTaskStatusUseCase,
  ],
})
export class CompanyTask {}
