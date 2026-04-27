import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Advisor } from '../advisors/entities/advisor.entity';
import { FirmMember } from '../firm/entities/firm.entity';
import { LoginDto, RegisterAdvisorDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Advisor)
    private readonly advisorRepo: Repository<Advisor>,
    @InjectRepository(FirmMember)
    private readonly memberRepo: Repository<FirmMember>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterAdvisorDto) {
    const existing = await this.advisorRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An advisor with this email already exists');
    }

    const SALT_ROUNDS = 12;
    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const advisor = this.advisorRepo.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      firm_name: dto.firm_name,
      fsp_number: dto.fsp_number,
    });

    const saved = await this.advisorRepo.save(advisor);
    return this.signToken(saved);
  }

  async login(dto: LoginDto) {
    const advisor = await this.advisorRepo.findOne({ where: { email: dto.email } });
    if (!advisor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, advisor.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(advisor);
  }

  async validateAdvisor(id: string): Promise<Advisor | null> {
    return this.advisorRepo.findOne({ where: { id } });
  }

  private async signToken(advisor: Advisor) {
    const membership = await this.memberRepo.findOne({
      where: { advisor_id: advisor.id, is_active: true },
    });
    const payload = {
      sub: advisor.id,
      email: advisor.email,
      firm_name: advisor.firm_name,
      firm_id: membership?.firm_id ?? null,
      firm_role: membership?.role ?? null,
    };
    return {
      access_token: this.jwtService.sign(payload),
      advisor: {
        id: advisor.id,
        name: advisor.name,
        email: advisor.email,
        firm_name: advisor.firm_name,
        fsp_number: advisor.fsp_number,
        logo_url: advisor.logo_url,
        firm_id: membership?.firm_id ?? null,
        firm_role: membership?.role ?? null,
      },
    };
  }
}
