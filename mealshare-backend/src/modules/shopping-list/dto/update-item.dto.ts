import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  quantity?: string;

  @IsBoolean()
  @IsOptional()
  isPurchased?: boolean;

  @IsNumber()
  @IsOptional()
  estimatedPrice?: number;
}
