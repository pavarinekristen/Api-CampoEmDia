import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EvidenceType } from '../../domain/entities/evidence.entity';

const EVIDENCE_TYPES: EvidenceType[] = ['TEXTO', 'AUDIO', 'FOTO', 'VIDEO', 'DOCUMENTO'];

export class AddEvidenceDto {
  @IsUUID()
  clientGeneratedId!: string;

  @IsUUID()
  visitId!: string;

  @IsEnum(EVIDENCE_TYPES)
  type!: EvidenceType;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sizeBytes?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
