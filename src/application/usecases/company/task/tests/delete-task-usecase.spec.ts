import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteTaskUseCase } from '../delete-task-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity, TaskEntity } from '@/domain/entities';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';

describe('DeleteTaskUseCase', () => {
  let deleteTaskUseCase: DeleteTaskUseCase;
  let taskRepositoryMock: MockProxy<ITaskRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    taskRepositoryMock = mockDeep<ITaskRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    deleteTaskUseCase = new DeleteTaskUseCase(taskRepositoryMock, companyRepositoryMock);
  });

  describe('execute', () => {
    it('should delete a task successfully', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const task: TaskEntity = { id: 1, uuid: taskId, companyId: 1 } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);
      taskRepositoryMock.delete.mockResolvedValue();

      await expect(
        deleteTaskUseCase.execute({ companyId, taskId, currentUser: {} as Auth.CurrentUser }),
      ).resolves.not.toThrow();

      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, taskId);
      expect(taskRepositoryMock.delete).toHaveBeenCalledWith(company.id, task.id);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';
      const taskId = 'task-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        deleteTaskUseCase.execute({ companyId, taskId, currentUser: {} as Auth.CurrentUser }),
      ).rejects.toThrow(new Exception(CompanyErrors.COMPANY_NOT_FOUND));
    });

    it('should throw an exception if task is not found', async () => {
      const companyId = 'company-uuid';
      const taskId = 'non-existent-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        deleteTaskUseCase.execute({ companyId, taskId, currentUser: {} as Auth.CurrentUser }),
      ).rejects.toThrow(new Exception(TaskErrors.TASK_NOT_FOUND));
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await deleteTaskUseCase.getCompanyById(companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await deleteTaskUseCase.getCompanyById(companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception if company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => deleteTaskUseCase.checkIfCompanyFound(company)).not.toThrow();
    });

    it('should throw an exception if company is not found', () => {
      expect(() => deleteTaskUseCase.checkIfCompanyFound(null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      const companyId = 1;
      const taskId = 'task-uuid';
      const task: TaskEntity = { id: 1, uuid: taskId, companyId } as TaskEntity;

      taskRepositoryMock.findByUUID.mockResolvedValue(task);

      const result = await deleteTaskUseCase.getTaskById(companyId, taskId);

      expect(result).toEqual(task);
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, taskId);
    });

    it('should return null when task is not found', async () => {
      const companyId = 1;
      const taskId = 'non-existent-uuid';

      taskRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await deleteTaskUseCase.getTaskById(companyId, taskId);

      expect(result).toBeNull();
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, taskId);
    });
  });

  describe('checkIfTaskFound', () => {
    it('should not throw an exception if task is found', () => {
      const task: TaskEntity = { id: 1, uuid: 'task-uuid' } as TaskEntity;

      expect(() => deleteTaskUseCase.checkIfTaskFound(task)).not.toThrow();
    });

    it('should throw an exception if task is not found', () => {
      expect(() => deleteTaskUseCase.checkIfTaskFound(null)).toThrow(
        new Exception(TaskErrors.TASK_NOT_FOUND),
      );
    });
  });

  describe('deleteTask', () => {
    it('should call taskRepository.delete with correct parameters', async () => {
      const companyId = 1;
      const taskId = 1;

      await deleteTaskUseCase.deleteTask(companyId, taskId);

      expect(taskRepositoryMock.delete).toHaveBeenCalledWith(companyId, taskId);
    });

    it('should throw an exception if deletion fails', async () => {
      const companyId = 1;
      const taskId = 1;

      taskRepositoryMock.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteTaskUseCase.deleteTask(companyId, taskId)).rejects.toThrow(Error);
    });
  });
});
