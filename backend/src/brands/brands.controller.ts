import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { UpdateBrandConfigDto } from './dto/update-brand-config.dto';
import { UpdateBrandAppConfigDto } from './dto/update-brand-app-config.dto';

@ApiTags('Brands')
@Controller('brands')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({ summary: 'Get brand by subdomain' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.brandsService.findBySubdomain(subdomain);
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Update brand configuration' })
  @ApiResponse({ status: 200, description: 'Brand configuration updated' })
  async updateConfig(
    @Param('id') id: string,
    @Body() updateBrandConfigDto: UpdateBrandConfigDto,
    @Request() req,
  ) {
    return this.brandsService.updateConfig(id, updateBrandConfigDto, req.user.userId);
  }

  @Put(':id/app-config')
  @ApiOperation({ summary: 'Update brand app configuration' })
  @ApiResponse({ status: 200, description: 'Brand app configuration updated' })
  async updateAppConfig(
    @Param('id') id: string,
    @Body() updateBrandAppConfigDto: UpdateBrandAppConfigDto,
    @Request() req,
  ) {
    return this.brandsService.updateAppConfig(id, updateBrandAppConfigDto, req.user.userId);
  }

  @Get(':id/app-config.json')
  @ApiOperation({ summary: 'Get brand app configuration JSON' })
  @ApiResponse({ status: 200, description: 'App configuration retrieved' })
  async getAppConfig(@Param('id') id: string) {
    return this.brandsService.generateAppConfig(id);
  }
}
