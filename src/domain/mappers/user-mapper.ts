import { normalizeUuid, stringToBinaryUUID } from 'src/infraestructure/helpers/binary-uuid-helper';
import { CompanyMapper } from './company-mapper';
import { TaskMapper } from './task-mapper';
import { UserEntity } from '../entities';
import { mapOrEmpty } from 'src/infraestructure/helpers/map-or-empity-helper';
import { mapAssignedToOrUndefined } from 'src/infraestructure/helpers/map-assign-or-undefined-helper';
import { mapOrNull } from 'src/infraestructure/helpers/map-or-null-helper';
import { mapOrUndefined } from 'src/infraestructure/helpers/map-or-undefined-helper';

export class UserMapper {
  static toDomain(raw: any): UserEntity {
    return {
      id: raw?.id,
      uuid: normalizeUuid(raw?.uuid),
      fullName: raw?.fullName,
      email: raw?.email,
      password: raw?.password,
      role: raw?.role as Role.$Enum,
      companyId: raw?.companyId,
      company: mapOrNull(raw?.company, CompanyMapper.toDomain),
      tasks: mapOrEmpty(raw?.tasks, TaskMapper.toDomain),
      createdAt: raw?.createdAt,
      updatedAt: raw?.updatedAt,
    };
  }

  static toPersistence(
    user: Partial<UserEntity>,
  ): General.ReplacePropertyType<User.Root, 'uuid', Buffer> {
    return {
      id: user?.id,
      uuid: mapOrUndefined(user.uuid, stringToBinaryUUID),
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponse(user: Partial<User.Root> & { company?: Company.Root; tasks?: Task.Root[] }) {
    return {
      uuid: user.uuid,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      company: mapAssignedToOrUndefined(user.company, (assignedTo) => ({
        uuid: assignedTo?.uuid,
        name: assignedTo.name,
      })),
      tasks: mapOrEmpty(user.tasks, (task) => ({ uuid: task.uuid, title: task.title })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
