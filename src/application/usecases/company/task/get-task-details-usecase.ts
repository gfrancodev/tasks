import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { TaskEntity } from '@/domain/entities/task-entity';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { TaskMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject('TASK') private readonly taskRepository: ITaskRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, taskId: string) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const task = await this.getTaskById(company.id, taskId);
    this.checkIfTaskFound(task);

    return TaskMapper.toResponseWithoutRelations(task);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  async getTaskById(companyId: number, taskId: string) {
    return await this.taskRepository.findByUUID(companyId, taskId);
  }

  checkIfTaskFound(task: TaskEntity) {
    if (!task) {
      throw new Exception(TaskErrors.TASK_NOT_FOUND);
    }
  }
}
