import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsStrongPassword, MinLength } from 'class-validator';
import { RoleEnum } from '@/domain/enums/role-enum';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @MinLength(2)
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'password123' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({ example: RoleEnum.USER, enum: RoleEnum })
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
