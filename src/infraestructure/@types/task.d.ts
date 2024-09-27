declare namespace Task {
  type Root = {
    id: number;
    uuid: string;
    title: string;
    description?: string;
    status: Status$Enum;
    dueDate: Date;
    companyId: number;
    assignedToId?: number;
    createdAt: Date;
    updatedAt: Date;
  };

  type Status$Enum = 'PENDIND' | 'IN_PROGRESS' | 'COMPLETED';
}
