import { CompanyEntity } from './company-entity';
import { TaskEntity } from './task-entity';

export class UserEntity implements Partial<User.Root> {
  id: number;
  uuid: string;
  email: string;
  password: string;
  role: Role.$Enum;
  companyId: number;
  company: CompanyEntity;
  tasks: TaskEntity[];
  createdAt: Date;
  updatedAt?: Date;
  fullName: string;

  constructor(props: Partial<UserEntity>, options?: { update: boolean }) {
    Object.assign(this, props);

    if (!options?.update) {
      this.uuid = crypto.randomUUID();
      this.createdAt = new Date();
    }

    if (options?.update) {
      this.updatedAt = new Date();
    }
  }
}
