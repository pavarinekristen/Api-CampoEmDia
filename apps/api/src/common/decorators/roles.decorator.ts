import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restringe um endpoint a papéis específicos do tenant. Usar só em
 * operações de gestão/destrutivas (equipe, desativar cliente/propriedade)
 * — o resto do CRUD operacional fica aberto a qualquer usuário autenticado
 * do tenant (ver plano: RBAC leve, não fino).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
