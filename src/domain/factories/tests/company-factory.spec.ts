import { describe, it, expect } from 'vitest';
import { CompanyFactory } from '../company-factory';
import { CompanyEntity } from '../../entities/company-entity';

describe('CompanyFactory', () => {
  it('should create a new instance of CompanyEntity', () => {
    const props = { name: 'Test Company' };
    const company = CompanyFactory.create(props);

    expect(company).toBeInstanceOf(CompanyEntity);
    expect(company.name).toBe('Test Company');
    expect(company.createdAt).toBeInstanceOf(Date);
    expect(company.updatedAt).toBeUndefined();
  });

  it('should update an existing instance of CompanyEntity', () => {
    const originalCompany = CompanyFactory.create({ name: 'Original Company' });
    const updatedProps = {
      id: originalCompany.id,
      uuid: originalCompany.uuid,
      name: 'Updated Company',
      createdAt: originalCompany.createdAt,
    };

    const updatedCompany = CompanyFactory.update(updatedProps);

    expect(updatedCompany).toBeInstanceOf(CompanyEntity);
    expect(updatedCompany.name).toBe('Updated Company');
    expect(updatedCompany.uuid).toEqual(originalCompany.uuid);
    expect(updatedCompany.createdAt).toEqual(originalCompany.createdAt);
    expect(updatedCompany.updatedAt).toBeInstanceOf(Date);
  });
});
