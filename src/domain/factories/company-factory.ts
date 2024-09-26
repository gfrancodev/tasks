import { CompanyEntity } from '../entities/company-entity';

export class CompanyFactory {
  static create(props: any) {
    return new CompanyEntity(props);
  }

  static update(props: any) {
    return new CompanyEntity(props, { update: true });
  }
}
