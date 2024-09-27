import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Company Name' })
  @IsString()
  @MinLength(2)
  name: string;
}
