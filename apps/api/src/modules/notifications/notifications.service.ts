import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async findAll(advisorId: string) {
    return this.repo.find({
      where: { advisor_id: advisorId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async unreadCount(advisorId: string) {
    return this.repo.count({ where: { advisor_id: advisorId, read: false } });
  }

  async create(data: Partial<Notification>) {
    const n = this.repo.create(data);
    return this.repo.save(n);
  }

  async markRead(advisorId: string, id: string) {
    await this.repo.update({ id, advisor_id: advisorId }, { read: true });
    return { success: true };
  }

  async markAllRead(advisorId: string) {
    await this.repo.update({ advisor_id: advisorId, read: false }, { read: true });
    return { success: true };
  }

  async remove(advisorId: string, id: string) {
    await this.repo.delete({ id, advisor_id: advisorId });
    return { success: true };
  }
}
