import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyEntity } from '../company-entity';

describe('CompanyEntity', () => {
  let companyProps: Partial<Company.Root>;

  beforeEach(() => {
    companyProps = {
      id: 1,
      name: 'Test Company',
    };
  });

  it('should create a new instance of CompanyEntity with the correct properties', () => {
    const company = new CompanyEntity(companyProps);

    expect(company.id).toBe(1);
    expect(company.name).toBe('Test Company');
    expect(company.uuid).toBeTypeOf('string');
    expect(company.createdAt).toBeInstanceOf(Date);
    expect(company.updatedAt).toBeUndefined();
  });

  it('should generate a new UUID when creating a new instance', () => {
    const company1 = new CompanyEntity(companyProps);
    const company2 = new CompanyEntity(companyProps);

    expect(company1.uuid).not.toEqual(company2.uuid);
  });

  it('should set createdAt when creating a new instance', () => {
    const now = new Date();
    const company = new CompanyEntity(companyProps);

    expect(company.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(company.createdAt.getTime()).toBeLessThanOrEqual(now.getTime() + 1000);
  });

  it('should update an existing instance without changing uuid and createdAt', () => {
    const originalCompany = new CompanyEntity(companyProps);
    const originalUuid = originalCompany.uuid;
    companyProps.uuid = originalCompany.uuid;
    companyProps.createdAt = originalCompany.createdAt;
    const originalCreatedAt = originalCompany.createdAt;

    const updatedProps = {
      ...companyProps,
      name: 'Updated Company',
    };

    const updatedCompany = new CompanyEntity(updatedProps, { update: true });

    expect(updatedCompany.uuid).toEqual(originalUuid);
    expect(updatedCompany.createdAt).toEqual(originalCreatedAt);
    expect(updatedCompany.name).toBe('Updated Company');
    expect(updatedCompany.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle optional properties correctly', () => {
    const companyWithoutOptionalProps = new CompanyEntity({
      name: 'Minimal Company',
    });

    expect(companyWithoutOptionalProps.id).toBeUndefined();
    expect(companyWithoutOptionalProps.users).toBeUndefined();
    expect(companyWithoutOptionalProps.tasks).toBeUndefined();
  });

  it('should allow setting users and tasks', () => {
    const mockUsers = [
      { id: 1, fullname: 'User 1' },
      { id: 2, fullName: 'User 2' },
    ] as Partial<User.Root>[];
    const mockTasks = [
      { id: 1, title: 'Task 1' },
      { id: 2, title: 'Task 2' },
    ] as Partial<Task.Root>[];

    const company = new CompanyEntity({
      ...companyProps,
      users: mockUsers,
      tasks: mockTasks,
    } as any);

    expect(company.users).toEqual(mockUsers);
    expect(company.tasks).toEqual(mockTasks);
  });
});
