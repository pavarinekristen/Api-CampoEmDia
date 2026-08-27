export type UserRole =
  | 'PROFISSIONAL_PROPRIETARIO'
  | 'GESTOR_EQUIPE'
  | 'TECNICO_CAMPO'
  | 'SUPERVISOR_TECNICO'
  | 'CONSULTOR_PARCEIRO';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  private constructor(
    readonly id: string | undefined,
    readonly tenantId: string,
    readonly name: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly role: UserRole,
  ) {}

  static create(params: {
    tenantId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): User {
    if (params.name.trim().length < 2) {
      throw new Error('Nome do usuário é obrigatório.');
    }
    if (!EMAIL_REGEX.test(params.email)) {
      throw new Error('E-mail inválido.');
    }
    return new User(
      undefined,
      params.tenantId,
      params.name.trim(),
      params.email.toLowerCase().trim(),
      params.passwordHash,
      params.role,
    );
  }
}
