import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Brand } from '../brands/entities/brand.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription } from '../plans/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Plan, Subscription])],
  providers: [StripeService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
