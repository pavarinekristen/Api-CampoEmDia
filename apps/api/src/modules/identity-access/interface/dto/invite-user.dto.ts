import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../domain/entities/user.entity';

const USER_ROLES: UserRole[] = [
  'PROFISSIONAL_PROPRIETARIO',
  'GESTOR_EQUIPE',
  'TECNICO_CAMPO',
  'SUPERVISOR_TECNICO',
  'CONSULTOR_PARCEIRO',
];

export class InviteUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(USER_ROLES)
  role!: UserRole;
}
