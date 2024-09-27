import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateTaskUseCase } from '../update-task-usecase';
import { mockDeep, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@/domain/interfaces/repository/itask-repository';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { IUserRepository } from '@/domain/interfaces/repository/iuser-repository';
import { CompanyEntity, TaskEntity, UserEntity } from '@/domain/entities';
import { UpdateTaskDto } from '@/application/dtos/update-task-dto';
import { Exception } from '@/infraestructure/exceptions/builder/exception';
import { CompanyErrors } from '@/infraestructure/exceptions/errors/company-error';
import { UserErrors } from '@/infraestructure/exceptions/errors/user-error';
import { TaskErrors } from '@/infraestructure/exceptions/errors/task-error';
import { TaskMapper } from '@/domain/mappers';
import { TaskStatus } from '@prisma/client';

describe('UpdateTaskUseCase', () => {
  let updateTaskUseCase: UpdateTaskUseCase;
  let taskRepositoryMock: MockProxy<ITaskRepository>;
  let companyRepositoryMock: MockProxy<ICompanyRepository>;
  let userRepositoryMock: MockProxy<IUserRepository>;

  beforeEach(() => {
    taskRepositoryMock = mockDeep<ITaskRepository>();
    companyRepositoryMock = mockDeep<ICompanyRepository>();
    userRepositoryMock = mockDeep<IUserRepository>();
    updateTaskUseCase = new UpdateTaskUseCase(
      taskRepositoryMock,
      companyRepositoryMock,
      userRepositoryMock,
    );
  });

  describe('execute', () => {
    it('should update a task successfully', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'ADMIN' };

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: currentUser.id } as UserEntity;
      const task: TaskEntity = { id: 1, uuid: taskId, title: 'Original Task' } as TaskEntity;
      const updatedTask: TaskEntity = { ...task, ...updateTaskDto } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);
      taskRepositoryMock.update.mockResolvedValue(updatedTask);

      const result = await updateTaskUseCase.execute({
        companyId,
        taskId,
        data: updateTaskDto,
        currentUser,
      });

      expect(result).toEqual(TaskMapper.toResponseWithoutRelations(updatedTask));
      expect(companyRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, currentUser.id);
      expect(taskRepositoryMock.findByUUID).toHaveBeenCalledWith(company.id, taskId);
      expect(taskRepositoryMock.update).toHaveBeenCalledWith(
        company.id,
        task.id,
        expect.any(Object),
      );
    });

    it('should throw an exception if company is not found', async () => {
      const companyId = 'non-existent-uuid';
      const taskId = 'task-uuid';
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'ADMIN' };

      companyRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateTaskUseCase.execute({ companyId, taskId, data: updateTaskDto, currentUser }),
      ).rejects.toThrow(new Exception(CompanyErrors.COMPANY_NOT_FOUND));
    });

    it('should throw an exception if user is not found', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const currentUser: Auth.CurrentUser = { id: 'non-existent-user', role: 'ADMIN' };

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateTaskUseCase.execute({ companyId, taskId, data: updateTaskDto, currentUser }),
      ).rejects.toThrow(new Exception(UserErrors.USER_NOT_FOUND));
    });

    it('should throw an exception if task is not found', async () => {
      const companyId = 'company-uuid';
      const taskId = 'non-existent-task';
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'ADMIN' };

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: currentUser.id } as UserEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.findByUUID.mockResolvedValue(null);

      await expect(
        updateTaskUseCase.execute({ companyId, taskId, data: updateTaskDto, currentUser }),
      ).rejects.toThrow(new Exception(TaskErrors.TASK_NOT_FOUND));
    });

    it('should throw an exception if user has insufficient permissions', async () => {
      const companyId = 'company-uuid';
      const taskId = 'task-uuid';
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const currentUser: Auth.CurrentUser = { id: 'user-uuid', role: 'USER' };

      const company: CompanyEntity = { id: 1, uuid: companyId } as CompanyEntity;
      const user: UserEntity = { id: 1, uuid: currentUser.id, companyId: 2 } as UserEntity;
      const task: TaskEntity = { id: 1, uuid: taskId, assignedToId: 2, companyId: 1 } as TaskEntity;

      companyRepositoryMock.findByUUID.mockResolvedValue(company);
      userRepositoryMock.findByUUID.mockResolvedValue(user);
      taskRepositoryMock.findByUUID.mockResolvedValue(task);

      await expect(
        updateTaskUseCase.execute({ companyId, taskId, data: updateTaskDto, currentUser }),
      ).rejects.toThrow(new Exception(TaskErrors.INSUFFICIENT_PERMISSIONS));
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const companyId = 1;
      const userId = 'user-uuid';
      const user: UserEntity = { id: 1, uuid: userId } as UserEntity;

      userRepositoryMock.findByUUID.mockResolvedValue(user);

      const result = await updateTaskUseCase.getUserById(companyId, userId);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });

    it('should return null when user is not found', async () => {
      const companyId = 1;
      const userId = 'non-existent-user';

      userRepositoryMock.findByUUID.mockResolvedValue(null);

      const result = await updateTaskUseCase.getUserById(companyId, userId);

      expect(result).toBeNull();
      expect(userRepositoryMock.findByUUID).toHaveBeenCalledWith(companyId, userId);
    });
  });

  describe('checkIfUserFound', () => {
    it('should not throw an exception if user is found', () => {
      const user: UserEntity = { id: 1, uuid: 'user-uuid' } as UserEntity;

      expect(() => updateTaskUseCase.checkIfUserFound(user)).not.toThrow();
    });

    it('should throw an exception if user is not found', () => {
      expect(() => updateTaskUseCase.checkIfUserFound(null)).toThrow(
        new Exception(UserErrors.USER_NOT_FOUND),
      );
    });
  });
});
