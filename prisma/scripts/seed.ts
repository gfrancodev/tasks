import * as bcrypt from 'bcrypt';
import { stringToBinaryUUID } from '../../src/infraestructure/helpers/binary-uuid-helper';
import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';

const logger = new Logger("SEED");
const prisma = new PrismaClient();

async function main() {
  
  const mainCompanyUuid = crypto.randomUUID();
  const mainCompany = await prisma.company.create({
    data: {
      uuid: stringToBinaryUUID(mainCompanyUuid),
      name: 'Main Company',
    },
  });

  logger.log('Main Company successfully created!');

  
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const superAdminUuid = crypto.randomUUID();
  await prisma.user.create({
    data: {
      uuid: stringToBinaryUUID(superAdminUuid),
      email: 'superadmin@example.com',
      fullName: 'Super Admin',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      companyId: mainCompany.id, 
    },
  });

  logger.log('SUPER_ADMIN user created successfully!');

  
  const companies = [
    { name: 'Company Exemplo 1' },
    { name: 'Company Exemplo 2' },
    { name: 'Company Exemplo 3' },
  ];

  for (const companyData of companies) {
    const companyUuid = crypto.randomUUID();
    const company = await prisma.company.create({
      data: {
        uuid: stringToBinaryUUID(companyUuid),
        name: companyData.name,
      },
    });

    const users = [
      { email: `admin@${company.name.toLowerCase().trim().replace(/\s+/g, '')}.com`, fullName: 'Administrador', role: Role.ADMIN },
      { email: `usuario1@${company.name.toLowerCase().trim().replace(/\s+/g, '')}.com`, fullName: 'Usuário 1', role: Role.USER },
      { email: `usuario2@${company.name.toLowerCase().trim().replace(/\s+/g, '')}.com`, fullName: 'Usuário 2', role: Role.USER },
    ];

    for (const userData of users) {
      const userUuid = crypto.randomUUID();
      await prisma.user.create({
        data: {
          uuid: stringToBinaryUUID(userUuid),
          email: userData.email,
          fullName: userData.fullName,
          password: hashedPassword,
          role: userData.role,
          companyId: company.id,
        },
      });
    }

    const tasksData = [
      {
        title: 'Tarefa 1',
        description: 'Descrição da Tarefa 1',
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Tarefa 2',
        description: 'Descrição da Tarefa 2',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Tarefa 3',
        description: 'Descrição da Tarefa 3',
        status: TaskStatus.COMPLETED,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    const companyUsers = await prisma.user.findMany({ where: { companyId: company.id } });

    for (const taskData of tasksData) {
      const taskUuid = crypto.randomUUID();
      await prisma.task.create({
        data: {
          uuid: stringToBinaryUUID(taskUuid),
          ...taskData,
          companyId: company.id,
          assignedToId: companyUsers[Math.floor(Math.random() * companyUsers.length)].id,
        },
      });
    }
  }

  logger.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
