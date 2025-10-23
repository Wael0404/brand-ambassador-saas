import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { Plan } from './plan.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brandId: string;

  @Column()
  planId: string;

  @Column()
  stripeSubscriptionId: string;

  @Column()
  stripeCustomerId: string;

  @Column({ type: 'enum', enum: ['active', 'canceled', 'past_due', 'unpaid'] })
  status: string;

  @Column({ type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp' })
  currentPeriodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Brand, brand => brand.subscriptions)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ManyToOne(() => Plan, plan => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Plan;
}
