import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MessagingConnection } from './entities/messaging-connection.entity';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { EncryptionService } from './encryption.service';
import { MessagingService } from './messaging.service';
import { EmailService } from './email.service';
import { MetaService } from './meta.service';
import { WhatsAppService } from './whatsapp.service';
import { MessagingController } from './messaging.controller';
import { WebhooksController } from './webhooks.controller';
import { MessagingScheduler } from './messaging.scheduler';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([MessagingConnection, Message, MessageTemplate]),
    CrmModule,
  ],
  controllers: [MessagingController, WebhooksController],
  providers: [
    EncryptionService,
    MessagingService,
    EmailService,
    MetaService,
    WhatsAppService,
    MessagingScheduler,
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
