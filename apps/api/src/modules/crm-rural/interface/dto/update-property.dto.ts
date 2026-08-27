import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreatePropertyDto } from './create-property.dto';

// clientId nunca é editável via update — trocar de dono é uma decisão
// grande demais para caber num PATCH incidental; se for necessário no
// futuro, deve ser uma operação explícita própria (ex: "transferir
// propriedade"), não um campo solto num update genérico.
export class UpdatePropertyDto extends PartialType(OmitType(CreatePropertyDto, ['clientId'] as const)) {
  /** Concorrência otimista opcional — se enviado e não bater com o atual, retorna 409. */
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
