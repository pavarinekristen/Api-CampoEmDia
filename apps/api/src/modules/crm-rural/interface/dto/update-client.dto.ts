import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  /** Concorrência otimista opcional — se enviado e não bater com o atual, retorna 409. */
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
