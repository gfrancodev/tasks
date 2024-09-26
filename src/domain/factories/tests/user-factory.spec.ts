import { describe, it, expect } from 'vitest';
import { UserFactory } from '../user-factory';
import { UserEntity } from '../../entities/user-entity';
import { RoleEnum } from '../../enums/role-enum';

describe('UserFactory', () => {
  it('should create a new instance of UserEntity', () => {
    const props = {
      email: 'test@example.com',
      password: 'password123',
      role: RoleEnum.USER,
      companyId: 1,
    };
    const user = UserFactory.create(props);

    expect(user).toBeInstanceOf(UserEntity);
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe(RoleEnum.USER);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeUndefined();
  });

  it('should update an existing instance of UserEntity', () => {
    const originalUser = UserFactory.create({
      email: 'original@example.com',
      password: 'password123',
      role: RoleEnum.USER,
      companyId: 1,
    });
    const updatedProps = {
      id: originalUser.id,
      uuid: originalUser.uuid,
      email: 'updated@example.com',
      role: RoleEnum.ADMIN,
      createdAt: originalUser.createdAt,
    };

    const updatedUser = UserFactory.update(updatedProps);

    expect(updatedUser).toBeInstanceOf(UserEntity);
    expect(updatedUser.email).toBe('updated@example.com');
    expect(updatedUser.role).toBe(RoleEnum.ADMIN);
    expect(updatedUser.uuid).toEqual(originalUser.uuid);
    expect(updatedUser.createdAt).toEqual(originalUser.createdAt);
    expect(updatedUser.updatedAt).toBeInstanceOf(Date);
  });
});
