import { TaskEntity } from '@/domain/entities';
import { TaskStatusEnum } from '../../enums/task-status-enum';

export interface ITaskRepository {
  create(companyId: number, task: Partial<TaskEntity>): Promise<TaskEntity>;
  findAll(companyId: number): Promise<TaskEntity[]>;
  findById(companyId: number, id: number): Promise<TaskEntity | null>;
  findByUUID(companyId: number, uuid: string): Promise<TaskEntity | null>;
  findWithPagination(
    companyId: number,
    page: number,
    pageSize: number,
  ): Promise<{
    total: number;
    tasks: TaskEntity[];
  }>;
  update(companyId: number, id: number, task: Partial<TaskEntity>): Promise<TaskEntity>;
  delete(companyId: number, id: number): Promise<void>;
  findByAssignedUser(companyId: number, userId: number): Promise<TaskEntity[]>;
  updateStatus(companyId: number, id: number, status: TaskStatusEnum): Promise<TaskEntity>;
}
