import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskRepository } from '../task-repository';
import { PrismaClient } from '@prisma/client';
import { TaskMapper } from 'src/domain/mappers/task-mapper';
import { TaskStatusEnum } from 'src/domain/enums/task-status-enum';
import { stringToBinaryUUID } from 'src/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';
import { Exception } from '../../exceptions/builder/exception';

type MockPrismaClient = {
  [K in keyof PrismaClient]: jest.Mock;
} & {
  task: {
    findMany: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let prismaClientMock: MockPrismaClient;
  let validUUID: string;

  beforeEach(() => {
    prismaClientMock = {
      task: {
        findMany: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as MockPrismaClient;

    taskRepository = new TaskRepository(prismaClientMock as unknown as PrismaClient);
    validUUID = crypto.randomUUID();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const mockTask = {
        id: 1,
        title: 'New Task',
        status: TaskStatusEnum.PENDING,
        uuid: validUUID,
      } as any;
      prismaClientMock.task.create.mockResolvedValue(mockTask);

      const result = await taskRepository.create(1, { title: 'New Task' });

      expect(result).toEqual(TaskMapper.toDomain(mockTask));
      expect(prismaClientMock.task.create).toHaveBeenCalled();
    });

    it('should throw an exception if creation fails', async () => {
      prismaClientMock.task.create.mockRejectedValue(new Error('Creation error'));

      await expect(taskRepository.create(1, { title: 'New Task' })).rejects.toThrow(Exception);
    });
  });

  describe('findAll', () => {
    it('should return all tasks of a company', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', companyId: 1, uuid: stringToBinaryUUID(validUUID) },
        { id: 2, title: 'Task 2', companyId: 1, uuid: stringToBinaryUUID(validUUID) },
      ] as any;
      prismaClientMock.task.findMany.mockResolvedValue(mockTasks);

      const result = await taskRepository.findAll(1);

      expect(result).toHaveLength(2);
      expect(prismaClientMock.task.findMany).toHaveBeenCalledWith({
        where: { companyId: 1 },
        include: { company: true, assignedTo: true },
      });
    });

    it('should throw an exception if findAll fails', async () => {
      prismaClientMock.task.findMany.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findAll(1)).rejects.toThrow(Exception);
    });
  });

  describe('findById', () => {
    it('should find a task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Task 1',
        companyId: 1,
        uuid: stringToBinaryUUID(validUUID),
      } as any;
      prismaClientMock.task.findFirst.mockResolvedValue(mockTask);

      const result = await taskRepository.findById(1, 1);

      expect(result).toEqual(TaskMapper.toDomain(mockTask));
      expect(prismaClientMock.task.findFirst).toHaveBeenCalledWith({
        where: { id: 1, companyId: 1 },
        include: { company: true, assignedTo: true },
      });
    });

    it('should return null if task is not found', async () => {
      prismaClientMock.task.findFirst.mockResolvedValue(null);

      const result = await taskRepository.findById(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('findByUUID', () => {
    it('should find a task by UUID', async () => {
      const mockTask = { id: 1, title: 'Task 1', uuid: validUUID } as any;
      prismaClientMock.task.findFirst.mockResolvedValue(mockTask);

      const result = await taskRepository.findByUUID(1, validUUID);

      expect(result).toEqual(TaskMapper.toDomain(mockTask));
      expect(prismaClientMock.task.findFirst).toHaveBeenCalledWith({
        where: {
          uuid: stringToBinaryUUID(validUUID),
          companyId: 1,
        },
        include: { company: true, assignedTo: true },
      });
    });

    it('should return null if task is not found by UUID', async () => {
      prismaClientMock.task.findFirst.mockResolvedValue(null);

      const result = await taskRepository.findByUUID(1, validUUID);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const mockTask = { id: 1, title: 'Updated Task', uuid: validUUID } as any;
      prismaClientMock.task.update.mockResolvedValue(mockTask);

      const result = await taskRepository.update(1, 1, { title: 'Updated Task' });

      expect(result).toEqual(TaskMapper.toDomain(mockTask));
      expect(prismaClientMock.task.update).toHaveBeenCalled();
    });

    it('should throw an exception if update fails', async () => {
      prismaClientMock.task.update.mockRejectedValue(new Error('Update error'));

      await expect(taskRepository.update(1, 1, { title: 'Updated Task' })).rejects.toThrow(
        Exception,
      );
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      prismaClientMock.task.delete.mockResolvedValue({} as any);

      await taskRepository.delete(1, 1);

      expect(prismaClientMock.task.delete).toHaveBeenCalledWith({
        where: { id: 1, companyId: 1 },
      });
    });

    it('should throw an exception if delete fails', async () => {
      prismaClientMock.task.delete.mockRejectedValue(new Error('Delete error'));

      await expect(taskRepository.delete(1, 1)).rejects.toThrow(Exception);
    });
  });

  describe('findByAssignedUser', () => {
    it('should find tasks by assigned user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', assignedToId: 1, uuid: validUUID },
        { id: 2, title: 'Task 2', assignedToId: 1, uuid: validUUID },
      ] as any;
      prismaClientMock.task.findMany.mockResolvedValue(mockTasks);

      const result = await taskRepository.findByAssignedUser(1, 1);

      expect(result).toHaveLength(2);
      expect(prismaClientMock.task.findMany).toHaveBeenCalledWith({
        where: { companyId: 1, assignedToId: 1 },
        include: { company: true, assignedTo: true },
      });
    });

    it('should throw an exception if findByAssignedUser fails', async () => {
      prismaClientMock.task.findMany.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findByAssignedUser(1, 1)).rejects.toThrow(Exception);
    });
  });

  describe('updateStatus', () => {
    it("should update a task's status", async () => {
      const mockTask = { id: 1, status: TaskStatusEnum.IN_PROGRESS, uuid: validUUID } as any;
      prismaClientMock.task.update.mockResolvedValue(mockTask);

      const result = await taskRepository.updateStatus(1, 1, TaskStatusEnum.IN_PROGRESS);

      expect(result).toEqual(TaskMapper.toDomain(mockTask));
      expect(prismaClientMock.task.update).toHaveBeenCalledWith({
        where: { id: 1, companyId: 1 },
        data: { status: TaskStatusEnum.IN_PROGRESS },
        include: { company: true, assignedTo: true },
      });
    });

    it('should throw an exception if status update fails', async () => {
      prismaClientMock.task.update.mockRejectedValue(new Error('Status update error'));

      await expect(taskRepository.updateStatus(1, 1, TaskStatusEnum.IN_PROGRESS)).rejects.toThrow(
        Exception,
      );
    });
  });
});
