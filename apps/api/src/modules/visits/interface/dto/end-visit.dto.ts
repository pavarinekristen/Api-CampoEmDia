import { IsDateString, IsOptional, IsString } from 'class-validator';

export class EndVisitDto {
  @IsDateString()
  endedAt!: string;

  @IsOptional()
  @IsString()
  summary?: string;
}
