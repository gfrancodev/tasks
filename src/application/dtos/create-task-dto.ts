import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsString, IsEnum, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task Title' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'Task Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: TaskStatus.PENDING, enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  due_date: string;
}
