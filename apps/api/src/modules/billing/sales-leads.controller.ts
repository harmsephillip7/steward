import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalesLead } from './entities/sales-lead.entity';

@ApiTags('billing')
@Controller('sales')
export class SalesLeadsController {
  constructor(
    @InjectRepository(SalesLead) private readonly leadRepo: Repository<SalesLead>,
  ) {}

  @Post('leads')
  @ApiOperation({ summary: 'Submit a sales / enterprise enquiry (public)' })
  async create(@Body() body: Partial<SalesLead>) {
    if (!body.email || !body.firm_name || !body.tier_interest) {
      return { ok: false, error: 'email, firm_name and tier_interest are required' };
    }
    const lead = this.leadRepo.create({
      contact_name: body.contact_name ?? '',
      email: body.email,
      phone: body.phone ?? null,
      firm_name: body.firm_name,
      tier_interest: body.tier_interest,
      advisor_count: body.advisor_count ?? null,
      notes: body.notes ?? null,
      status: 'new',
    } as Partial<SalesLead>);
    const result = await this.leadRepo.save(lead);
    const saved = Array.isArray(result) ? result[0] : result;
    return { ok: true, id: saved.id };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('leads')
  list() {
    return this.leadRepo.find({ order: { created_at: 'DESC' } });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('leads/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: SalesLead['status'] }) {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) return null;
    lead.status = body.status;
    return this.leadRepo.save(lead);
  }
}
