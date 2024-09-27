import { describe, it, expect, beforeEach } from 'vitest';
import { ListTasksUseCase } from '../list-tasks-in-company-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity, TaskEntity } from '@/domain/entities';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { TaskMapper } from '@/domain/mappers';

describe('ListTasksUseCase', () => {
  let listTasksUseCase: ListTasksUseCase;
  let taskRepositoryMock: MockProxy<ITaskRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    taskRepositoryMock = mockDeep<ITaskRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    listTasksUseCase = new ListTasksUseCase(taskRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should list tasks successfully', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const tasks: TaskEntity[] = [
        { id: 1, title: 'Task 1' } as TaskEntity,
        { id: 2, title: 'Task 2' } as TaskEntity,
      ];

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findWithPagination.mockResolvedValue({ tasks, total: 2 });

      const result = await listTasksUseCase.execute(companyId);

      expect(result).toEqual(
        TaskMapper.toResponseWithPagination({
          total: 2,
          current_page: 1,
          per_page: 10,
          in_page: 2,
          data: tasks,
        }),
      );
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(listTasksUseCase.execute(companyId)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });

    it('should use default pagination values when not provided', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findWithPagination.mockResolvedValue({ tasks: [], total: 0 });

      await listTasksUseCase.execute(companyId);

      expect(taskRepositoryMock.findWithPagination).toHaveBeenCalledWith(1, 1, 10);
    });

    it('should use provided pagination values', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findWithPagination.mockResolvedValue({ tasks: [], total: 0 });

      await listTasksUseCase.execute(companyId, 2, 20);

      expect(taskRepositoryMock.findWithPagination).toHaveBeenCalledWith(1, 2, 20);
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await listTasksUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await listTasksUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception if company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => listTasksUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception if company is not found', () => {
      expect(() => listTasksUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('private methods', () => {
    it('should validate page number', () => {
      const listTasksUseCaseAny = listTasksUseCase as any;

      expect(listTasksUseCaseAny.validatePage(2)).toBe(2);
      expect(listTasksUseCaseAny.validatePage(0)).toBe(1);
      expect(listTasksUseCaseAny.validatePage()).toBe(1);
    });

    it('should validate page size', () => {
      const listTasksUseCaseAny = listTasksUseCase as any;

      expect(listTasksUseCaseAny.validatePageSize(20)).toBe(20);
      expect(listTasksUseCaseAny.validatePageSize(0)).toBe(10);
      expect(listTasksUseCaseAny.validatePageSize()).toBe(10);
    });

    it('should count tasks returned', () => {
      const listTasksUseCaseAny = listTasksUseCase as any;
      const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }] as TaskEntity[];

      expect(listTasksUseCaseAny.countTasksReturned(tasks)).toBe(3);
    });

    it('should find tasks with pagination', async () => {
      const listTasksUseCaseAny = listTasksUseCase as any;
      const companyId = 1;
      const page = 2;
      const pageSize = 15;
      const expectedResult = { tasks: [], total: 0 };

      taskRepositoryMock.findWithPagination.mockResolvedValue(expectedResult);

      const result = await listTasksUseCaseAny.findTasks(companyId, page, pageSize);

      expect(result).toEqual(expectedResult);
      expect(taskRepositoryMock.findWithPagination).toHaveBeenCalledWith(companyId, page, pageSize);
    });
  });
});
