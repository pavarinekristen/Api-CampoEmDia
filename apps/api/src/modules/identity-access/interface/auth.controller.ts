import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterTenantUseCase } from '../application/use-cases/register-tenant.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Rotas públicas (fora do JwtAuthGuard) — é justamente aqui que a conta e o
 * tenant são criados / a sessão é obtida.
 */
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerTenant: RegisterTenantUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterTenantDto) {
    return this.registerTenant.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDto) {
    return this.login.execute(dto);
  }
}
