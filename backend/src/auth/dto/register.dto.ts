import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'brand@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

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
