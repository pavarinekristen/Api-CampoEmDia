import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TenantType } from '../../domain/entities/tenant.entity';

export class RegisterTenantDto {
  @IsEnum(['AUTONOMO', 'EMPRESA'])
  tenantType!: TenantType;

  @IsString()
  @MinLength(2)
  tenantName!: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsString()
  @MinLength(2)
  ownerName!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(8)
  ownerPassword!: string;
}
