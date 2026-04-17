import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Firm, FirmMember, Team, TeamMember } from './entities/firm.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FirmService {
  constructor(
    @InjectRepository(Firm) private firmRepo: Repository<Firm>,
    @InjectRepository(FirmMember) private memberRepo: Repository<FirmMember>,
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(TeamMember) private tmRepo: Repository<TeamMember>,
    private audit: AuditService,
  ) {}

  // ── Firm ─────────────────────────────────────────────────────

  async createFirm(advisorId: string, dto: any) {
    const firm = this.firmRepo.create(dto);
    const result = await this.firmRepo.save(firm);
    const saved = Array.isArray(result) ? result[0] : result;
    // Auto-add creator as owner
    await this.memberRepo.save(this.memberRepo.create({ firm_id: saved.id, advisor_id: advisorId, role: 'owner', joined_date: new Date(), permissions: ['*'] }));
    await this.audit.log(advisorId, 'firm_created', 'firm', saved.id);
    return saved;
  }

  async getMyFirm(advisorId: string) {
    const membership = await this.memberRepo.findOne({ where: { advisor_id: advisorId, is_active: true }, relations: ['firm'] });
    if (!membership) return null;
    const firm = await this.firmRepo.findOne({ where: { id: membership.firm_id }, relations: ['members', 'members.advisor', 'teams'] });
    return { ...firm, my_role: membership.role, my_permissions: membership.permissions };
  }

  async updateFirm(advisorId: string, dto: any) {
    const membership = await this.requireRole(advisorId, ['owner', 'admin']);
    const firm = await this.firmRepo.findOne({ where: { id: membership.firm_id } });
    if (!firm) throw new NotFoundException('Firm not found');
    Object.assign(firm, dto);
    return this.firmRepo.save(firm);
  }

  // ── Members ──────────────────────────────────────────────────

  async addMember(advisorId: string, dto: { advisor_id: string; role: string }) {
    const membership = await this.requireRole(advisorId, ['owner', 'admin']);
    const defaultPerms = this.getDefaultPermissions(dto.role);
    const member = this.memberRepo.create({ firm_id: membership.firm_id, advisor_id: dto.advisor_id, role: dto.role, joined_date: new Date(), permissions: defaultPerms });
    return this.memberRepo.save(member);
  }

  async updateMember(advisorId: string, memberId: string, dto: { role?: string; permissions?: string[]; is_active?: boolean }) {
    await this.requireRole(advisorId, ['owner', 'admin']);
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    if (dto.role) member.role = dto.role;
    if (dto.permissions) member.permissions = dto.permissions;
    if (dto.is_active !== undefined) member.is_active = dto.is_active;
    return this.memberRepo.save(member);
  }

  async removeMember(advisorId: string, memberId: string) {
    await this.requireRole(advisorId, ['owner']);
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === 'owner') throw new ForbiddenException('Cannot remove firm owner');
    await this.memberRepo.remove(member);
    return { deleted: true };
  }

  // ── Teams ────────────────────────────────────────────────────

  async createTeam(advisorId: string, dto: { name: string; description?: string; lead_advisor_id?: string }) {
    const membership = await this.requireRole(advisorId, ['owner', 'admin']);
    const team = this.teamRepo.create({ ...dto, firm_id: membership.firm_id });
    return this.teamRepo.save(team);
  }

  async getTeams(advisorId: string) {
    const membership = await this.getMembership(advisorId);
    if (!membership) return [];
    return this.teamRepo.find({ where: { firm_id: membership.firm_id }, relations: ['members', 'members.advisor', 'lead_advisor'] });
  }

  async addTeamMember(advisorId: string, teamId: string, dto: { advisor_id: string; role?: string }) {
    await this.requireRole(advisorId, ['owner', 'admin']);
    const tm = this.tmRepo.create({ team_id: teamId, advisor_id: dto.advisor_id, role: dto.role });
    return this.tmRepo.save(tm);
  }

  async removeTeamMember(advisorId: string, teamId: string, targetAdvisorId: string) {
    await this.requireRole(advisorId, ['owner', 'admin']);
    const tm = await this.tmRepo.findOne({ where: { team_id: teamId, advisor_id: targetAdvisorId } });
    if (!tm) throw new NotFoundException('Team member not found');
    await this.tmRepo.remove(tm);
    return { deleted: true };
  }

  async deleteTeam(advisorId: string, teamId: string) {
    await this.requireRole(advisorId, ['owner', 'admin']);
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    await this.teamRepo.remove(team);
    return { deleted: true };
  }

  // ── Helpers ──────────────────────────────────────────────────

  private async getMembership(advisorId: string) {
    return this.memberRepo.findOne({ where: { advisor_id: advisorId, is_active: true } });
  }

  private async requireRole(advisorId: string, roles: string[]) {
    const m = await this.getMembership(advisorId);
    if (!m) throw new ForbiddenException('Not a firm member');
    if (!roles.includes(m.role)) throw new ForbiddenException(`Requires role: ${roles.join('/')}`);
    return m;
  }

  private getDefaultPermissions(role: string): string[] {
    switch (role) {
      case 'owner': return ['*'];
      case 'admin': return ['firm.manage', 'members.manage', 'teams.manage', 'clients.manage', 'reports.view'];
      case 'advisor': return ['clients.own', 'reports.own'];
      case 'assistant': return ['clients.view', 'tasks.manage'];
      case 'compliance_officer': return ['compliance.manage', 'reports.view', 'audit.view'];
      default: return [];
    }
  }
}
