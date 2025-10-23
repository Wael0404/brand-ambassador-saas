import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Get('subscriptions/:brandId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get brand subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async findSubscriptionsByBrand(@Param('brandId') brandId: string) {
    return this.plansService.findSubscriptionsByBrand(brandId);
  }
}
