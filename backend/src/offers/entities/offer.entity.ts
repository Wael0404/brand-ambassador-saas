import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  externalLink: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  brandId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Brand, brand => brand.offers)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;
}
