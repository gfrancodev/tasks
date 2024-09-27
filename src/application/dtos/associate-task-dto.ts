import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssociateTaskUserDto {
  @ApiProperty({ description: 'UUID do usuário a ser associado à tarefa' })
  @IsUUID()
  user_id: string;
}
