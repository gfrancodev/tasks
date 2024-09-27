import { normalizeUuid, stringToBinaryUUID } from '@/infraestructure/helpers/binary-uuid-helper';
import { TaskEntity } from '../entities';
import { CompanyMapper } from './company-mapper';
import { UserMapper } from './user-mapper';
import { mapAssignedToOrUndefined } from '@/infraestructure/helpers/map-assign-or-undefined-helper';
import { mapOrNull } from '@/infraestructure/helpers/map-or-null-helper';
import { mapOrUndefined } from '@/infraestructure/helpers/map-or-undefined-helper';
import { mapOrEmpty } from '@/infraestructure/helpers/map-or-empity-helper';

export class TaskMapper {
  static toDomain(raw: any): TaskEntity {
    return {
      id: raw?.id,
      uuid: normalizeUuid(raw?.uuid),
      title: raw?.title,
      description: raw?.description,
      status: raw?.status as Task.Status$Enum,
      dueDate: raw?.dueDate,
      companyId: raw?.companyId,
      company: mapOrNull(raw?.company, CompanyMapper.toDomain),
      assignedToId: raw?.assignedToId,
      assignedTo: mapOrNull(raw?.assignedTo, UserMapper.toDomain),
      createdAt: raw?.createdAt,
      updatedAt: raw?.updatedAt,
    };
  }

  static toPersistence(
    task: Partial<TaskEntity>,
  ): General.ReplacePropertyType<Task.Root, 'uuid', Buffer> {
    return {
      id: task?.id,
      uuid: mapOrUndefined(task?.uuid, stringToBinaryUUID),
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      companyId: task.companyId,
      assignedToId: task.assignedToId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  static toResponse(task: Partial<TaskEntity>) {
    return {
      id: task.uuid,
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.dueDate,
      company: mapAssignedToOrUndefined(task.company, (assignedTo) => ({
        id: normalizeUuid(assignedTo?.uuid),
        name: assignedTo.name,
      })),
      assigned_to: mapAssignedToOrUndefined(task.assignedTo, (assignedTo) => ({
        id: normalizeUuid(assignedTo.uuid),
        email: assignedTo.email,
      })),
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    };
  }

  static toResponseWithoutRelations(task: Partial<TaskEntity>) {
    return {
      id: task.uuid,
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.dueDate,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    };
  }

  static toResponseWithPagination(result: {
    total: number;
    current_page: number;
    per_page: number;
    in_page: number;
    data: Partial<TaskEntity>[];
  }) {
    return {
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      in_page: result.in_page,
      data: mapOrEmpty(result.data, (task) => TaskMapper.toResponse(task)),
    };
  }
}
