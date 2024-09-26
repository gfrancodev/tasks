import { UserEntity } from './user-entity';
import { TaskEntity } from './task-entity';

export class CompanyEntity implements Company.Root {
  id: number;
  uuid: string;
  name: string;
  users: UserEntity[];
  tasks: TaskEntity[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<CompanyEntity>, options?: { update: boolean }) {
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
