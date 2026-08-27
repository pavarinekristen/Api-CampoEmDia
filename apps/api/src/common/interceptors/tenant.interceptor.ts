import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../context/tenant-context';

/**
 * Roda depois do JwtAuthGuard (que popula `request.user`). Propaga
 * tenantId/userId/role para o AsyncLocalStorage por toda a duração da
 * requisição, para que qualquer camada inferior (use-cases, repositórios)
 * acesse o contexto sem precisar recebê-lo explicitamente por parâmetro.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { tenantId?: string; userId?: string; role?: string } | undefined;

    if (!user?.tenantId || !user?.userId) {
      throw new UnauthorizedException('Contexto de tenant ausente na requisição.');
    }

    return new Observable((subscriber) => {
      tenantContext.run(
        { tenantId: user.tenantId!, userId: user.userId!, role: user.role ?? 'DESCONHECIDO' },
        () => {
          next
            .handle()
            .subscribe({
              next: (value) => subscriber.next(value),
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
        },
      );
    });
  }
}
