import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingConnection } from './entities/messaging-connection.entity';
import { EmailService } from './email.service';
import { MessagingConnectionStatus, MessagingProvider, MessageChannel } from '@steward/shared';

@Injectable()
export class MessagingScheduler {
  private readonly logger = new Logger(MessagingScheduler.name);

  constructor(
    @InjectRepository(MessagingConnection)
    private readonly connections: Repository<MessagingConnection>,
    private readonly email: EmailService,
  ) {}

  /** Poll IMAP inboxes every 5 minutes for SMTP connections */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async pollImapInboxes(): Promise<void> {
    const smtpConnections = await this.connections.find({
      where: {
        channel: MessageChannel.EMAIL,
        provider: MessagingProvider.SMTP,
        status: MessagingConnectionStatus.ACTIVE,
      },
    });

    for (const conn of smtpConnections) {
      try {
        await this.email.pollSmtpInbox(conn);
      } catch (err) {
        this.logger.error(`IMAP poll failed for ${conn.id}: ${(err as Error).message}`);
      }
    }
  }
}
