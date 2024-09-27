import { validate } from 'class-validator';
import { describe,it, expect } from 'vitest';
import { UpdateUserDto } from '../update-user-dto';
import { RoleEnum } from '@/domain/enums/role-enum';

describe('UpdateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateUserDto();
    dto.email = 'updated@example.com';
    dto.full_name = 'Updated Name';
    dto.role = RoleEnum.ADMIN;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with partial data', async () => {
    const dto = new UpdateUserDto();
    dto.full_name = 'Updated Name';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid data', async () => {
    const dto = new UpdateUserDto();
    dto.email = 'invalid-email';
    dto.role = 'INVALID_ROLE' as RoleEnum;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});