import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { LoginDto } from '../login-dto';

describe('LoginDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid email', async () => {
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with missing password', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});