import { describe, it, expect, beforeEach } from 'vitest';
import { AssociateTaskUserUseCase } from '../associate-task-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyEntity, TaskEntity, UserEntity } from '@/domain/entities';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { TaskMapper } from '@/domain/mappers';

describe('AssociateTaskUserUseCase', () => {
  let associateTaskUserUseCase: AssociateTaskUserUseCase;
  let taskRepositoryMock: MockProxy<ITaskRepository>;
  let userRepositoryMock: MockProxy<IUserRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;

  beforeEach(() => {
    taskRepositoryMock = mockDeep<ITaskRepository>();
    userRepositoryMock = mockDeep<IUserRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    associateTaskUserUseCase = new AssociateTaskUserUseCase(
      taskRepositoryMock,
      userRepositoryMock,
      companyRepositoryMock,
    );
  });

  describe('execute', () => {
    it('should associate a task to a user successfully', async () => {
      const data = {
        companyId: 'company-uuid',
        taskId: 'task-uuid',
        userId: 'user-uuid',
        currentUser: { id: 'current-user-uuid' } as Auth.CurrentUser,
      };
      const company: CompanyEntity = { id: 1, uuid: data.companyId } as CompanyEntity;
      const task: TaskEntity = { id: 1, uuid: data.taskId } as TaskEntity;
      const user: UserEntity = { id: 1, uuid: data.userId } as UserEntity;
      const updatedTask: TaskEntity = { ...task, assignedToId: user.id } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.update.mockResolvedValue(updatedTask);

      const result = await associateTaskUserUseCase.execute(data);

      expect(result).toEqual(TaskMapper.toResponseWithoutRelations(updatedTask));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(data.companyId);
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, data.taskId);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, data.userId);
      expect(taskRepositoryMock.update).toHaveBeenCalledWith(company.id, task.id, {
        assignedToId: user.id,
      });
    });

    it('should throw an exception if company is not found', async () => {
      const data = {
        companyId: 'non-existent-company-uuid',
        taskId: 'task-uuid',
        userId: 'user-uuid',
        currentUser: { id: 'current-user-uuid' } as Auth.CurrentUser,
      };

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(associateTaskUserUseCase.execute(data)).rejects.toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });

    it('should throw an exception if task is not found', async () => {
      const data = {
        companyId: 'company-uuid',
        taskId: 'non-existent-task-uuid',
        userId: 'user-uuid',
        currentUser: { id: 'current-user-uuid' } as Auth.CurrentUser,
      };
      const company: CompanyEntity = { id: 1, uuid: data.companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(associateTaskUserUseCase.execute(data)).rejects.toThrow(
        new Exception(TaskErrors.TASK_NOT_FOUND),
      );
    });

    it('should throw an exception if user is not found', async () => {
      const data = {
        companyId: 'company-uuid',
        taskId: 'task-uuid',
        userId: 'non-existent-user-uuid',
        currentUser: { id: 'current-user-uuid' } as Auth.CurrentUser,
      };
      const company: CompanyEntity = { id: 1, uuid: data.companyId } as CompanyEntity;
      const task: TaskEntity = { id: 1, uuid: data.taskId } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(associateTaskUserUseCase.execute(data)).rejects.toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('getCompanyById', () => {
    it('should return a company when found', async () => {
      const companyId = 'company-uuid';
      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);

      const result = await associateTaskUserUseCase['getCompanyById'](companyId);

      expect(result).toEqual(company);
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });

    it('should return null when company is not found', async () => {
      const companyId = 'non-existent-company-uuid';

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await associateTaskUserUseCase['getCompanyById'](companyId);

      expect(result).toBeNull();
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
    });
  });

  describe('checkIfCompanyFound', () => {
    it('should not throw an exception if company is found', () => {
      const company: CompanyEntity = { id: 1, uuid: 'company-uuid' } as CompanyEntity;

      expect(() => associateTaskUserUseCase['checkIfCompanyFound'](company)).not.toThrow();
    });

    it('should throw an exception if company is not found', () => {
      expect(() => associateTaskUserUseCase['checkIfCompanyFound'](null)).toThrow(
        new Exception(CompanyErrors.COMPANY_NOT_FOUND),
      );
    });
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      const companyId = 1;
      const taskId = 'task-uuid';
      const task: TaskEntity = { id: 1, uuid: taskId } as TaskEntity;

      taskRepositoryMock.findByUUID.mockResolvedValue(task);

      const result = await associateTaskUserUseCase['getTaskById'](companyId, taskId);

      expect(result).toEqual(task);
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, taskId);
    });

    it('should return null when task is not found', async () => {
      const companyId = 1;
      const taskId = 'non-existent-task-uuid';

      taskRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await associateTaskUserUseCase['getTaskById'](companyId, taskId);

      expect(result).toBeNull();
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, taskId);
    });
  });

  describe('checkIfTaskFound', () => {
    it('should not throw an exception if task is found', () => {
      const task: TaskEntity = { id: 1, uuid: 'task-uuid' } as TaskEntity;

      expect(() => associateTaskUserUseCase['checkIfTaskFound'](task)).not.toThrow();
    });

    it('should throw an exception if task is not found', () => {
      expect(() => associateTaskUserUseCase['checkIfTaskFound'](null)).toThrow(
        new Exception(TaskErrors.TASK_NOT_FOUND),
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await associateTaskUserUseCase['getUserById'](companyId, userId);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });

    it('should return null when user is not found', async () => {
      const companyId = 1;
      const userId = 'non-existent-user-uuid';

      userRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await associateTaskUserUseCase['getUserById'](companyId, userId);

      expect(result).toBeNull();
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception if user is found', () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid' } as UserEntity;

      expect(() => associateTaskUserUseCase['checkIfUserFound'](user)).not.toThrow();
    });

    it('should throw an exception if user is not found', () => {
      expect(() => associateTaskUserUseCase['checkIfUserFound'](null)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('associateTaskToUser', () => {
    it('should update the task with the assigned user', async () => {
      const companyId = 1;
      const taskId = 1;
      const user_id = 1;
      const updatedTask: TaskEntity = { id: taskId, assignedToId: user_id } as TaskEntity;

      taskRepositoryMock.update.mockResolvedValue(updatedTask);

      const result = await associateTaskUserUseCase['associateTaskToUser'](
        companyId,
        taskId,
        user_id,
      );

      expect(result).toEqual(updatedTask);
      expect(taskRepositoryMock.update).toHaveBeenCalledWith(companyId, taskId, {
        assignedToId: user_id,
      });
    });
  });
});
