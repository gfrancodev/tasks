import { UserEntity } from '../entities/user-entity';

export class UserFactory {
  static create(props: any) {
    return new UserEntity(props);
  }

  static update(props: any) {
    return new UserEntity(props, { update: true });
  }
}
