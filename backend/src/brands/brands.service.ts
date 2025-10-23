import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { UpdateBrandConfigDto } from './dto/update-brand-config.dto';
import { UpdateBrandAppConfigDto } from './dto/update-brand-app-config.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['offers', 'subscriptions', 'subscriptions.plan'],
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async findBySubdomain(subdomain: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { subdomain },
      relations: ['offers', 'subscriptions', 'subscriptions.plan'],
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async updateConfig(id: string, updateBrandConfigDto: UpdateBrandConfigDto, userId: string): Promise<Brand> {
    const brand = await this.findOne(id);
    
    // Check if user has permission to update this brand
    if (brand.id !== id) {
      throw new ForbiddenException('You can only update your own brand');
    }

    Object.assign(brand, updateBrandConfigDto);
    return this.brandRepository.save(brand);
  }

  async updateAppConfig(id: string, updateBrandAppConfigDto: UpdateBrandAppConfigDto, userId: string): Promise<Brand> {
    const brand = await this.findOne(id);
    
    // Check if user has permission to update this brand
    if (brand.id !== id) {
      throw new ForbiddenException('You can only update your own brand');
    }

    Object.assign(brand, updateBrandAppConfigDto);
    return this.brandRepository.save(brand);
  }

  async generateAppConfig(brandId: string): Promise<any> {
    const brand = await this.findOne(brandId);
    
    const activeSubscription = brand.subscriptions?.find(sub => sub.status === 'active');
    const plan = activeSubscription?.plan;

    return {
      brand: {
        id: brand.id,
        companyName: brand.companyName,
        appName: brand.appName,
        logoUrl: brand.logoUrl,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        typography: brand.typography,
      },
      plan: plan ? {
        type: plan.type,
        name: plan.name,
        features: plan.features,
      } : null,
      modules: plan ? plan.features : {
        ambassador: [],
        brand: [],
      },
    };
  }
}
