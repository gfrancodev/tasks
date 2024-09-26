import { TaskEntity } from '../entities/task-entity';

export class TaskFactory {
  static create(props: any) {
    return new TaskEntity(props);
  }

  static update(props: any) {
    return new TaskEntity(props, { update: true });
  }
}
