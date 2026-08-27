import { hasRequiredRole } from './roles.guard';

describe('hasRequiredRole — decisão pura do RBAC leve', () => {
  it('permite qualquer usuário autenticado quando o endpoint não declara @Roles()', () => {
    expect(hasRequiredRole('TECNICO_CAMPO', undefined)).toBe(true);
    expect(hasRequiredRole('TECNICO_CAMPO', [])).toBe(true);
  });

  it('permite quando o papel do usuário está na lista exigida', () => {
    expect(hasRequiredRole('GESTOR_EQUIPE', ['PROFISSIONAL_PROPRIETARIO', 'GESTOR_EQUIPE'])).toBe(true);
  });

  it('nega quando o papel do usuário não está na lista exigida', () => {
    expect(hasRequiredRole('TECNICO_CAMPO', ['PROFISSIONAL_PROPRIETARIO', 'GESTOR_EQUIPE'])).toBe(false);
  });

  it('nega quando não há usuário/papel (defesa contra request malformado)', () => {
    expect(hasRequiredRole(undefined, ['PROFISSIONAL_PROPRIETARIO'])).toBe(false);
  });
});
