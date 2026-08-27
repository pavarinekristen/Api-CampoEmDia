import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsObject, IsUUID, ValidateNested } from 'class-validator';

export class SyncOperationDto {
  @IsUUID()
  idempotencyKey!: string;

  @IsIn(['visit', 'evidence', 'task', 'property', 'client'])
  entity!: 'visit' | 'evidence' | 'task' | 'property' | 'client';

  @IsIn(['CREATE', 'UPDATE'])
  operation!: 'CREATE' | 'UPDATE';

  @IsObject()
  payload!: Record<string, unknown>;
}

export class SyncPushDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations!: SyncOperationDto[];
}
