import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientComplianceDto } from './dto/client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@Request() req: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clients for the advisor' })
  findAll(@Request() req: any) {
    return this.clientsService.findAllByAdvisor(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single client with portfolios and ROAs' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(id, req.user.id);
  }

  @Patch(':id/compliance')
  @ApiOperation({ summary: 'Update client compliance and KYC status' })
  updateCompliance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClientComplianceDto,
  ) {
    return this.clientsService.updateCompliance(id, req.user.id, dto);
  }

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Get client compliance status' })
  async getCompliance(@Request() req: any, @Param('id') id: string) {
    const client = await this.clientsService.findOne(id, req.user.id);
    return this.clientsService.getComplianceStatus(client);
  }
}
