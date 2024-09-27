import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CreateCompanyDto } from '../create-company-dto';

describe('CreateCompanyDto', () => {
  it('should pass validation with valid name', async () => {
    const dto = new CreateCompanyDto();
    dto.name = 'Valid Company Name';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with short name', async () => {
    const dto = new CreateCompanyDto();
    dto.name = 'A';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with missing name', async () => {
    const dto = new CreateCompanyDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});