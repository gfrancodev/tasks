import { describe, it, expect, beforeEach } from 'vitest';
import { TaskMapper } from '../task-mapper';
import { TaskEntity } from '../../entities/task-entity';
import { TaskStatusEnum } from '../../enums/task-status-enum';
import { binaryUUIDToString } from 'src/infraestructure/helpers/binary-uuid-helper';
import crypto from 'crypto';

describe('TaskMapper', () => {
  let validUUID: string;

  beforeEach(() => {
    validUUID = crypto.randomUUID();
  });

  describe('toDomain', () => {
    it('should correctly map raw data to TaskEntity', () => {
      const rawTask = {
        id: 1,
        uuid: validUUID,
        title: 'Test Task',
        description: 'This is a test task',
        status: 'PENDING',
        dueDate: new Date('2023-12-31'),
        companyId: 1,
        assignedToId: 2,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const taskEntity = TaskMapper.toDomain(rawTask);

      expect(taskEntity.id).toBe(1);
      expect(taskEntity.uuid).toBe(validUUID);
      expect(taskEntity.title).toBe('Test Task');
      expect(taskEntity.description).toBe('This is a test task');
      expect(taskEntity.status).toBe(TaskStatusEnum.PENDING);
      expect(taskEntity.dueDate).toEqual(new Date('2023-12-31'));
      expect(taskEntity.companyId).toBe(1);
      expect(taskEntity.assignedToId).toBe(2);
      expect(taskEntity.createdAt).toEqual(new Date('2023-01-01'));
      expect(taskEntity.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });

  describe('toPersistence', () => {
    it('should correctly map TaskEntity to persistence format', () => {
      const taskEntity: Partial<TaskEntity> = {
        uuid: validUUID,
        title: 'Test Task',
        description: 'This is a test task',
        status: TaskStatusEnum.PENDING as Task.Status$Enum,
        dueDate: new Date('2023-12-31'),
        companyId: 1,
        assignedToId: 2,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const persistenceTask = TaskMapper.toPersistence(taskEntity);

      expect(persistenceTask.uuid).toBeInstanceOf(Buffer);
      expect(binaryUUIDToString(persistenceTask.uuid)).toBe(validUUID);
      expect(persistenceTask.title).toBe('Test Task');
      expect(persistenceTask.description).toBe('This is a test task');
      expect(persistenceTask.status).toBe('PENDING');
      expect(persistenceTask.dueDate).toEqual(new Date('2023-12-31'));
      expect(persistenceTask.companyId).toBe(1);
      expect(persistenceTask.assignedToId).toBe(2);
      expect(persistenceTask.createdAt).toEqual(new Date('2023-01-01'));
      expect(persistenceTask.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });

  describe('toResponse', () => {
    it('should correctly map TaskEntity to response format', () => {
      const taskEntity: Partial<TaskEntity> = {
        uuid: validUUID,
        title: 'Test Task',
        description: 'This is a test task',
        status: TaskStatusEnum.PENDING as Task.Status$Enum,
        dueDate: new Date('2023-12-31'),
        company: { uuid: String(crypto.randomUUID()), name: 'Test Company' },
        assignedTo: { uuid: String(crypto.randomUUID()), email: 'user@example.com' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const responseTask = TaskMapper.toResponse(taskEntity);

      expect(responseTask.uuid).toBe(validUUID);
      expect(responseTask.title).toBe('Test Task');
      expect(responseTask.description).toBe('This is a test task');
      expect(responseTask.status).toBe('PENDING');
      expect(responseTask.dueDate).toEqual(new Date('2023-12-31'));
      expect(responseTask.company).toEqual({
        uuid: taskEntity.company.uuid,
        name: 'Test Company',
      });
      expect(responseTask.assignedTo).toEqual({
        uuid: taskEntity.assignedTo.uuid,
        email: 'user@example.com',
      });
      expect(responseTask.createdAt).toEqual(new Date('2023-01-01'));
      expect(responseTask.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should handle undefined company and assignedTo', () => {
      const taskEntity: Partial<TaskEntity> = {
        uuid: validUUID,
        title: 'Test Task',
        description: 'This is a test task',
        status: TaskStatusEnum.PENDING as Task.Status$Enum,
        dueDate: new Date('2023-12-31'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const responseTask = TaskMapper.toResponse(taskEntity);

      expect(responseTask.uuid).toBe(validUUID);
      expect(responseTask.title).toBe('Test Task');
      expect(responseTask.description).toBe('This is a test task');
      expect(responseTask.status).toBe('PENDING');
      expect(responseTask.dueDate).toEqual(new Date('2023-12-31'));
      expect(responseTask.company).toBeUndefined();
      expect(responseTask.assignedTo).toBeUndefined();
      expect(responseTask.createdAt).toEqual(new Date('2023-01-01'));
      expect(responseTask.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });
});
