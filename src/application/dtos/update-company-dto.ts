import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Updated Company Name', required: false })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;
}
