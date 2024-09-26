import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Task } from '@prisma/client';
import { TaskEntity } from 'src/domain/entities';
import { TaskStatusEnum } from 'src/domain/enums/task-status-enum';
import { TaskMapper } from 'src/domain/mappers';
import { stringToBinaryUUID } from '../helpers/binary-uuid-helper';
import { ITaskRepository } from 'src/domain/interfaces/repository/itask-repository';
import { Exception } from '../exceptions/builder/exception';
import { GeneralErrors } from '../exceptions/errors/general-error';

@Injectable()
export class TaskRepository implements ITaskRepository {
  private readonly logger = new Logger(TaskRepository.name);
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(companyId: number, task: Partial<TaskEntity>) {
    try {
      const createdTask = await this.prisma.task.create({
        data: TaskMapper.toPersistence({
          ...task,
          companyId,
          status: task.status || (TaskStatusEnum.PENDING as Task.Status$Enum),
        }) as Task,
      });
      return TaskMapper.toDomain(createdTask);
    } catch (error) {
      this.logger.error('Error in create task', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findAll(companyId: number) {
    try {
      const tasks = (await this.prisma.task.findMany({
        where: { companyId },
        include: { company: true, assignedTo: true },
      })) as unknown as Task.Root & { company: Company.Root; assignedTo?: User.Root }[];
      return tasks.map(TaskMapper.toDomain);
    } catch (error) {
      this.logger.error('Error in findAll tasks', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findById(companyId: number, id: number) {
    try {
      const task = (await this.prisma.task.findFirst({
        where: { id, companyId },
        include: { company: true, assignedTo: true },
      })) as unknown as Task.Root & { company: Company.Root; assignedTo?: User.Root };
      return task ? TaskMapper.toDomain(task) : null;
    } catch (error) {
      this.logger.error('Error in findById task', error);
      return null;
    }
  }

  async findByUUID(companyId: number, uuid: string) {
    try {
      const task = await this.prisma.task.findFirst({
        where: {
          uuid: stringToBinaryUUID(uuid),
          companyId,
        },
        include: { company: true, assignedTo: true },
      });
      return task ? TaskMapper.toDomain(task) : null;
    } catch (error) {
      this.logger.error('Error in findByUUID task', error);
      return null;
    }
  }

  async update(companyId: number, id: number, task: Partial<TaskEntity>) {
    try {
      const updatedTask = (await this.prisma.task.update({
        where: { id, companyId },
        data: TaskMapper.toPersistence(task) as Task,
        include: { company: true, assignedTo: true },
      })) as unknown as Task.Root & { company: Company.Root; assignedTo?: User.Root };
      return TaskMapper.toDomain(updatedTask);
    } catch (error) {
      this.logger.error('Error in update task', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async delete(companyId: number, id: number): Promise<void> {
    try {
      await this.prisma.task.delete({
        where: { id, companyId },
      });
    } catch (error) {
      this.logger.error('Error in delete task', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findByAssignedUser(companyId: number, userId: number) {
    try {
      const tasks = (await this.prisma.task.findMany({
        where: { companyId, assignedToId: userId },
        include: { company: true, assignedTo: true },
      })) as unknown as Task.Root & { company: Company.Root; assignedTo?: User.Root }[];
      return tasks.map(TaskMapper.toDomain);
    } catch (error) {
      this.logger.error('Error in findByAssignedUser tasks', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async updateStatus(companyId: number, id: number, status: TaskStatusEnum) {
    try {
      const updatedTask = (await this.prisma.task.update({
        where: { id, companyId },
        data: { status },
        include: { company: true, assignedTo: true },
      })) as unknown as Task.Root & { company: Company.Root; assignedTo?: User.Root };
      return TaskMapper.toDomain(updatedTask);
    } catch (error) {
      this.logger.error('Error in updateStatus task', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }
}
