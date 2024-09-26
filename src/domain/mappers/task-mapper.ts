import {
  normalizeUuid,
  stringToBinaryUUID,
} from 'src/infraestructure/helpers/binary-uuid-helper';
import { TaskEntity } from '../entities';
import { CompanyMapper } from './company-mapper';
import { UserMapper } from './user-mapper';
import { mapAssignedToOrUndefined } from 'src/infraestructure/helpers/map-assign-or-undefined-helper';
import { mapOrNull } from 'src/infraestructure/helpers/map-or-null-helper';
import { mapOrUndefined } from 'src/infraestructure/helpers/map-or-undefined-helper';

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
      uuid: task.uuid,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      company: mapAssignedToOrUndefined(task.company, (assignedTo) => ({
        uuid: assignedTo?.uuid,
        name: assignedTo.name,
      })),
      assignedTo: mapAssignedToOrUndefined(task.assignedTo, (assignedTo) => ({
        uuid: assignedTo.uuid,
        email: assignedTo.email,
      })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
