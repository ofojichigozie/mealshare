import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateHouseholdDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
