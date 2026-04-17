import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('client_portal_users')
export class ClientPortalUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  client_id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ length: 100, nullable: true })
  display_name: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
