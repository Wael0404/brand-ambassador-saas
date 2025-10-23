import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOfferDto {
  @ApiProperty({ example: 'Summer Collection 2024', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Discover our new summer collection with amazing discounts', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/summer-collection', required: false })
  @IsUrl()
  @IsOptional()
  externalLink?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
