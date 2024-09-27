import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { TaskEntity } from '@/domain/entities/task-entity';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('TASK') private readonly taskRepository: ITaskRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(data: {
    companyId: string;
    taskId: string;
    currentUser: Auth.CurrentUser;
  }): Promise<void> {
    const company = await this.getCompanyById(data.companyId);
    this.checkIfCompanyFound(company);
    const task = await this.getTaskById(company.id, data.taskId);
    this.checkIfTaskFound(task);
    await this.deleteTask(company.id, task.id);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async getTaskById(companyId: number, taskId: string): Promise<TaskEntity | null> {
    return await this.taskRepository.findByUUID(companyId, taskId);
  }

  checkIfTaskFound(task: TaskEntity | null) {
    if (!task) {
      throw new Exception(TaskErrors.TASK_NOT_FOUND);
    }
  }

  async deleteTask(companyId: number, taskId: number): Promise<void> {
    await this.taskRepository.delete(companyId, taskId);
  }
}
