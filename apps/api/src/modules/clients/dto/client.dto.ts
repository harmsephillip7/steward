import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RiskProfile, TaxResidency } from '@steward/shared';

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
