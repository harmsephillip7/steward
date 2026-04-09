import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  advisor_id: string;

  @Column({ nullable: true })
  client_id: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  timestamp: Date;
}
