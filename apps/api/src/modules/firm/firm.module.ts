import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmController } from './firm.controller';
import { FirmService } from './firm.service';
import { Firm, FirmMember, Team, TeamMember } from './entities/firm.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Firm, FirmMember, Team, TeamMember]), AuditModule],
  controllers: [FirmController],
  providers: [FirmService],
  exports: [FirmService],
})
export class FirmModule {}
