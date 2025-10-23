import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
  ) {}

  async create(createOfferDto: CreateOfferDto, brandId: string): Promise<Offer> {
    const offer = this.offerRepository.create({
      ...createOfferDto,
      brandId,
    });

    return this.offerRepository.save(offer);
  }

  async findAllByBrand(brandId: string): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { brandId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async update(id: string, updateOfferDto: UpdateOfferDto, brandId: string): Promise<Offer> {
    const offer = await this.findOne(id);

    // Check if user has permission to update this offer
    if (offer.brandId !== brandId) {
      throw new ForbiddenException('You can only update your own offers');
    }

    Object.assign(offer, updateOfferDto);
    return this.offerRepository.save(offer);
  }

  async remove(id: string, brandId: string): Promise<void> {
    const offer = await this.findOne(id);

    // Check if user has permission to delete this offer
    if (offer.brandId !== brandId) {
      throw new ForbiddenException('You can only delete your own offers');
    }

    await this.offerRepository.remove(offer);
  }
}
