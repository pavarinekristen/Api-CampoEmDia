import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { tenantContext } from '../context/tenant-context';

/**
 * Injeta o RequestContext (tenantId/userId/role) direto no handler do
 * controller, quando for útil expor explicitamente em vez de acessar via
 * tenantContext.getOrThrow() dentro do caso de uso.
 */
export const CurrentTenant = createParamDecorator((_: unknown, __: ExecutionContext) => {
  return tenantContext.getOrThrow();
});
