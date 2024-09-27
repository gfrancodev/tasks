import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CreateUserDto } from '../create-user-dto';
import { RoleEnum } from '@/domain/enums/role-enum';

describe('CreateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateUserDto();
    dto.email = 'user@example.com';
    dto.full_name = 'John Doe';
    dto.password = 'StrongP@ss1';
    dto.role = RoleEnum.USER;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid data', async () => {
    const dto = new CreateUserDto();
    dto.email = 'invalid-email';
    dto.full_name = '';
    dto.password = 'weak';
    dto.role = 'INVALID_ROLE' as RoleEnum;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});