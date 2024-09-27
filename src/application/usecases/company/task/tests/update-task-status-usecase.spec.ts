import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateTaskStatusUseCase } from '../update-task-status-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { CompanyEntity, TaskEntity, UserEntity } from '@/domain/entities';
import { TaskStatusEnum } from '@/domain/enums/task-status-enum';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { TaskMapper } from '@/domain/mappers';

describe('UpdateTaskStatusUseCase', () => {
  let updateTaskStatusUseCase: UpdateTaskStatusUseCase;
  let taskRepositoryMock: MockProxy<ITaskRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;
  let userRepositoryMock: MockProxy<IUserRepository>;

  beforeEach(() => {
    taskRepositoryMock = mockDeep<ITaskRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    userRepositoryMock = mockDeep<IUserRepository>();
    updateTaskStatusUseCase = new UpdateTaskStatusUseCase(
      taskRepositoryMock,
      companyRepositoryMock,
      userRepositoryMock,
    );
  });

  describe('execute', () => {
    it('should update task status successfully', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const status = TaskStatusEnum.IN_PROGRESS;
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'ADMIN' } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = {
        id: 1,
        uuid: currentUser.id,
        role: currentUser.role,
      } as UserEntity;
      const task: TaskEntity = { id: 1, uuid: taskId, companyId: company.id } as TaskEntity;
      const updatedTask: TaskEntity = { ...task, status } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);
      taskRepositoryMock.updateStatus.mockResolvedValue(updatedTask);

      const result = await updateTaskStatusUseCase.execute({
        companyId,
        taskId,
        status,
        currentUser,
      });

      expect(result).toEqual(TaskMapper.toResponseWithoutRelations(updatedTask));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, currentUser.id);
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, taskId);
      expect(taskRepositoryMock.updateStatus).toHaveBeenCalledWith(company.id, task.id, status);
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-company';
      const taskId = 'task-uuid';
      const status = TaskStatusEnum.IN_PROGRESS;
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'ADMIN' } as any;

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateTaskStatusUseCase.execute({ companyId, taskId, status, currentUser }),
      ).rejects.toThrow(new Exception(CompanyErrors.COMPANY_NOT_FOUND));
    });

    it('should throw an exception if user is not found', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const status = TaskStatusEnum.IN_PROGRESS;
      const currentUser: Auth.CurrentUser = { id: 'non-existent-user', role: 'ADMIN' } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateTaskStatusUseCase.execute({ companyId, taskId, status, currentUser }),
      ).rejects.toThrow(new Exception(UserErrors.USER_NOT_FOUND));
    });

    it('should throw an exception if task is not found', async () => {
      const companyId = 'company-uuid';
      const taskId = 'non-existent-task';
      const status = TaskStatusEnum.IN_PROGRESS;
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'ADMIN' } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = {
        id: 1,
        uuid: currentUser.id,
        role: currentUser.role,
      } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateTaskStatusUseCase.execute({ companyId, taskId, status, currentUser }),
      ).rejects.toThrow(new Exception(TaskErrors.TASK_NOT_FOUND));
    });

    it('should throw an exception if user has insufficient permissions', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const status = TaskStatusEnum.IN_PROGRESS;
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'USER' } as any;

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = {
        id: 1,
        uuid: currentUser.id,
        role: currentUser.role,
        companyId: 2,
      } as UserEntity;
      const task: TaskEntity = {
        id: 1,
        uuid: taskId,
        companyId: company.id,
        assignedToId: 2,
      } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);

      await expect(
        updateTaskStatusUseCase.execute({ companyId, taskId, status, currentUser }),
      ).rejects.toThrow(new Exception(TaskErrors.INSUFFICIENT_PERMISSIONS));
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await updateTaskStatusUseCase.getUserById(companyId, userId);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception if user is found', () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid' } as UserEntity;

      expect(() => updateTaskStatusUseCase.checkIfUserFound(user)).not.toThrow();
    });

    it('should throw an exception if user is not found', () => {
      expect(() => updateTaskStatusUseCase.checkIfUserFound(null)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });
});
