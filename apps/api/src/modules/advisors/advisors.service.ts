import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisor } from './entities/advisor.entity';

@Injectable()
export class AdvisorsService {
  constructor(
    @InjectRepository(Advisor)
    private readonly repo: Repository<Advisor>,
  ) {}

  findById(id: string): Promise<Advisor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getProfile(id: string): Promise<Advisor> {
    const advisor = await this.repo.findOne({ where: { id } });
    if (!advisor) throw new NotFoundException('Advisor not found');
    return advisor;
  }

  async updateBranding(
    id: string,
    updates: Partial<Pick<Advisor, 'firm_name' | 'logo_url' | 'primary_colour_hex' | 'fsp_number'>>,
  ): Promise<Advisor> {
    await this.repo.update(id, updates);
    return this.getProfile(id);
  }
}
