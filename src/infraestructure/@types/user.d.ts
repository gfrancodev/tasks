declare namespace User {
  type Root = {
    id: number;
    uuid: string;
    fullName: string;
    email: string;
    password: string;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
    role: Role.Types;
  };
}
