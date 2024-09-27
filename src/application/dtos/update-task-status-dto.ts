import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TaskStatusEnum } from '@/domain/enums/task-status-enum';

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatusEnum, description: 'Novo status da tarefa' })
  @IsEnum(TaskStatusEnum)
  status: TaskStatusEnum;
}
