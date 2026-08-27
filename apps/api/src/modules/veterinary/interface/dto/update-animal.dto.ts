import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateAnimalDto } from './create-animal.dto';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  /** Concorrência otimista opcional — se enviado e não bater com o atual, retorna 409. */
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
