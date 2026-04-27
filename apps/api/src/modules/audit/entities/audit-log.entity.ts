import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type AuditActorType = 'advisor' | 'client' | 'system' | 'integration';

/**
 * AuditLog — tamper-evident, hash-chained audit record.
 *
 * Each row stores `prev_hash` (the hash of the previous row globally) and `hash`
 * (sha256 of `prev_hash || canonical-json(record minus hash columns)`).
 * If any column on any row is mutated after the fact, every subsequent hash
 * stops matching and `verifyChain()` fails — providing FSCA-grade integrity.
 *
 * Inserts must go through AuditService.log() which fills the chain fields
 * inside a transaction. Direct repository.save() should not be used.
 */
@Entity('audit_logs')
@Index(['sequence'])
@Index(['advisor_id', 'timestamp'])
@Index(['client_id', 'timestamp'])
@Index(['action', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Monotonically-increasing global sequence (chain order). */
  @Column({ type: 'bigint', unique: true })
  sequence: string;

  @Column({ nullable: true })
  advisor_id: string;

  @Column({ nullable: true })
  client_id: string;

  @Column({ type: 'varchar', length: 32, default: 'advisor' })
  actor_type: AuditActorType;

  /** Standardised action verb, e.g. `client.created`, `roa.signed`, `auth.login.success`. */
  @Column()
  action: string;

  @Column({ nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true, type: 'text' })
  user_agent: string;

  @Column({ nullable: true })
  correlation_id: string;

  /** Snapshot before the change (entity mutations only). */
  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, unknown>;

  /** Snapshot after the change. */
  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, unknown>;

  /** Free-form metadata not part of before/after. */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  /** Hex sha256 of the previous row's `hash`. Empty string for the genesis row. */
  @Column({ type: 'varchar', length: 64, default: '' })
  prev_hash: string;

  /** Hex sha256 of (prev_hash || canonical-json of all other columns). */
  @Column({ type: 'varchar', length: 64 })
  hash: string;

  @CreateDateColumn()
  timestamp: Date;
}
