import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsInt,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  RiskProfile,
  TaxResidency,
  MaritalStatus,
  EmploymentStatus,
  HealthStatus,
  DependentRelationship,
  ClientAssetCategory,
  LiabilityCategory,
  InsurancePolicyType,
  InsurancePolicyStatus,
  GoalCategory,
  GoalPriority,
  GoalStatus,
  LifeEventType,
  IncomeExpenseType,
  Frequency,
} from '@steward/shared';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tax_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: TaxResidency, required: false })
  @IsOptional()
  @IsEnum(TaxResidency)
  tax_residency?: TaxResidency;

  @ApiProperty({ enum: RiskProfile, required: false })
  @IsOptional()
  @IsEnum(RiskProfile)
  risk_profile?: RiskProfile;
}

export class UpdateClientDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() first_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() last_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() id_number?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() tax_number?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dob?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(TaxResidency) tax_residency?: TaxResidency;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(MaritalStatus) marital_status?: MaritalStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsString() spouse_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() spouse_id_number?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() spouse_dob?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(EmploymentStatus) employment_status?: EmploymentStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsString() occupation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() employer?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() industry?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() retirement_age_target?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() smoker?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsEnum(HealthStatus) health_status?: HealthStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() annual_gross_income?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class UpdateClientComplianceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  kyc_complete?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  fica_complete?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  source_of_wealth_declared?: boolean;

  @ApiProperty({ enum: RiskProfile, required: false })
  @IsOptional()
  @IsEnum(RiskProfile)
  risk_profile?: RiskProfile;
}

// ── Sub-entity DTOs ─────────────────────────────────────────────────────────

export class CreateDependentDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: DependentRelationship }) @IsEnum(DependentRelationship) relationship: DependentRelationship;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dob?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() is_student?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() special_needs?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() monthly_support_amount?: number;
}

export class CreateClientAssetDto {
  @ApiProperty({ enum: ClientAssetCategory }) @IsEnum(ClientAssetCategory) category: ClientAssetCategory;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() provider?: string;
  @ApiProperty() @IsNumber() current_value: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() purchase_value?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() purchase_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() account_number?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() monthly_contribution?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class CreateLiabilityDto {
  @ApiProperty({ enum: LiabilityCategory }) @IsEnum(LiabilityCategory) category: LiabilityCategory;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() provider?: string;
  @ApiProperty() @IsNumber() outstanding_balance: number;
  @ApiProperty() @IsNumber() monthly_repayment: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() interest_rate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() maturity_date?: string;
}

export class CreateInsurancePolicyDto {
  @ApiProperty({ enum: InsurancePolicyType }) @IsEnum(InsurancePolicyType) type: InsurancePolicyType;
  @ApiProperty({ required: false }) @IsOptional() @IsString() provider?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() policy_number?: string;
  @ApiProperty() @IsNumber() cover_amount: number;
  @ApiProperty() @IsNumber() monthly_premium: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() inception_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiry_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() beneficiaries?: Record<string, any>[];
  @ApiProperty({ enum: InsurancePolicyStatus, required: false }) @IsOptional() @IsEnum(InsurancePolicyStatus) status?: InsurancePolicyStatus;
}

export class CreateFinancialGoalDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: GoalCategory }) @IsEnum(GoalCategory) category: GoalCategory;
  @ApiProperty() @IsNumber() target_amount: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() current_amount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() target_date?: string;
  @ApiProperty({ enum: GoalPriority, required: false }) @IsOptional() @IsEnum(GoalPriority) priority?: GoalPriority;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() monthly_contribution?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ enum: GoalStatus, required: false }) @IsOptional() @IsEnum(GoalStatus) status?: GoalStatus;
}

export class CreateLifeEventDto {
  @ApiProperty({ enum: LifeEventType }) @IsEnum(LifeEventType) type: LifeEventType;
  @ApiProperty() @IsDateString() event_date: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() financial_impact?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() advice_trigger?: boolean;
}

export class CreateIncomeExpenseDto {
  @ApiProperty({ enum: IncomeExpenseType }) @IsEnum(IncomeExpenseType) type: IncomeExpenseType;
  @ApiProperty() @IsString() category: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiProperty({ enum: Frequency, required: false }) @IsOptional() @IsEnum(Frequency) frequency?: Frequency;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() is_recurring?: boolean;
}
