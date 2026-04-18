import {
  IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, IsBoolean, IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadSource, LeadStage, TaskPriority, ActivityType, ProposalStatus } from '@steward/shared';
import type { DiscoveryData, AnalysisData } from '@steward/shared';

export class CreateLeadDto {
  @ApiProperty() @IsString() first_name: string;
  @ApiProperty() @IsString() last_name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() company?: string;
  @ApiProperty({ enum: LeadSource, required: false }) @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @ApiProperty({ enum: LeadStage, required: false }) @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @ApiProperty({ enum: TaskPriority, required: false }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() expected_value?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expected_close_date?: string;
}

export class UpdateLeadDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() first_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() last_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() company?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() expected_value?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expected_close_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() lost_reason?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsObject() discovery_data?: DiscoveryData;
  @ApiProperty({ required: false }) @IsOptional() @IsObject() analysis_data?: AnalysisData;
}

export class CreateActivityDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() lead_id?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() client_id?: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() subject: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() scheduled_at?: string;
}

export class CreateTaskDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() lead_id?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() client_id?: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() due_date?: string;
  @ApiProperty({ enum: TaskPriority, required: false }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiProperty({ enum: LeadStage, required: false }) @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() is_auto?: boolean;
}

export class CreateProposalDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() lead_id?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() client_id?: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() products?: Record<string, any>[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() total_monthly_premium?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() total_lump_sum?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() valid_until?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class UpdateProposalDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(ProposalStatus) status?: ProposalStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() products?: Record<string, any>[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() total_monthly_premium?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() total_lump_sum?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() valid_until?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
