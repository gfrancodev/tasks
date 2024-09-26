import { describe, it, expect, beforeEach } from 'vitest';
import { TaskEntity } from '../task-entity';
import { TaskStatusEnum } from '../../enums/task-status-enum';

describe('TaskEntity', () => {
  let taskProps: Partial<Task.Root>;

  beforeEach(() => {
    taskProps = {
      id: 1,
      title: 'Test Task',
      description: 'This is a test task',
      status: TaskStatusEnum.PENDING as Task.Status$Enum,
      dueDate: new Date('2024-01-01'),
      companyId: 1,
      assignedToId: 2,
    };
  });

  it('should create a new instance of TaskEntity with the correct properties', () => {
    const task = new TaskEntity(taskProps);

    expect(task.id).toBe(1);
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('This is a test task');
    expect(task.status).toBe(TaskStatusEnum.PENDING);
    expect(task.dueDate).toEqual(new Date('2024-01-01'));
    expect(task.companyId).toBe(1);
    expect(task.assignedToId).toBe(2);
    expect(task.uuid).toBeTypeOf('string');
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeUndefined();
  });

  it('should generate a new UUID when creating a new instance', () => {
    const task1 = new TaskEntity(taskProps);
    const task2 = new TaskEntity(taskProps);

    expect(task1.uuid).not.toEqual(task2.uuid);
  });

  it('should set createdAt when creating a new instance', () => {
    const now = new Date();
    const task = new TaskEntity(taskProps);

    expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(task.createdAt.getTime()).toBeLessThanOrEqual(now.getTime() + 1000);
  });

  it('should update an existing instance without changing uuid and createdAt', () => {
    const originalTask = new TaskEntity(taskProps);
    taskProps.uuid = originalTask.uuid;
    taskProps.createdAt = originalTask.createdAt;
    const originalUuid = originalTask.uuid;
    const originalCreatedAt = originalTask.createdAt;

    const updatedProps = {
      ...taskProps,
      title: 'Updated Task',
      status: TaskStatusEnum.IN_PROGRESS as Task.Status$Enum,
    };

    const updatedTask = new TaskEntity(updatedProps, { update: true });

    expect(updatedTask.uuid).toEqual(originalUuid);
    expect(updatedTask.createdAt).toEqual(originalCreatedAt);
    expect(updatedTask.title).toBe('Updated Task');
    expect(updatedTask.status).toBe(TaskStatusEnum.IN_PROGRESS);
    expect(updatedTask.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle optional properties correctly', () => {
    const taskWithoutOptionalProps = new TaskEntity({
      title: 'Minimal Task',
      status: TaskStatusEnum.PENDING as Task.Status$Enum,
      dueDate: new Date(),
      companyId: 1,
    });

    expect(taskWithoutOptionalProps.id).toBeUndefined();
    expect(taskWithoutOptionalProps.description).toBeUndefined();
    expect(taskWithoutOptionalProps.assignedTo).toBeUndefined();
    expect(taskWithoutOptionalProps.assignedToId).toBeUndefined();
  });

  it('should allow setting company and assignedTo', () => {
    const mockCompany = { id: 1, name: 'Test Company' } as Partial<Company.Root>;
    const mockUser = { id: 2, name: 'Test User' } as Partial<User.Root>;

    const task = new TaskEntity({
      ...taskProps,
      company: mockCompany,
      assignedTo: mockUser,
    } as any);

    expect(task.company).toEqual(mockCompany);
    expect(task.assignedTo).toEqual(mockUser);
  });
});
