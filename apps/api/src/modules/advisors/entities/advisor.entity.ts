import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('advisors')
export class Advisor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  firm_name: string;

  @Column('text', { nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  fsp_number: string;

  @Column({ nullable: true })
  primary_colour_hex: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Client, (client) => client.advisor)
  clients: Client[];
}
