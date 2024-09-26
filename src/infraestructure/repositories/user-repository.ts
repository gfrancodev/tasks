import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { UserEntity } from 'src/domain/entities';
import { RoleEnum } from 'src/domain/enums/role-enum';
import { IUserRepository } from 'src/domain/interfaces/repository/iuser-repository';
import { UserMapper } from 'src/domain/mappers';
import { stringToBinaryUUID } from '../helpers/binary-uuid-helper';
import { Exception } from '../exceptions/builder/exception';
import { GeneralErrors } from '../exceptions/errors/general-error';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByCompanyWithPagination(
    companyId: number,
    page: number,
    pageSize: number,
  ): Promise<{ users: UserEntity[]; total: number }> {
    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { company: true },
        }),
        this.prisma.user.count({
          where: {
            companyId: companyId,
          },
        }),
      ]);
      return {
        users: users.map(UserMapper.toDomain),
        total,
      };
    } catch (error) {
      this.logger.error('Error in findByCompanyWithPagination', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async create(companyId: number, user: Partial<UserEntity>) {
    try {
      const createdUser = await this.prisma.user.create({
        data: UserMapper.toPersistence({
          ...user,
          companyId,
          role: user.role || RoleEnum.USER,
        }) as User,
      });
      return UserMapper.toDomain(createdUser);
    } catch (error) {
      this.logger.error('Error in create user', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findAll(companyId: number) {
    try {
      const users = await this.prisma.user.findMany({
        where: { companyId },
        include: { company: true },
      });
      return users.map(UserMapper.toDomain);
    } catch (error) {
      this.logger.error('Error in findAll', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findById(companyId: number, id: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, companyId },
        include: { company: true },
      });
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      this.logger.error('Error in findById', error);
      return null;
    }
  }

  async findByUUID(companyId: number, uuid: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          uuid: stringToBinaryUUID(uuid),
          companyId,
        },
        include: { company: true },
      });
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      this.logger.error('Error in findByUUID', error);
      return null;
    }
  }

  async update(companyId: number, id: number, user: Partial<UserEntity>) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id, companyId },
        data: UserMapper.toPersistence(user),
        include: { company: true },
      });
      return UserMapper.toDomain(updatedUser);
    } catch (error) {
      this.logger.error('Error in update user', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async delete(companyId: number, id: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id, companyId },
      });
    } catch (error) {
      this.logger.error('Error in delete user', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { company: true },
      });
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      this.logger.error('Error in findByEmail', error);
      return null;
    }
  }

  async updateRole(companyId: number, id: number, role: RoleEnum) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id, companyId },
        data: { role },
        include: { company: true },
      });
      return UserMapper.toDomain(updatedUser);
    } catch (error) {
      this.logger.error('Error in updateRole', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findByCompanyAndRole(companyId: number, role: RoleEnum) {
    try {
      const users = await this.prisma.user.findMany({
        where: { companyId, role },
        include: { company: true },
      });
      return users.map(UserMapper.toDomain);
    } catch (error) {
      this.logger.error('Error in findByCompanyAndRole', error);
      return [];
    }
  }
}
