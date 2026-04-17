import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty() @IsOptional() @IsUUID() client_id?: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsOptional() @IsString() category?: string;
  @ApiProperty() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() file_url: string;
  @ApiProperty() @IsOptional() @IsString() mime_type?: string;
  @ApiProperty() @IsOptional() @IsNumber() file_size?: number;
  @ApiProperty() @IsOptional() @IsDateString() expiry_date?: string;
  @ApiProperty() @IsOptional() metadata?: Record<string, any>;
}

export class UpdateDocumentDto {
  @ApiProperty() @IsOptional() @IsString() name?: string;
  @ApiProperty() @IsOptional() @IsString() type?: string;
  @ApiProperty() @IsOptional() @IsString() category?: string;
  @ApiProperty() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsOptional() @IsDateString() expiry_date?: string;
  @ApiProperty() @IsOptional() metadata?: Record<string, any>;
}
