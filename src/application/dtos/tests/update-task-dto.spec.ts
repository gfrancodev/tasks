import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { UpdateTaskDto } from '../update-task-dto';
import { TaskStatus } from '@prisma/client';

describe('UpdateTaskDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateTaskDto();
    dto.title = 'Updated Title';
    dto.status = TaskStatus.IN_PROGRESS;
    dto.due_date = '2023-01-01T00:00:00Z';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with partial data', async () => {
    const dto = new UpdateTaskDto();
    dto.title = 'Updated Title';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid data', async () => {
    const dto = new UpdateTaskDto();
    dto.title = '';
    dto.status = 'INVALID_STATUS' as TaskStatus;
    dto.due_date = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});