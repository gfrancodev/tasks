import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsString, IsEnum, IsOptional, IsDateString, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Updated Task Title', required: false })
  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated Task Description', required: false })
  @IsString()
  @MinLength(2)
  @IsOptional()
  description?: string;

  @ApiProperty({ example: TaskStatus.IN_PROGRESS, enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  due_date?: string;
}
