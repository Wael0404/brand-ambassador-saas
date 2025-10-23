import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, PlanType } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async onModuleInit() {
    await this.seedPlans();
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Plan> {
    return this.planRepository.findOne({ where: { id } });
  }

  async findSubscriptionsByBrand(brandId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { brandId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  private async seedPlans() {
    const existingPlans = await this.planRepository.count();
    if (existingPlans > 0) return;

    const plans = [
      {
        type: PlanType.STARTER,
        name: 'Starter',
        price: 99,
        features: {
          ambassador: ['Offer consultation', 'Account management'],
          brand: ['Offer creation', 'User management', 'Plan management'],
        },
      },
      {
        type: PlanType.PRO,
        name: 'Pro',
        price: 199,
        features: {
          ambassador: ['Offer consultation', 'Account management', 'Chat', 'Campaigns'],
          brand: ['Offer creation', 'User management', 'Plan management', 'Chat', 'Campaign management'],
        },
      },
      {
        type: PlanType.ENTERPRISE,
        name: 'Enterprise',
        price: 299,
        features: {
          ambassador: ['Offer consultation', 'Account management', 'Chat', 'Campaigns', 'Payment management'],
          brand: ['Offer creation', 'User management', 'Plan management', 'Chat', 'Campaign management', 'Ambassador payment management'],
        },
      },
    ];

    for (const planData of plans) {
      const plan = this.planRepository.create(planData);
      await this.planRepository.save(plan);
    }
  }
}
