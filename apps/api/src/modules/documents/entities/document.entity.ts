import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column('uuid', { nullable: true })
  client_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  type: string; // DocumentType enum

  @Column({ length: 50, default: 'general' })
  category: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 1000 })
  file_url: string;

  @Column({ length: 100, nullable: true })
  mime_type: string;

  @Column('int', { default: 0 })
  file_size: number;

  @Column({ length: 100, nullable: true })
  uploaded_by: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date;

  @ManyToOne(() => Client, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
