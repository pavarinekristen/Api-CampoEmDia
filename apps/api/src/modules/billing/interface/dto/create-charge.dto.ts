import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateChargeDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
