import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

export enum PlanType {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PlanType, unique: true })
  type: PlanType;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ type: 'json' })
  features: {
    ambassador: string[];
    brand: string[];
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions: Subscription[];
}
