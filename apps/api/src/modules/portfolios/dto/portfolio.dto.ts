import { IsString, IsArray, IsOptional, ValidateNested, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PortfolioFundDto {
  @ApiProperty()
  @IsUUID()
  fund_id: string;

  @ApiProperty({ description: 'Allocation as a percentage, e.g. 25.5 for 25.5%' })
  @IsNumber()
  @Min(0)
  @Max(100)
  allocation_pct: number;

  @ApiProperty({ required: false })
  value?: number;
}

export class CreatePortfolioDto {
  @ApiProperty()
  @IsUUID()
  client_id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mandate_type?: string;

  @ApiProperty({ type: [PortfolioFundDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioFundDto)
  funds?: PortfolioFundDto[];
}
