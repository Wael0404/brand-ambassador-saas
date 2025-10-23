import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrandAppConfigDto {
  @ApiProperty({ example: 'Acme App', required: false })
  @IsString()
  @IsOptional()
  appName?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: '#FF5733', required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: '#33FF57', required: false })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({ example: 'Roboto, sans-serif', required: false })
  @IsString()
  @IsOptional()
  typography?: string;
}
