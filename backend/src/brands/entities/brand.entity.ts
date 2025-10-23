import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Subscription } from '../../plans/entities/subscription.entity';

export enum PlanType {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  companyName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  appName: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ nullable: true })
  typography: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.brand)
  user: User;

  @OneToMany(() => Offer, offer => offer.brand)
  offers: Offer[];

  @OneToMany(() => Subscription, subscription => subscription.brand)
  subscriptions: Subscription[];
}
