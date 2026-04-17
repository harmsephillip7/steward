import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DependentRelationship } from '@steward/shared';
import { Client } from './client.entity';

@Entity('dependents')
export class Dependent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.dependents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: DependentRelationship })
  relationship: DependentRelationship;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ default: false })
  is_student: boolean;

  @Column({ default: false })
  special_needs: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthly_support_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
