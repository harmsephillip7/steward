import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.svc.findAll(req.user.id);
  }

  @Get('unread-count')
  unreadCount(@Request() req: any) {
    return this.svc.unreadCount(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.svc.markRead(req.user.id, id);
  }

  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.svc.markAllRead(req.user.id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.remove(req.user.id, id);
  }
}
