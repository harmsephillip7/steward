import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('firms')
export class Firm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  fsp_number: string;

  @Column({ length: 255, nullable: true })
  registration_number: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 500, nullable: true })
  logo_url: string;

  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => FirmMember, fm => fm.firm)
  members: FirmMember[];

  @OneToMany(() => Team, t => t.firm)
  teams: Team[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('firm_members')
export class FirmMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  firm_id: string;

  @Column('uuid')
  advisor_id: string;

  @Column({ length: 50 })
  role: string; // FirmRole enum: owner, admin, advisor, assistant, compliance_officer

  @Column({ default: true })
  is_active: boolean;

  @Column('date', { nullable: true })
  joined_date: Date;

  @Column('jsonb', { nullable: true })
  permissions: string[];

  @ManyToOne(() => Firm, firm => firm.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  firm_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column('uuid', { nullable: true })
  lead_advisor_id: string;

  @OneToMany(() => TeamMember, tm => tm.team)
  members: TeamMember[];

  @ManyToOne(() => Firm, firm => firm.teams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @ManyToOne(() => Advisor, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'lead_advisor_id' })
  lead_advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  team_id: string;

  @Column('uuid')
  advisor_id: string;

  @Column({ length: 50, nullable: true })
  role: string;

  @ManyToOne(() => Team, team => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;
}
