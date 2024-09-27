import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from './repositories/user-repository';
import { CompanyRepository } from './repositories/company-repository';
import { TaskRepository } from './repositories/task-repository';
import { JwtManagerService } from './services/jwt-manager-service';
import { JwtService } from '@nestjs/jwt';
import { MysqlConnection } from './connections/mysql';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    MysqlConnection,
    PrismaClient,
    JwtService,
    {
      provide: 'USER',
      useFactory: (prisma: PrismaClient) => new UserRepository(prisma),
      inject: [PrismaClient],
    },
    {
      provide: 'COMPANY',
      useFactory: (prisma: PrismaClient) => new CompanyRepository(prisma),
      inject: [PrismaClient],
    },
    {
      provide: 'TASK',
      useFactory: (prisma: PrismaClient) => new TaskRepository(prisma),
      inject: [PrismaClient],
    },
    {
      provide: 'JWT',
      useClass: JwtManagerService,
    },
  ],
  exports: [
    MysqlConnection,
    PrismaClient,
    JwtService,
    {
      provide: 'USER',
      useFactory: (prisma: PrismaClient) => new UserRepository(prisma),
      inject: [PrismaClient],
    },
    {
      provide: 'COMPANY',
      useFactory: (prisma: PrismaClient) => new CompanyRepository(prisma),
      inject: [PrismaClient],
    },
    {
      provide: 'TASK',
      useFactory: (prisma: PrismaClient) => new TaskRepository(prisma),
      inject: [PrismaClient],
    },
    {
      provide: 'JWT',
      useClass: JwtManagerService,
    },
  ],
})
export class Infraestructure {}
