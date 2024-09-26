import { describe, it, expect, beforeEach } from 'vitest';
import { UserEntity } from '../user-entity';
import { RoleEnum } from '../../enums/role-enum';

describe('UserEntity', () => {
  let userProps: Partial<User.Root>;

  beforeEach(() => {
    userProps = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      role: RoleEnum.USER,
      companyId: 1,
    };
  });

  it('should create a new instance of UserEntity with the correct properties', () => {
    const user = new UserEntity(userProps);

    expect(user.id).toBe(1);
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('password123');
    expect(user.role).toBe(RoleEnum.USER);
    expect(user.companyId).toBe(1);
    expect(user.uuid).toBeTypeOf('string');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeUndefined();
  });

  it('should generate a new UUID when creating a new instance', () => {
    const user1 = new UserEntity(userProps);
    const user2 = new UserEntity(userProps);

    expect(user1.uuid).not.toEqual(user2.uuid);
  });

  it('should set createdAt when creating a new instance', () => {
    const now = new Date();
    const user = new UserEntity(userProps);

    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(now.getTime() + 1000);
  });

  it('should update an existing instance without changing uuid and createdAt', () => {
    const originalUser = new UserEntity(userProps);
    userProps.uuid = originalUser.uuid;
    userProps.createdAt = originalUser.createdAt;

    const originalUuid = originalUser.uuid;
    const originalCreatedAt = originalUser.createdAt;

    const updatedProps = {
      ...userProps,
      email: 'updated@example.com',
      role: RoleEnum.ADMIN,
    };

    const updatedUser = new UserEntity(updatedProps, { update: true });

    expect(updatedUser.uuid).toEqual(originalUuid);
    expect(updatedUser.createdAt).toEqual(originalCreatedAt);
    expect(updatedUser.email).toBe('updated@example.com');
    expect(updatedUser.role).toBe(RoleEnum.ADMIN);
    expect(updatedUser.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle optional properties correctly', () => {
    const userWithoutOptionalProps = new UserEntity({
      email: 'minimal@example.com',
      password: 'minimalpass',
      companyId: 1,
    });

    expect(userWithoutOptionalProps.id).toBeUndefined();
    expect(userWithoutOptionalProps.role).toBeUndefined();
    expect(userWithoutOptionalProps.company).toBeUndefined();
    expect(userWithoutOptionalProps.tasks).toBeUndefined();
  });
});
