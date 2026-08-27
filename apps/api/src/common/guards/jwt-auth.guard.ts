import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard padrão de autenticação — valida o JWT e popula `request.user` com
 * { userId, tenantId, role }, consumido em seguida pelo TenantInterceptor.
 * A estratégia Passport concreta fica em identity-access/infrastructure.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
