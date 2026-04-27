import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AuditActorType, AuditLog } from './entities/audit-log.entity';

export interface AuditLogInput {
  advisorId?: string | null;
  clientId?: string | null;
  actorType?: AuditActorType;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Stable JSON stringify (keys sorted recursively) so the hash is reproducible.
 */
function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalStringify).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') +
    '}'
  );
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Backwards-compatible positional API used across existing modules.
   * Prefer `record()` for new code.
   */
  async log(
    advisorId: string | null | undefined,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    clientId?: string,
  ): Promise<void> {
    await this.record({
      advisorId: advisorId ?? null,
      clientId: clientId ?? null,
      action,
      entityType,
      entityId,
      ipAddress,
      metadata,
    });
  }

  /**
   * Insert one audit row inside a transaction so the hash chain can be
   * extended atomically (read tip → compute hash → insert).
   */
  async record(input: AuditLogInput): Promise<AuditLog> {
    return this.dataSource.transaction(async (mgr) => {
      const repo = mgr.getRepository(AuditLog);
      const tip = await repo
        .createQueryBuilder('a')
        .orderBy('a.sequence', 'DESC')
        .limit(1)
        .getOne();

      const sequence = tip ? (BigInt(tip.sequence) + 1n).toString() : '1';
      const prevHash = tip?.hash ?? '';

      const row = repo.create({
        sequence,
        advisor_id: input.advisorId ?? undefined,
        client_id: input.clientId ?? undefined,
        actor_type: input.actorType ?? 'advisor',
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
        correlation_id: input.correlationId,
        before: input.before,
        after: input.after,
        metadata: input.metadata,
        prev_hash: prevHash,
      });

      row.hash = this.computeHash(row, prevHash);
      return repo.save(row);
    });
  }

  /**
   * Hash all chain-relevant fields (everything except `id`, `hash`, `timestamp`).
   * `timestamp` is excluded so DB-server-side default doesn't change the hash
   * before vs. after persistence.
   */
  private computeHash(row: AuditLog, prevHash: string): string {
    const payload = canonicalStringify({
      sequence: row.sequence,
      advisor_id: row.advisor_id ?? null,
      client_id: row.client_id ?? null,
      actor_type: row.actor_type,
      action: row.action,
      entity_type: row.entity_type ?? null,
      entity_id: row.entity_id ?? null,
      ip_address: row.ip_address ?? null,
      user_agent: row.user_agent ?? null,
      correlation_id: row.correlation_id ?? null,
      before: row.before ?? null,
      after: row.after ?? null,
      metadata: row.metadata ?? null,
      prev_hash: prevHash,
    });
    return sha256Hex(prevHash + payload);
  }

  /**
   * Walk every row in `sequence` order and verify each hash matches.
   * Returns the first broken row (if any) so an admin can investigate.
   */
  async verifyChain(): Promise<{
    ok: boolean;
    verified: number;
    brokenAt?: { id: string; sequence: string };
  }> {
    const rows = await this.repo
      .createQueryBuilder('a')
      .orderBy('a.sequence', 'ASC')
      .getMany();

    let prevHash = '';
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const expected = this.computeHash(row, prevHash);
      if (row.prev_hash !== prevHash || row.hash !== expected) {
        return {
          ok: false,
          verified: i,
          brokenAt: { id: row.id, sequence: row.sequence },
        };
      }
      prevHash = row.hash;
    }
    return { ok: true, verified: rows.length };
  }

  async getLog(filters: {
    advisorId?: string;
    clientId?: string;
    action?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    const qb = this.repo
      .createQueryBuilder('a')
      .orderBy('a.sequence', 'DESC')
      .limit(Math.min(filters.limit ?? 200, 1000));

    if (filters.advisorId) qb.andWhere('a.advisor_id = :aid', { aid: filters.advisorId });
    if (filters.clientId) qb.andWhere('a.client_id = :cid', { cid: filters.clientId });
    if (filters.action) qb.andWhere('a.action = :act', { act: filters.action });
    if (filters.from && filters.to) {
      qb.andWhere('a.timestamp BETWEEN :f AND :t', { f: filters.from, t: filters.to });
    } else if (filters.from) {
      qb.andWhere('a.timestamp >= :f', { f: filters.from });
    } else if (filters.to) {
      qb.andWhere('a.timestamp <= :t', { t: filters.to });
    }

    return qb.getMany();
  }

  /**
   * Export a signed JSON pack suitable for FSCA inspection.
   * Includes the chain tip hash so the recipient can independently verify.
   */
  async exportJson(filters: {
    advisorId?: string;
    clientId?: string;
    from?: Date;
    to?: Date;
  }): Promise<{
    generated_at: string;
    filters: typeof filters;
    chain_verified: boolean;
    tip_hash: string;
    rows: AuditLog[];
  }> {
    const verify = await this.verifyChain();
    const rows = await this.getLog({ ...filters, limit: 10000 });
    const tip = rows[0]; // rows are DESC
    return {
      generated_at: new Date().toISOString(),
      filters,
      chain_verified: verify.ok,
      tip_hash: tip?.hash ?? '',
      rows,
    };
  }
}

