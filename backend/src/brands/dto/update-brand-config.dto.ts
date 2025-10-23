import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrandConfigDto {
  @ApiProperty({ example: 'Acme Corporation', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: 'brand@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;
}
