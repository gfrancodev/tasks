import { UserEntity } from './user-entity';
import { CompanyEntity } from './company-entity';

export class TaskEntity implements Task.Root {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  status: Task.Status$Enum;
  dueDate: Date;
  companyId: number;
  company: CompanyEntity;
  assignedTo?: UserEntity;
  assignedToId?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<TaskEntity>, options?: { update: boolean }) {
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
