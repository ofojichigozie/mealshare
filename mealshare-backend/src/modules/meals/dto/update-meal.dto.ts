import { IsString, IsOptional, IsDateString, IsIn, IsUUID } from 'class-validator';

export class UpdateMealDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsIn(['breakfast', 'lunch', 'dinner'])
  @IsOptional()
  mealType?: 'breakfast' | 'lunch' | 'dinner';

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}
