import { describe, it, expect } from 'vitest';
import { TaskFactory } from '../task-factory';
import { TaskEntity } from '../../entities/task-entity';
import { TaskStatusEnum } from '../../enums/task-status-enum';

describe('TaskFactory', () => {
  it('should create a new instance of TaskEntity', () => {
    const props = {
      title: 'Test Task',
      status: TaskStatusEnum.PENDING as Task.Status$Enum,
      dueDate: new Date(),
      companyId: 1,
    };
    const task = TaskFactory.create(props);

    expect(task).toBeInstanceOf(TaskEntity);
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe(TaskStatusEnum.PENDING);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeUndefined();
  });

  it('should update an existing instance of TaskEntity', () => {
    const originalTask = TaskFactory.create({
      title: 'Original Task',
      status: TaskStatusEnum.PENDING as Task.Status$Enum,
      dueDate: new Date(),
      companyId: 1,
    });
    const updatedProps = {
      id: originalTask.id,
      uuid: originalTask.uuid,
      title: 'Updated Task',
      status: TaskStatusEnum.IN_PROGRESS as Task.Status$Enum,
      createdAt: originalTask.createdAt,
    };

    const updatedTask = TaskFactory.update(updatedProps);

    expect(updatedTask).toBeInstanceOf(TaskEntity);
    expect(updatedTask.title).toBe('Updated Task');
    expect(updatedTask.status).toBe(TaskStatusEnum.IN_PROGRESS);
    expect(updatedTask.uuid).toEqual(originalTask.uuid);
    expect(updatedTask.createdAt).toEqual(originalTask.createdAt);
    expect(updatedTask.updatedAt).toBeInstanceOf(Date);
  });
});
