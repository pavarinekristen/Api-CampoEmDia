import { IsIn, IsString, IsUUID } from 'class-validator';

export class CreateUploadUrlDto {
  @IsUUID()
  visitId!: string;

  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;

  @IsIn(['visits'])
  entity!: 'visits';
}
