import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@ApiTags('Offers')
@Controller('offers')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  async create(@Body() createOfferDto: CreateOfferDto, @Request() req) {
    return this.offersService.create(createOfferDto, req.user.brandId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offers for the authenticated brand' })
  @ApiResponse({ status: 200, description: 'Offers retrieved successfully' })
  async findAll(@Request() req) {
    return this.offersService.findAllByBrand(req.user.brandId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiResponse({ status: 200, description: 'Offer retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update offer' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  async update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto, @Request() req) {
    return this.offersService.update(id, updateOfferDto, req.user.brandId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete offer' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.offersService.remove(id, req.user.brandId);
    return { message: 'Offer deleted successfully' };
  }
}
