import { UserEntity } from '@/domain/entities';
import { RoleEnum } from '../../enums/role-enum';

export interface IUserRepository {
  create(companyId: number, user: Partial<UserEntity>): Promise<UserEntity>;
  findAll(companyId: number): Promise<UserEntity[]>;
  findById(companyId: number, id: number): Promise<UserEntity | null>;
  findByUUID(companyId: number, uuid: string): Promise<UserEntity | null>;
  update(companyId: number, id: number, user: Partial<UserEntity>): Promise<UserEntity>;
  delete(companyId: number, id: number): Promise<void>;
  findByEmail(email: string): Promise<UserEntity | null>;
  updateRole(companyId: number, id: number, role: RoleEnum): Promise<UserEntity>;
  findByCompanyAndRole(companyId: number, role: RoleEnum): Promise<UserEntity[]>;
  findByCompanyWithPagination(
    companyId: number,
    page: number,
    pageSize: number,
  ): Promise<{ users: UserEntity[]; total: number }>;
}
