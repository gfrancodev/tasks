import { normalizeUuid, stringToBinaryUUID } from '@/infraestructure/helpers/binary-uuid-helper';
import { CompanyEntity } from '../entities';
import { UserMapper } from './user-mapper';
import { TaskMapper } from './task-mapper';
import { mapOrEmpty } from '@/infraestructure/helpers/map-or-empity-helper';
import { mapOrUndefined } from '@/infraestructure/helpers/map-or-undefined-helper';

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

  static toResponse(company: Partial<CompanyEntity>) {
    return {
      id: company.uuid,
      name: company.name,
      users: mapOrEmpty(company.users, (user) => ({
        id: normalizeUuid(user.uuid),
        email: user.email,
      })),
      tasks: mapOrEmpty(company.tasks, (task) => ({
        id: normalizeUuid(task.uuid),
        title: task.title,
      })),
      created_at: company.createdAt,
      updated_at: company.updatedAt,
    };
  }

  static toResponseWithoutRelations(company: Partial<CompanyEntity>) {
    return {
      id: company.uuid,
      name: company.name,
      created_at: company.createdAt,
      updated_at: company.updatedAt,
    };
  }

  static toResponseWithPagination(result: {
    total: number;
    current_page: number;
    per_page: number;
    in_page: number;
    data: Partial<CompanyEntity>[];
  }) {
    return {
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      in_page: result.in_page,
      data: mapOrEmpty(result.data, (company) => CompanyMapper.toResponseWithoutRelations(company)),
    };
  }
}
