import { CompanyEntity } from '../../entities/company-entity';

export interface ICompanyRepository {
  create(company: Partial<CompanyEntity>): Promise<CompanyEntity>;
  findAll(): Promise<CompanyEntity[]>;
  findById(id: number): Promise<CompanyEntity | null>;
  findByUUID(uuid: string): Promise<CompanyEntity | null>;
  update(id: number, company: Partial<CompanyEntity>): Promise<CompanyEntity>;
  delete(id: number): Promise<void>;
  findByName(name: string): Promise<CompanyEntity | null>;
  findWithPagination(
    page: number,
    pageSize: number,
  ): Promise<{ companies: CompanyEntity[]; total: number }>;
}
