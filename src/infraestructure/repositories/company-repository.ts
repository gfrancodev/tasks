import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Company } from '@prisma/client';
import { CompanyEntity } from '@/domain/entities';
import { ICompanyRepository } from '@/domain/interfaces/repository/icompany-repository';
import { CompanyMapper } from '@/domain/mappers';
import { stringToBinaryUUID } from '../helpers/binary-uuid-helper';
import { Exception } from '../exceptions/builder/exception';
import { GeneralErrors } from '../exceptions/errors/general-error';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  private readonly logger = new Logger(CompanyRepository.name);
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(company: Partial<CompanyEntity>): Promise<CompanyEntity> {
    try {
      const createdCompany = await this.prisma.company.create({
        data: CompanyMapper.toPersistence(company) as Company,
      });
      return CompanyMapper.toDomain(createdCompany);
    } catch (error) {
      this.logger.error('Error in create company', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findAll(): Promise<CompanyEntity[]> {
    try {
      const companies = await this.prisma.company.findMany();
      return companies.map(CompanyMapper.toDomain);
    } catch (error) {
      this.logger.error('Error in findAll companies', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findById(id: number): Promise<CompanyEntity | null> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: { users: true, tasks: true },
      });
      return company ? CompanyMapper.toDomain(company) : null;
    } catch (error) {
      this.logger.error('Error in findById company', error);
      return null;
    }
  }

  async findByUUID(uuid: string) {
    try {
      const company = await this.prisma.company.findFirst({
        where: { uuid: stringToBinaryUUID(uuid) },
        include: { users: true, tasks: true },
      });
      return company ? CompanyMapper.toDomain(company) : null;
    } catch (error) {
      this.logger.error('Error in findByUUID company', error);
      return null;
    }
  }

  async update(id: number, company: Partial<CompanyEntity>): Promise<CompanyEntity> {
    try {
      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: CompanyMapper.toPersistence(company),
        include: { users: true, tasks: true },
      });
      return CompanyMapper.toDomain(updatedCompany);
    } catch (error) {
      this.logger.error('Error in update company', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.company.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error('Error in delete company', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }

  async findByName(name: string): Promise<CompanyEntity | null> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { name },
        include: { users: true, tasks: true },
      });
      return company ? CompanyMapper.toDomain(company) : null;
    } catch (error) {
      this.logger.error('Error in findByName company', error);
      return null;
    }
  }

  async findWithPagination(
    page: number,
    pageSize: number,
  ): Promise<{ companies: CompanyEntity[]; total: number }> {
    try {
      const [companies, total] = await Promise.all([
        this.prisma.company.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { users: true, tasks: true },
        }),
        this.prisma.company.count(),
      ]);

      return {
        companies: companies.map(CompanyMapper.toDomain),
        total,
      };
    } catch (error) {
      this.logger.error('Error in findWithPagination companies', error);
      throw new Exception(GeneralErrors.DATABASE_ERROR, String(error?.message));
    }
  }
}
