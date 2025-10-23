import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { PlansModule } from './plans/plans.module';
import { OffersModule } from './offers/offers.module';
import { StripeModule } from './stripe/stripe.module';
import { UploadModule } from './upload/upload.module';
import { Brand } from './brands/entities/brand.entity';
import { Plan } from './plans/entities/plan.entity';
import { Offer } from './offers/entities/offer.entity';
import { User } from './auth/entities/user.entity';
import { Subscription } from './plans/entities/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'brand_ambassador_saas',
      entities: [Brand, Plan, Offer, User, Subscription],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    BrandsModule,
    PlansModule,
    OffersModule,
    StripeModule,
    UploadModule,
  ],
})
export class AppModule {}
