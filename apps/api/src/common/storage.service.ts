import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

/**
 * Storage abstraction: Cloudflare R2 in production, local disk in dev.
 *
 * Configure with:
 *   STORAGE_DRIVER=r2|local        (default: local)
 *   STORAGE_LOCAL_DIR=./uploads    (only when local)
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET
 *   R2_PUBLIC_BASE_URL  (optional, e.g. https://files.steward.app)
 *
 * R2 is loaded lazily so the app starts cleanly without `@aws-sdk/client-s3`
 * installed during dev.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private r2Client: any | null = null;

  constructor(private readonly config: ConfigService) {}

  private get driver(): 'r2' | 'local' {
    const d = (this.config.get<string>('STORAGE_DRIVER') || 'local').toLowerCase();
    return d === 'r2' ? 'r2' : 'local';
  }

  private get localDir(): string {
    return this.config.get<string>('STORAGE_LOCAL_DIR') || path.join(process.cwd(), 'uploads');
  }

  private async getR2() {
    if (this.r2Client) return this.r2Client;
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 storage configured but R2_* env vars missing');
    }
    // Lazy import so dev works without the dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client } = require('@aws-sdk/client-s3');
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
    return this.r2Client;
  }

  /** Upload bytes and return a stable key + best-effort URL. */
  async put(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ key: string; url: string; sha256: string }> {
    const sha256 = createHash('sha256').update(body).digest('hex');

    if (this.driver === 'r2') {
      const client = await this.getR2();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PutObjectCommand } = require('@aws-sdk/client-s3');
      const bucket = this.config.get<string>('R2_BUCKET');
      if (!bucket) throw new Error('R2_BUCKET env var not set');
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          Metadata: { sha256 },
        }),
      );
      const base = this.config.get<string>('R2_PUBLIC_BASE_URL');
      const url = base ? `${base.replace(/\/$/, '')}/${key}` : `/storage/${key}`;
      return { key, url, sha256 };
    }

    // local
    const fullPath = path.join(this.localDir, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, body);
    return { key, url: `/storage/${key}`, sha256 };
  }

  async get(key: string): Promise<Buffer> {
    if (this.driver === 'r2') {
      const client = await this.getR2();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { GetObjectCommand } = require('@aws-sdk/client-s3');
      const bucket = this.config.get<string>('R2_BUCKET');
      const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const chunks: Buffer[] = [];
      for await (const c of out.Body as AsyncIterable<Buffer>) chunks.push(c);
      return Buffer.concat(chunks);
    }
    return fs.readFile(path.join(this.localDir, key));
  }

  async delete(key: string): Promise<void> {
    if (this.driver === 'r2') {
      const client = await this.getR2();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      const bucket = this.config.get<string>('R2_BUCKET');
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      return;
    }
    await fs.rm(path.join(this.localDir, key), { force: true });
  }
}
