import {
  binaryUUIDToString,
  normalizeUuid,
  stringToBinaryUUID,
} from 'src/infraestructure/helpers/binary-uuid-helper';
import { CompanyEntity } from '../entities';
import { UserMapper } from './user-mapper';
import { TaskMapper } from './task-mapper';
import { mapOrEmpty } from 'src/infraestructure/helpers/map-or-empity-helper';
import { mapOrUndefined } from 'src/infraestructure/helpers/map-or-undefined';

export class CompanyMapper {
  static toDomain(raw: any): CompanyEntity {
    return {
      id: raw?.id,
      uuid: normalizeUuid(raw?.uuid),
      name: raw?.name,
      users: mapOrEmpty(raw?.users, UserMapper.toDomain),
      tasks: mapOrEmpty(raw?.tasks, TaskMapper.toDomain),
      createdAt: raw?.createdAt,
      updatedAt: raw?.updatedAt,
    };
  }

  static toPersistence(
    company: Partial<CompanyEntity>,
  ): General.ReplacePropertyType<Company.Root, 'uuid', Buffer> {
    return {
      id: company?.id,
      uuid: mapOrUndefined(company.uuid, stringToBinaryUUID),
      name: company.name,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  static toResponse(company: Partial<Company.Root> & { users: User.Root[]; tasks: Task.Root[] }) {
    return {
      uuid: company.uuid,
      name: company.name,
      users: mapOrEmpty(company.users, (user) => ({ uuid: user.uuid, email: user.email })),
      tasks: mapOrEmpty(company.tasks, (task) => ({ uuid: task.uuid, title: task.title })),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
