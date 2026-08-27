import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Lógica pura de decisão — extraída para ser testável sem precisar
 * instanciar o Nest (mesmo padrão de tenant-scoping.ts para o filtro de
 * tenant).
 */
export function hasRequiredRole(userRole: string | undefined, requiredRoles: string[] | undefined): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true; // endpoint sem @Roles() — livre pra qualquer autenticado
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/** Roda depois do JwtAuthGuard: `@UseGuards(JwtAuthGuard, RolesGuard)`. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role as string | undefined;

    if (!hasRequiredRole(userRole, requiredRoles)) {
      throw new ForbiddenException('Seu papel não tem permissão para esta operação.');
    }
    return true;
  }
}
