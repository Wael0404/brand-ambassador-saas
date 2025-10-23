import { IsString, IsNotEmpty, IsOptional, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({ example: 'Summer Collection 2024' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Discover our new summer collection with amazing discounts' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://example.com/summer-collection', required: false })
  @IsUrl()
  @IsOptional()
  externalLink?: string;
}
