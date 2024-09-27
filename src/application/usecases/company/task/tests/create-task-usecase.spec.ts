import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTaskUseCase } from '../create-task-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity, TaskEntity } from '@/domain/entities';
import { CreateTaskDto } from '@/application/dtos/create-task-dto';
import { TaskFactory } from '@/domain/factories';
import { TaskMapper } from '@/domain/mappers';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { TaskStatus } from '@prisma/client';

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let taskRepositoryMock: MockProxy<ITaskRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    taskRepositoryMock = mockDeep<ITaskRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    createTaskUseCase = new CreateTaskUseCase(taskRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should create a task successfully', async () => {
      const companyId = 'company-uuid';
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        due_date: '2023-01-01T00:00:00Z',
      };
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const createdTask: TaskEntity = {
        id: 1,
        uuid: 'task-uuid',
        title: 'Test Task',
        companyId: 1,
      } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.create.mockResolvedValue(createdTask);

      const result = await createTaskUseCase.execute(companyId, createTaskDto);

      expect(result).toEqual(TaskMapper.toResponseWithoutRelations(createdTask));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(taskRepositoryMock.create).toHaveBeenCalledWith(company.id, expect.any(Object));
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        status: TaskStatus.PENDING,
        due_date: '2023-01-01T00:00:00Z',
      };

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(createTaskUseCase.execute(companyId, createTaskDto)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await createTaskUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await createTaskUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception if company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => createTaskUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception if company is not found', () => {
      expect(() => createTaskUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('createTaskData', () => {
    it('should create task data using TaskFactory', () => {
      const companyId = 'company-uuid';
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        due_date: '2023-01-01T00:00:00Z',
      };

      const result = createTaskUseCase.createTaskData(companyId, createTaskDto);
      const taskFactory = TaskFactory.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        dueDate: createTaskDto.due_date,
        companyId,
      });
      expect(result).toEqual(
        expect.objectContaining({
          title: taskFactory.title,
          description: taskFactory.description,
          status: taskFactory.status,
          dueDate: taskFactory.dueDate,
        }),
      );
    });
  });

  describe('createTask', () => {
    it('should call taskRepository.create with correct data', async () => {
      const companyId = 1;
      const taskData: Partial<TaskEntity> = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2023-01-01T00:00:00Z'),
      } as any;
      const createdTask: TaskEntity = {
        id: 1,
        uuid: 'task-uuid',
        ...taskData,
        companyId,
      } as TaskEntity;

      taskRepositoryMock.create.mockResolvedValue(createdTask);

      const result = await createTaskUseCase.createTask(companyId, taskData);

      expect(result).toEqual(createdTask);
      expect(taskRepositoryMock.create).toHaveBeenCalledWith(companyId, taskData);
    });

    it('should throw an exception if task creation fails', async () => {
      const companyId = 1;
      const taskData: Partial<TaskEntity> = {
        title: 'Test Task',
        status: TaskStatus.PENDING,
        dueDate: new Date('2023-01-01T00:00:00Z'),
      } as any;

      taskRepositoryMock.create.mockRejectedValue(new Error('Database error'));

      await expect(createTaskUseCase.createTask(companyId, taskData)).rejects.toThrow(Error);
    });
  });
});
