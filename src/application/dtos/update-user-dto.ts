import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { RoleEnum } from '@/domain/enums/role-enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: RoleEnum.USER, enum: RoleEnum, required: false })
  @IsEnum(RoleEnum)
  @IsOptional()
  role?: RoleEnum;
}
