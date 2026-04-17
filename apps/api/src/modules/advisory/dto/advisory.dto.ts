import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateAdvisoryDto {
  @ApiProperty() @IsUUID() client_id: string;
  @ApiProperty() @IsOptional() @IsString() focus_area?: string; // optional: 'retirement', 'insurance', 'tax', 'estate', etc.
}

export class UpdateRecommendationDto {
  @ApiProperty() @IsOptional() @IsString() status?: string;
  @ApiProperty() @IsOptional() @IsString() dismiss_reason?: string;
  @ApiProperty() @IsOptional() @IsArray() action_items?: { step: string; completed: boolean }[];
}
