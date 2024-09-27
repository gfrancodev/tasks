import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { AssociateTaskUserDto } from '../associate-task-dto';

describe('AssociateTaskUserDto', () => {
  it('should pass validation with valid UUID', async () => {
    const dto = new AssociateTaskUserDto();
    dto.user_id = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid UUID', async () => {
    const dto = new AssociateTaskUserDto();
    dto.user_id = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});