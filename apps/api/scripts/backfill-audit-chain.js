/* eslint-disable */
const { DataSource } = require('typeorm');
const path = require('path');
const dataSource = require(path.join(__dirname, '..', 'dist', 'config', 'data-source.js')).default;

(async () => {
  await dataSource.initialize();
  console.log('Connected.');
  const qr = dataSource.createQueryRunner();
  try {
    // Add columns as nullable / with defaults so legacy rows survive
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS sequence bigint`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_type varchar(32) DEFAULT 'advisor'`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent text`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS correlation_id varchar`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "before" jsonb`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "after" jsonb`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS prev_hash varchar(64) DEFAULT ''`);
    await qr.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS hash varchar(64)`);

    // Backfill: number existing rows by timestamp, mark hashes as legacy
    await qr.query(`
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY timestamp ASC, id ASC) AS rn
        FROM audit_logs
        WHERE sequence IS NULL
      )
      UPDATE audit_logs a
      SET sequence = o.rn,
          prev_hash = COALESCE(prev_hash, ''),
          hash = COALESCE(hash, 'legacy_' || lpad(o.rn::text, 16, '0')),
          actor_type = COALESCE(actor_type, 'advisor')
      FROM ordered o
      WHERE a.id = o.id;
    `);

    // Make sequence NOT NULL + unique
    await qr.query(`ALTER TABLE audit_logs ALTER COLUMN sequence SET NOT NULL`);
    await qr.query(`ALTER TABLE audit_logs ALTER COLUMN hash SET NOT NULL`);
    await qr.query(`CREATE UNIQUE INDEX IF NOT EXISTS audit_logs_sequence_uniq ON audit_logs(sequence)`);

    console.log('Backfill complete.');
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
