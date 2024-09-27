import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { TaskEntity } from '@/domain/entities/task-entity';
import { TaskFactory } from '@/domain/factories';
import { TaskMapper } from '@/domain/mappers';
import { CreateTaskDto } from '@/application/dtos/create-task-dto';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyEntity } from '@/domain/entities';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('TASK') private readonly taskRepository: ITaskRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, data: CreateTaskDto) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);
    const taskData = this.createTaskData(companyId, data);
    const createdTask = await this.createTask(company.id, taskData);
    return TaskMapper.toResponseWithoutRelations(createdTask);
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  createTaskData(companyId: string, data: CreateTaskDto): Partial<TaskEntity> {
    return TaskFactory.create({
      title: data.title,
      description: data.description,
      dueDate: data.due_date,
      status: data.status,
      companyId,
    });
  }

  async createTask(companyId: number, taskData: Partial<TaskEntity>): Promise<TaskEntity> {
    return await this.taskRepository.create(companyId, taskData);
  }
}
