import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { TaskEntity } from '@/domain/entities/task-entity';
import { TaskMapper } from '@/domain/mappers';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity } from '@/domain/entities';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';

@Injectable()
export class ListTasksUseCase {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;

  constructor(
    @Inject('TASK') private readonly taskRepository: ITaskRepository,
    @Inject('COMPANY') private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(companyId: string, page?: number, pageSize?: number) {
    const company = await this.getCompanyById(companyId);
    this.checkIfCompanyFound(company);

    const validatedPage = this.validatePage(page);
    const validatedPageSize = this.validatePageSize(pageSize);

    const result = await this.findTasks(company.id, validatedPage, validatedPageSize);
    const dataInPage = this.countTasksReturned(result.tasks);

    return TaskMapper.toResponseWithPagination({
      total: result.total,
      current_page: validatedPage,
      per_page: validatedPageSize,
      in_page: dataInPage,
      data: result.tasks,
    });
  }

  async getCompanyById(companyId: string) {
    return await this.companyRepository.findByUUID(companyId);
  }

  checkIfCompanyFound(company: CompanyEntity) {
    if (!company) {
      throw new Exception(CompanyErrors.COMPANY_NOT_FOUND);
    }
  }

  private async findTasks(companyId: number, page: number, pageSize: number) {
    return await this.taskRepository.findWithPagination(companyId, page, pageSize);
  }

  private countTasksReturned(tasks: TaskEntity[]) {
    return tasks.length;
  }

  private validatePage(page?: number): number {
    return Number(page && page > 0 ? page : this.DEFAULT_PAGE);
  }

  private validatePageSize(pageSize?: number): number {
    return Number(pageSize && pageSize > 0 ? pageSize : this.DEFAULT_PAGE_SIZE);
  }
}
