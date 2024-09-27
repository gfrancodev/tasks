import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { TaskEntity } from '@/domain/entities/task-entity';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { TaskFactory } from '@/domain/factories';
import { TaskMapper } from '@/domain/mappers';
import { UpdateTaskDto } from '@/application/dtos/update-task-dto';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity, UserEntity } from '@/domain/entities';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('TASK') private readonly taskRepository: ITaskRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
    @Inject('USER') private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: {
    companyId: string;
    taskId: string;
    data: UpdateTaskDto;
    currentUser: Auth.CurrentUser;
  }) {
    const company = await this.getCompanyById(data.companyId);
    this.checkIfCompanyFound(company);

    const user = await this.getUserById(company.id, data.currentUser.id);
    this.checkIfUserFound(user);

    const task = await this.taskRepository.findByUUID(company.id, data.taskId);
    this.checkIfTaskFound(task);
    this.checkUserPermission(task, data.currentUser, user);

    const taskUpdated = await this.updateTask(company.id, task, data.data);
    return TaskMapper.toResponseWithoutRelations(taskUpdated);
  }

  async getUserById(companyId: number, userId: string) {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  checkIfUserFound(user: UserEntity) {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  private async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  private checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  private checkIfTaskFound(task: TaskEntity) {
    if (!task) {
      throw new Exception(TaskErrors.TASK_NOT_FOUND);
    }
  }

  private checkUserPermission(task: TaskEntity, curretUser: Auth.CurrentUser, user: UserEntity) {
    if (
      curretUser.role === 'USER' &&
      task.assignedToId !== user.id &&
      task.companyId !== user.companyId
    ) {
      throw new Exception(TaskErrors.INSUFFICIENT_PERMISSIONS);
    }
  }

  private async updateTask(companyId: number, task: TaskEntity, data: UpdateTaskDto) {
    const persistenceData = TaskFactory.update({
      ...task,
      ...data,
    });
    return await this.taskRepository.update(companyId, task.id, persistenceData);
  }
}
