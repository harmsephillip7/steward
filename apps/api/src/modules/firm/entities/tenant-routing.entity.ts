import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Control-plane registry that maps a firm to its dedicated infrastructure.
 *
 * Used only for Enterprise tenants. When `database_url` is set, the
 * TenantConnectionManager will route all reads/writes for that firm to a
 * dedicated PostgreSQL instance instead of the shared cluster.
 *
 * Rows are encrypted at column level via the existing ENCRYPTION_KEY.
 * In production, populate via a provisioning script when an Enterprise
 * contract is signed; never edit manually.
 */
@Entity('tenant_routing')
export class TenantRouting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column('uuid')
  firm_id: string;

  /** Encrypted Postgres connection string for the dedicated DB. */
  @Column('text', { nullable: true })
  database_url_encrypted: string | null;

  /** R2 bucket name dedicated to this firm. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  r2_bucket: string | null;

  /** Reference to a secret containing the firm's BYO OpenAI key. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  openai_key_ref: string | null;

  /** Reference to a secret containing the firm's BYO SigniFlow key. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  signiflow_key_ref: string | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  provisioning_status: 'pending' | 'active' | 'migrating' | 'failed' | 'archived';

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
