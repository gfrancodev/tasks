import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { UpdateTaskStatusDto } from '../update-task-status-dto';
import { TaskStatusEnum } from '@/domain/enums/task-status-enum';

describe('UpdateTaskStatusDto', () => {
  it('should pass validation with valid status', async () => {
    const dto = new UpdateTaskStatusDto();
    dto.status = TaskStatusEnum.IN_PROGRESS;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid status', async () => {
    const dto = new UpdateTaskStatusDto();
    dto.status = 'INVALID_STATUS' as TaskStatusEnum;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});