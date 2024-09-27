import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { TaskMapper } from '@/domain/mappers';
import { CompanyEntity, TaskEntity, UserEntity } from '@/domain/entities';

@Injectable()
export class AssociateTaskUserUseCase {
  constructor(
    @Inject('TASK') private readonly taskRepository: ITaskRepository,
    @Inject('USER') private readonly userRepository: IUserRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(data: {
    companyId: string;
    taskId: string;
    userId: string;
    currentUser: Auth.CurrentUser;
  }) {
    const company = await this.getCompanyById(data.companyId);
    this.checkIfCompanyFound(company);

    const task = await this.getTaskById(company.id, data.taskId);
    this.checkIfTaskFound(task);

    const user = await this.getUserById(company.id, data.userId);
    this.checkIfUserFound(user);

    const updatedTask = await this.associateTaskToUser(company.id, task.id, user.id);
    return TaskMapper.toResponseWithoutRelations(updatedTask);
  }

  private async getCompanyById(companyId: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findByUUID(companyId);
  }

  private checkIfCompanyFound(company: CompanyEntity | null): void {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  private async getTaskById(companyId: number, taskId: string): Promise<TaskEntity | null> {
    return await this.taskRepository.findByUUID(companyId, taskId);
  }

  private checkIfTaskFound(task: TaskEntity | null): void {
    if (!task) {
      throw new Exception(TaskErrors.TASK_NOT_FOUND);
    }
  }

  private async getUserById(companyId: number, userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findByUUID(companyId, userId);
  }

  private checkIfUserFound(user: UserEntity | null): void {
    if (!user) {
      throw new Exception(UserErrors.USER_NOT_FOUND);
    }
  }

  private async associateTaskToUser(
    companyId: number,
    taskId: number,
    userId: number,
  ): Promise<TaskEntity> {
    return await this.taskRepository.update(companyId, taskId, { assignedToId: userId });
  }
}
