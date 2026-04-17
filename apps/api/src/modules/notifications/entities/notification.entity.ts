import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ length: 50 })
  type: string; // compliance_due, task_due, lead_update, system, advisory

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  link: string; // e.g. /clients/123 or /compliance/dashboard

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
