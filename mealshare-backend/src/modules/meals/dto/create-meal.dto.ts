import { IsString, IsNotEmpty, IsDateString, IsIn, IsUUID } from 'class-validator';

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsIn(['breakfast', 'lunch', 'dinner'])
  mealType: 'breakfast' | 'lunch' | 'dinner';

  @IsUUID()
  assignedTo: string;
}
