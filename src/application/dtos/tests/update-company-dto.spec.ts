import { describe,it, expect } from 'vitest';
import { validate } from 'class-validator';
import { UpdateCompanyDto } from '../update-company-dto';

describe('UpdateCompanyDto', () => {
  it('should pass validation with valid name', async () => {
    const dto = new UpdateCompanyDto();
    dto.name = 'Updated Company Name';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with no data (optional update)', async () => {
    const dto = new UpdateCompanyDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with short name', async () => {
    const dto = new UpdateCompanyDto();
    dto.name = 'A';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});